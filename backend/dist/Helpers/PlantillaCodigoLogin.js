"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.plantillaCodigoLogin = void 0;
const COLOR_AMARILLO = '#EEBA29';
const COLOR_MORADO = '#42137B';
const plantillaCodigoLogin = (nombre, codigo) => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Codigo de verificacion</title>
</head>
<body style="margin:0;padding:0;background-color:${COLOR_AMARILLO};font-family:Arial, Helvetica, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${COLOR_AMARILLO};padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 14px rgba(0,0,0,0.12);">
          <tr>
            <td style="background-color:${COLOR_AMARILLO};padding:22px;text-align:center;">
              <h1 style="margin:0;color:${COLOR_MORADO};font-size:22px;font-weight:bold;">Farmacia Dr Osvaldo</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;">
              <h2 style="margin:0 0 12px;color:${COLOR_MORADO};font-size:19px;text-align:center;">Codigo de verificacion</h2>
              <p style="margin:0 0 20px;color:#4b4b4b;font-size:14px;line-height:20px;text-align:center;">
                Hola <strong>${nombre}</strong>, recibiste este correo porque intentas iniciar sesion en el sistema.
                Ingresa el siguiente codigo para continuar:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:8px 0 24px;">
                    <div style="display:inline-block;background-color:${COLOR_MORADO};color:#ffffff;font-size:34px;font-weight:bold;letter-spacing:12px;padding:14px 22px;border-radius:10px;">
                      ${codigo}
                    </div>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px;color:#4b4b4b;font-size:13px;line-height:19px;text-align:center;">
                Este codigo caduca en <strong>5 minutos</strong>.
              </p>
              <p style="margin:0;color:#8c8c8c;font-size:12px;line-height:18px;text-align:center;">
                Si no fuiste tu, ignora este correo. Nunca compartas este codigo con nadie.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#f4f4f4;padding:16px;text-align:center;">
              <p style="margin:0;color:#8c8c8c;font-size:11px;">Sistema de Gestion de Farmacia</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
exports.plantillaCodigoLogin = plantillaCodigoLogin;
//# sourceMappingURL=PlantillaCodigoLogin.js.map