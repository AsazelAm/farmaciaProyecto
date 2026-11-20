# Farmacia Dr. Osvaldo — Control de lotes vencidos y bajas

Backend: Node.js + Express + TypeScript + MariaDB (`mariadb` driver, pool de conexiones, `InnoDB`, `utf8mb4`).
Base de datos: `dbfarmacia`. Tabla física de bajas: **`mermalote`** (ya presente en tu dump).
Prefijo de rutas: `/api/BajaLoteVencido` (alias: `/api/MermaLote`).

---

## Adaptación al dump `dbfarmacia19-11-2026.sql`

Comparación estructural contra `dbfarmacia13-11-26.sql`:

| Hallazgo | Impacto | Acción tomada |
| --- | --- | --- |
| La tabla de bajas **ya existe como `mermalote`** (0 filas), con la misma estructura que se había modelado como `bajalotevencido`. | Crear `bajalotevencido` habría duplicado la entidad y el código habría fallado en runtime. | Todo el SQL apunta ahora a `mermalote`. La migración `backend/sql/001_mermalote.sql` es idempotente y respeta los nombres reales de FK/CHECK. |
| Roles activos en `tipous`: `Admin`, `VendedorFarmaceutico`, `EncargadoInventario` (sin cambios). | — | Se conservan tal cual en `roles.ts`, rutas, controlador y servicio. |
| `usuario.idSucursal` sigue siendo `NOT NULL`. | — | El alcance por sede añadido a `authenticate` sigue siendo válido. |
| No hay vistas ni triggers nuevos; el resto de tablas solo cambiaron `AUTO_INCREMENT`. | — | Ningún ajuste adicional. |

> Los archivos TypeScript conservan el prefijo `BajaLoteVencido*` por legibilidad funcional, pero **la tabla que consultan es `mermalote`**.
>
> Nota: analicé la versión definitiva del dump reexportada el **19/11/2026 20:31:56** (idéntica en `Downloads` y en la raíz del repo). Versiones anteriores de ese mismo nombre tenían otros roles; esta documentación refleja la definitiva.

---

## 0. Decisión de modelo: `producto.stockTotal`

`producto.stockTotal` **existe como columna**, por lo que se conserva como *snapshot* materializado, pero se recalcula con una sola regla, centralizada en `backend/src/Models/StockModels.ts`:

```sql
UPDATE producto p
SET stockTotal = (
    SELECT COALESCE(SUM(l.stock), 0)
    FROM lote l
    WHERE l.idProducto = p.idProducto
      AND l.estado = 'activo'
      AND l.fechaVencimiento > CURDATE()
)
WHERE p.idProducto = ?;
```

**Resultado:** `stockTotal` es exactamente el stock vendible. Nunca suma lotes vencidos (`fechaVencimiento <= CURDATE()`), en cuarentena, pendientes, devueltos ni cancelados. Es la misma condición que usa el POS (`CONDICION_LOTE_VENDIBLE`), así que el snapshot y lo que realmente se puede dispensar no pueden divergir.

Esta regla se aplicó también a los flujos ya existentes:

| Módulo | Cambio |
| --- | --- |
| `VentaModels.ts` | Los 4 `SELECT` de selección FEFO llevan `estado = 'activo' AND fechaVencimiento > CURDATE()`; `VerificarStockLote`, `AlertaFEFO` y `ValidarFEFODetalles` rechazan lotes vencidos; los 4 recálculos de `stockTotal` usan el helper. |
| `CompraLoteModels.ts` | Los 2 recálculos (completar/cancelar) usan el helper. |
| `DevolucionModels.ts` | Se añadió el recálculo que faltaba y se evita el doble descuento cuando una baja ejecutada ya cubrió la devolución. |
| `DashboardModels.ts` | Las alertas de stock bajo leen `producto.stockTotal` en vez de `SUM(lote.stock)` de lotes `activo`/`pendiente`, para no ocultar productos sin stock vendible. |
| `BajaLoteVencidoService.ts` | Toda ejecución de baja recalcula el stock en la misma transacción. |

---

## 1. Reglas de negocio

### 1.1 Prevención de venta / dispensación

Un lote **solo es dispensable** si:

```sql
l.estado = 'activo' AND l.fechaVencimiento > CURDATE() AND l.stock > 0
```

Nota: `fechaVencimiento <= CURDATE()` se considera vencido (el día de la fecha ya no se vende).
La selección FEFO (`ORDER BY fechaVencimiento ASC, idLote ASC`) corre **después** de aplicar este filtro, dentro de `SELECT ... FOR UPDATE`, para que otro proceso no consuma el mismo stock en medio de la venta.

### 1.2 Detección de vencidos y próximos a vencer

| Modalidad | Condición |
| --- | --- |
| Vencidos pendientes de gestionar | `fechaVencimiento <= CURDATE()` **y** `stock > 0` **y** `estado IN ('pendiente','activo','cuarentena')` **y** `NOT EXISTS` de baja `pendiente`/`aprobada` sobre el lote. |
| Próximos a vencer | `estado = 'activo'`, `stock > 0`, `DATEDIFF(fechaVencimiento, CURDATE()) BETWEEN 0 AND ?` con `? ∈ {30, 60, 90}` y sin baja activa. |

Ambas consultas traen `producto`, `laboratorio`, `presentacion`, `proveedor`, días restantes y `estadoGestion`.

### 1.3 `estado` del lote vs. registro en `mermalote`

Son dos conceptos distintos y complementarios:

- **`lote.estado`** es el *estado físico/operativo* del lote (`activo`, `cuarentena`, `vencido`, `devuelto`, …). Cambia el comportamiento inmediato del inventario y del POS.
- **`mermalote`** es el *expediente de gestión*: quién detectó, quién autorizó, qué acción se tomó, cuántas unidades, cuánto costó y cuál fue la pérdida. Permite auditoría, aprobación y reportes contables.

| Acción (`accionTomada`) | ¿Descuenta `lote.stock`? | `lote.estado` resultante | `montoPerdida` |
| --- | --- | --- | --- |
| `cuarentena` | **No**. Aísla físicamente; el stock sigue contabilizado pero deja de ser vendible. | `cuarentena` (lote completo) | `0` (no hay baja contable todavía) |
| `baja_merma` | Sí, con `WHERE stock >= cantidadAfectada`. | `vencido` (estas acciones solo aplican a lotes vencidos) | `cantidad × costoUnitario` (100 %) |
| `destruccion` | Sí, igual que merma. | Igual que merma | `cantidad × costoUnitario` (100 %) |
| `devolucion_proveedor` | Sí, pero la resolución posterior de la devolución **no vuelve a descontar** lo ya cubierto por la baja. | `devuelto` si stock = 0; `vencido` si sobra stock vencido; si no, `activo` | `costo − nota de crédito prorrateada` |

> Una baja **ejecutada** es terminal: no se anula. Una corrección posterior se hace con un ajuste de inventario nuevo, no borrando el histórico.

### 1.4 Cálculo de `costoUnitario` y `montoPerdida`

- `costoUnitario` es un **snapshot del `lote.precioCompra`** tomado al registrar. El cliente no puede enviarlo: así la pérdida siempre es auditable contra la compra original.
- `montoPerdida` se guarda en el momento de la ejecución y se puede **recalcular** cuando llega la nota de crédito:

```
costoTotal     = cantidadAfectada × costoUnitario

cuarentena                     → 0
baja_merma / destruccion       → costoTotal
devolucion_proveedor sin NC    → costoTotal          (exposición pendiente de recuperar)
devolucion_proveedor con NC    → max(0, costoTotal − montoNC × (subtotalLote / subtotalTotal))
```

El prorrateo por `subtotal` es necesario porque una `devolucionproveedor` puede incluir varios lotes. La NC solo se considera recuperada si `numeroNotaCredito` está presente y la devolución está `aceptada` o `completada`.

Endpoint de ajuste: `PATCH /AjustarPerdida/:idBaja` (solo `Admin`). No mueve stock; solo recalcula `montoPerdida`.

### 1.5 Sincronización transaccional

Toda ejecución ocurre en **una sola transacción SQL**:

1. `SELECT ... FOR UPDATE` sobre `mermalote` JOIN `lote` (mismo orden de bloqueo siempre → evita deadlocks).
2. Validación de estado, autoría, stock y devolución vinculada.
3. `UPDATE lote SET stock = stock - ? WHERE idLote = ? AND stock >= ?` → si `affectedRows = 0`, se lanza error y se hace `rollback` (descuento seguro).
4. `UPDATE lote SET estado = ?`.
5. Recálculo de `producto.stockTotal` con la regla de la sección 0.
6. `UPDATE mermalote SET estado = 'ejecutada', montoPerdida = ?, fechaEjecucion = NOW()`.
7. `commit()`; cualquier error → `rollback()`.

### 1.6 Máquina de estados de la baja

```
pendiente ──aprobar──▶ aprobada ──ejecutar──▶ ejecutada (terminal)
    │                     │
    └────── anular ───────┴──▶ anulada (terminal)
```

- `aprobar` y `ejecutar` requieren `idUsuarioAutoriza` distinto de `idUsuario`, activo y con rol `Admin` o `EncargadoInventario`.
- La ejecución exige que el autorizador sea **el mismo** que aprobó.
- `anular` solo funciona en `pendiente`/`aprobada` y **no toca stock**.

### 1.7 Permisos

| Operación | Roles |
| --- | --- |
| Detección, listado, detalle y reporte | Cualquier usuario autenticado. `VendedorFarmaceutico` ve solo su `idSucursal`. |
| Registrar, aprobar, ejecutar, anular | `Admin`, `EncargadoInventario` |
| Ajustar pérdida por nota de crédito | `Admin` |

---

## 2. Consultas SQL parametrizadas

> Todas las consultas usan `?`. Los fragmentos dinámicos son únicamente listas de `?` generadas a partir de arreglos validados (`estados.map(() => '?')`). El código está en `backend/src/Models/BajaLoteVencidoModels.ts`.

### 2.1 DDL de la nueva tabla

`backend/sql/001_mermalote.sql` crea `mermalote` con PK auto-incremental, 5 FK (`fk_baja_venc_lote`, `fk_baja_venc_sucursal`, `fk_baja_venc_usuario`, `fk_baja_venc_autoriza`, `fk_baja_venc_devprov`), los CHECKs `chk_baja_venc_cantidad`, `chk_baja_venc_costo` y `chk_baja_venc_perdida`, e índices por lote, sucursal, usuario, autorizador y devolución. **En tu dump 19-11-2026 la tabla ya existe**: el script es `CREATE TABLE IF NOT EXISTS`, así que no hace nada.

```bash
mysql -u <user> -p -P 3307 dbfarmacia < backend/sql/001_mermalote.sql
```

### 2.2 Lotes vencidos con stock pendiente de gestionar

```sql
SELECT l.idLote, l.codigo, l.numeroLote, l.stock,
       DATE_FORMAT(l.fechaVencimiento, '%Y-%m-%d') AS fechaVencimiento,
       l.precioCompra, l.estado AS estadoLote,
       pr.nombreComercial, pr.stockTotal, pv.nombre AS proveedor,
       lab.nombre AS laboratorio, pres.nombre AS presentacion,
       DATEDIFF(l.fechaVencimiento, CURDATE()) AS diasRestantes
FROM lote l
INNER JOIN producto     pr   ON pr.idProducto     = l.idProducto
INNER JOIN laboratorio  lab  ON lab.idLaboratorio = pr.idLaboratorio
INNER JOIN presentacion pres ON pres.idPresentacion = pr.idPresentacion
INNER JOIN proveedor    pv   ON pv.idProveedor    = l.idProveedor
WHERE l.fechaVencimiento <= CURDATE()
  AND l.stock > 0
  AND l.estado IN ('pendiente','activo','cuarentena')
  AND NOT EXISTS (
        SELECT 1 FROM mermalote b
         WHERE b.idLote = l.idLote
           AND b.estado IN ('pendiente','aprobada')
      )
  -- filtros opcionales: AND l.idProducto = ? / l.idProveedor = ? / pr.idLaboratorio = ?
ORDER BY l.fechaVencimiento ASC, l.idLote ASC
LIMIT ?;
```

### 2.3 Lotes próximos a vencer (30/60/90 días)

```sql
SELECT /* mismas columnas y JOINs que 2.2 */
FROM lote l
INNER JOIN producto pr /* ... */
WHERE l.estado = 'activo'
  AND l.stock > 0
  AND DATEDIFF(l.fechaVencimiento, CURDATE()) BETWEEN 0 AND ?
  AND NOT EXISTS (
        SELECT 1 FROM mermalote b
         WHERE b.idLote = l.idLote
           AND b.estado IN ('pendiente','aprobada')
      )
ORDER BY l.fechaVencimiento ASC, l.idLote ASC
LIMIT ?;
-- parámetros: [dias ∈ {30,60,90}, limite]
```

### 2.4 Registrar una baja

```sql
INSERT INTO mermalote
    (idLote, idSucursal, idUsuario, idDevolucionProveedor,
     cantidadAfectada, costoUnitario, montoPerdida,
     accionTomada, estado, fechaDeteccion, motivoDetalle)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pendiente', ?, ?);
-- parámetros: [idLote, idSucursal|null, idUsuario, idDevolucion|null,
--              cantidad, costoUnitario, montoEstimado, accion, fechaDeteccion, motivo|null]
```

### 2.5 Flujo transaccional de aprobación / ejecución

```sql
START TRANSACTION;

-- Bloqueo determinista (baja → lote)
SELECT b.idBajaVencimiento, b.idLote, b.idUsuario, b.idUsuarioAutoriza,
       b.idDevolucionProveedor, b.cantidadAfectada, b.costoUnitario,
       b.accionTomada, b.estado, l.idProducto,
       l.stock AS stockLote,
       IF(l.fechaVencimiento <= CURDATE(), 1, 0) AS estaVencido
FROM mermalote b
INNER JOIN lote l ON l.idLote = b.idLote
WHERE b.idBajaVencimiento = ?
FOR UPDATE;

-- Aprobar
UPDATE mermalote
SET estado = 'aprobada', idUsuarioAutoriza = ?, fechaModificacion = NOW()
WHERE idBajaVencimiento = ? AND estado = 'pendiente';

-- Ejecutar (descuento seguro)
UPDATE lote
SET stock = stock - ?, fechaModificacion = NOW()
WHERE idLote = ? AND stock >= ?;          -- verificar affectedRows = 1

UPDATE lote SET estado = ?, fechaModificacion = NOW() WHERE idLote = ?;

UPDATE producto p
SET stockTotal = (
    SELECT COALESCE(SUM(l.stock), 0)
    FROM lote l
    WHERE l.idProducto = p.idProducto
      AND l.estado = 'activo'
      AND l.fechaVencimiento > CURDATE()
)
WHERE p.idProducto = ?;

UPDATE mermalote
SET estado = 'ejecutada', montoPerdida = ?,
    fechaEjecucion = NOW(), fechaModificacion = NOW()
WHERE idBajaVencimiento = ? AND estado = 'aprobada';

COMMIT;   -- ante cualquier error: ROLLBACK
```

### 2.6 Anular antes de la ejecución definitiva

```sql
UPDATE mermalote
SET estado = 'anulada',
    idUsuarioAutoriza = COALESCE(idUsuarioAutoriza, ?),
    motivoDetalle = CONCAT(COALESCE(motivoDetalle, ''), '\n[ANULACIÓN] ', ?),
    fechaModificacion = NOW()
WHERE idBajaVencimiento = ? AND estado IN ('pendiente','aprobada');
```

No hay `UPDATE lote` ni `UPDATE producto`: la baja nunca se ejecutó.
Si el error ocurre **dentro** de la transacción de ejecución, basta el `rollback()`; la anulación es para documentar una baja ya registrada que se decide no ejecutar.

### 2.7 Reporte de mermas/pérdidas por rango de fechas y sucursal

```sql
SELECT b.idBajaVencimiento, b.fechaEjecucion, b.accionTomada,
       b.cantidadAfectada, b.costoUnitario, b.montoPerdida,
       l.numeroLote, pr.nombreComercial, lab.nombre AS laboratorio,
       s.nombre AS sucursal, dp.numeroNotaCredito, dp.montoNotaCredito
FROM mermalote b
INNER JOIN lote       l   ON l.idLote       = b.idLote
INNER JOIN producto   pr  ON pr.idProducto  = l.idProducto
INNER JOIN laboratorio lab ON lab.idLaboratorio = pr.idLaboratorio
LEFT  JOIN sucursal   s   ON s.idSucursal   = b.idSucursal
LEFT  JOIN devolucionproveedor dp ON dp.idDevolucionProveedor = b.idDevolucionProveedor
WHERE b.estado = 'ejecutada'
  AND b.fechaEjecucion IS NOT NULL
  AND DATE(b.fechaEjecucion) BETWEEN ? AND ?
  -- opcional: AND b.idSucursal = ? / b.accionTomada = ? / l.idProducto = ?
ORDER BY b.fechaEjecucion DESC, b.idBajaVencimiento DESC;
```

El servicio devuelve `{ parametros, filas, resumen }` con totales generales, por acción y por sucursal.

---

## 3. Arquitectura recomendada (implementada)

```
backend/
├── sql/001_mermalote.sql                    # DDL idempotente (ya existe en tu dump)
└── src/
    ├── config/db.ts                         # pool mariadb (sin cambios)
    ├── Middleware/
    │   ├── auth.ts                           # + idSucursal en req.user
    │   ├── roles.ts                          # requireRoles(...)
    │   └── validation.ts                     # handleInputErrors (existente)
    ├── Models/
    │   ├── StockModels.ts                    # regla única de stockTotal ★
    │   └── BajaLoteVencidoModels.ts          # repositorio / todas las consultas SQL
    ├── Services/
    │   └── BajaLoteVencidoService.ts         # reglas de negocio + transacciones
    ├── controllers/
    │   └── BajaLoteVencidoControllers.ts     # HTTP request → servicio → response
    ├── Routes/
    │   └── BajaLoteVencidoRoutes.ts          # express-validator + Roles + authenticate
    ├── Utils/errors.ts                       # AppError (400/403/404/409/500)
    └── server.ts                             # app.use('/api/BajaLoteVencido', ...) + alias /api/MermaLote
```

Flujo: **Ruta (validación + roles) → Controlador (parseo) → Servicio (reglas + tx) → Repositorio (SQL parametrizado) → MariaDB**.

### Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/GetLotesVencidos` | Lotes vencidos con stock sin gestionar |
| GET | `/GetProximosAVencer?dias=30\|60\|90` | Alertas de vencimiento próximo |
| GET | `/GetBajas` | Listado paginado de bajas |
| GET | `/GetBaja/:idBaja` | Detalle de una baja |
| POST | `/AddBaja` | Registrar baja (`pendiente`) |
| PATCH | `/AprobarBaja/:idBaja` | `pendiente → aprobada` |
| PATCH | `/EjecutarBaja/:idBaja` | `aprobada → ejecutada` (mueve stock) |
| PATCH | `/AnularBaja/:idBaja` | `pendiente\|aprobada → anulada` |
| PATCH | `/AjustarPerdida/:idBaja` | Recalcular pérdida con NC (solo Admin) |
| GET | `/ReportePerdidas?fechaDesde=&fechaHasta=&idSucursal=` | Reporte de mermas |

### Validaciones clave

| Validación | Dónde | Error |
| --- | --- | --- |
| `idLote`, `cantidadAfectada`, `idUsuarioAutoriza` enteros positivos | Ruta (`express-validator`) + servicio | 400 |
| `cantidadAfectada <= lote.stock` | Servicio (registro) y `UPDATE ... WHERE stock >= ?` (ejecución) | 409 |
| `accionTomada` ∈ enum; `estado` ∈ enum; `dias` ∈ {30,60,90} | Ruta + servicio | 400 |
| Merma/destrucción solo sobre lotes vencidos | Servicio | 409 |
| `devolucion_proveedor` exige devolución vinculada, motivo de vencimiento y cantidad cubierta | Servicio | 400/409 |
| Sin dos bajas activas por lote | Servicio | 409 |
| Autorizador distinto, activo y con rol de gestión | Servicio | 403/409 |
| Transiciones de estado válidas (`WHERE estado = ...` + `affectedRows`) | Repositorio | 409 |
| `fechaDesde/fechaHasta` con formato `YYYY-MM-DD` | Ruta | 400 |

### Puntos de integración ya resueltos

- La devolución a proveedor ya no descuenta dos veces: `resolverProveedor` descuenta solo `cantidad - SUM(bajas ejecutadas)` para ese lote/devolución.
- `authenticate` expone `idSucursal` para que el reporte pueda filtrar por sede sin exponer datos de otras sucursales al farmacéutico.

### Verificación

```bash
cd backend
npm run build     # compilación TypeScript ✔
npm run dev       # monta /api/BajaLoteVencido y /api/MermaLote
```

No hace falta importar el dump ni ejecutar la migración: usa tu `dbfarmacia19-11-2026.sql` tal cual y reinicia el backend.

---

## 4. Frontend (React + Vite + Tailwind)

Vista única con cuatro pestañas: **Bajas registradas**, **Lotes vencidos**, **Próximos a vencer** (30/60/90 días) y **Reporte de pérdidas**. Incluye modales para registrar, ver/aprobar/ejecutar/anular y recalcular la pérdida, con resúmenes, filtros, paginación y toasts.

| Archivo | Contenido |
| --- | --- |
| `front/src/Api/BajaLoteVencidoApi.ts` | Cliente Axios de los 10 endpoints. Parsea respuestas con Zod y lee errores de `message`/`error`. |
| `front/src/types/index.ts` | `EstadoBaja`, `AccionBaja`, esquemas de lotes/bajas/reporte y tipos de filtros. |
| `front/src/view/Dashboard/Admin/Bajas/BajasLotesVencidos.tsx` | Vista, tablas, resúmenes y modales (misma paleta que `Lote.tsx` y `Devolucion.tsx`). |
| `front/src/router.tsx` | Rutas `/Dashboard/BajasLotesVencidos` (Admin) y `BajasLotesVencidos` (Encargado). |
| `front/src/layouts/Aside.tsx` / `AsideE.tsx` | Entrada «Bajas y mermas → Bajas de lotes vencidos». |

### Flujo en la UI

1. **Registrar**: desde un lote vencido/próximo o con «Nueva baja». El front envía solo `idLote`, `cantidadAfectada`, `accionTomada`, `idSucursal`, `idDevolucionProveedor` y `motivoDetalle`. La pérdida mostrada es estimada; el backend la recalcula con el `precioCompra` del lote.
2. **Aprobar / ejecutar**: el modal pide un autorizador distinto del registrador (roles `Admin` o `EncargadoInventario`). La ejecución reutiliza al autorizador que aprobó y avisa de que descontará stock.
3. **Anular**: confirmación dentro de un modal con motivo opcional; disponible solo en `pendiente`/`aprobada`.
4. **Ajustar pérdida**: botón visible solo para `Admin` en bajas ejecutadas por devolución al proveedor.

El botón de escritura aparece solo para `Admin` y `EncargadoInventario`. `VendedorFarmaceutico` no tiene acceso a esta vista desde su menú. Las pestañas de detección y reporte son de solo lectura para cualquier usuario autenticado, y el backend aplica el filtro por `idSucursal` cuando corresponde.

### Verificación

```bash
cd front
npm run build     # tsc -b && vite build ✔
npm run dev       # Vite + HashRouter
```

> Nota: el build del front excluye tres archivos huérfanos que ya no compilaban (`RegisterDocente.tsx`, `Components/DocenteRegistrar/*` y `Helpers/Contenido.tsx`); ninguno está referenciado por el router ni por la nueva vista.
