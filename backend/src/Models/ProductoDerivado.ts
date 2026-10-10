// Utilidades SQL para derivar campos de producto que en la BD normalizada ya no
// son columnas de la tabla `producto`:
//   - nombreGenerico y concentracion provienen del PRIMER principio activo
//     (producto_principio_activo + principio_activo).
// Se usan subconsultas escalares correlacionadas al idProducto; el alias de la
// tabla producto de la consulta externa se pasa como parámetro.

/** Subconsulta escalar: nombre del primer principio activo de un producto. */
export function sqlNombreGenerico(aliasProducto: string): string {
    return `(
        SELECT pa_d.nombre
        FROM producto_principio_activo ppa_d
        INNER JOIN principio_activo pa_d ON pa_d.idPrincipioActivo = ppa_d.idPrincipioActivo
        WHERE ppa_d.idProducto = ${aliasProducto}.idProducto
        ORDER BY ppa_d.idPrincipioActivo ASC
        LIMIT 1
    )`;
}

/** Subconsulta escalar: concentración del primer principio activo de un producto. */
export function sqlConcentracion(aliasProducto: string): string {
    return `(
        SELECT ppa_d.concentracion
        FROM producto_principio_activo ppa_d
        WHERE ppa_d.idProducto = ${aliasProducto}.idProducto
        ORDER BY ppa_d.idPrincipioActivo ASC
        LIMIT 1
    )`;
}