export const plantillaContacto = (nombre,email,numero,mensaje)=>{
    const plantillac = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html dir="ltr" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="en">
     <head>
      <meta charset="UTF-8">
      <meta content="width=device-width, initial-scale=1" name="viewport">
      <meta name="x-apple-disable-message-reformatting">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta content="telephone=no" name="format-detection">
      <title>Postulantes</title><!--[if (mso 16)]>
        <style type="text/css">
        a {text-decoration: none;}
        </style>
        <![endif]--><!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--><!--[if gte mso 9]>
    <xml>
        <o:OfficeDocumentSettings>
        <o:AllowPNG></o:AllowPNG>
        <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
      <style type="text/css">
    #outlook a {
        padding:0;
    }
    .es-button {
        mso-style-priority:100!important;
        text-decoration:none!important;
    }
    a[x-apple-data-detectors] {
        color:inherit!important;
        text-decoration:none!important;
        font-size:inherit!important;
        font-family:inherit!important;
        font-weight:inherit!important;
        line-height:inherit!important;
    }
    .es-desk-hidden {
        display:none;
        float:left;
        overflow:hidden;
        width:0;
        max-height:0;
        line-height:0;
        mso-hide:all;
    }
    td .es-button-border:hover a.es-button-1618490135548 {
        background:#adadad!important;
        border-color:#adadad!important;
    }
    td .es-button-border-1618490135548:hover {
        border-style:solid solid solid solid!important;
        background:#adadad!important;
        border-color:#42d159 #42d159 #42d159 #42d159!important;
    }
    @media only screen and (max-width:600px) 
    {p, ul li, ol li, a { line-height:150%!important } 
    h1, h2, h3, h1 a, h2 a, h3 a { line-height:120% } 
    h1 { font-size:30px!important; text-align:center } 
    h2 { font-size:26px!important; text-align:center } 
    h3 { font-size:20px!important; text-align:center } 
    .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } 
    .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important } 
    .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } 
    .es-menu td a { font-size:12px!important } 
    .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:14px!important } 
    .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:14px!important } 
    .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:12px!important } 
    .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } 
    *[class="gmail-fix"] { display:none!important } 
    .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } 
    .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } 
    .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } 
    .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } 
    .es-button-border { display:block!important } 
    a.es-button, button.es-button { font-size:20px!important; display:block!important; border-left-width:0px!important; border-right-width:0px!important } 
    .es-adaptive table, .es-left, .es-right { width:100%!important } 
    .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } 
    .es-adapt-td { display:block!important; width:100%!important } 
    .adapt-img { width:100%!important; height:auto!important } 
    .es-m-p0 { padding:0!important } .es-m-p0r { padding-right:0!important } 
    .es-m-p0l { padding-left:0!important } 
    .es-m-p0t { padding-top:0!important } 
    .es-m-p0b { padding-bottom:0!important } 
    .es-m-p20b { padding-bottom:20px!important } 
    .es-mobile-hidden, .es-hidden { display:none!important } 
    tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-m-p5 { padding:5px!important } .es-m-p5t { padding-top:5px!important } .es-m-p5b { padding-bottom:5px!important } .es-m-p5r { padding-right:5px!important } .es-m-p5l { padding-left:5px!important } .es-m-p10 { padding:10px!important } .es-m-p10t { padding-top:10px!important } .es-m-p10b { padding-bottom:10px!important } .es-m-p10r { padding-right:10px!important } .es-m-p10l { padding-left:10px!important } .es-m-p15 { padding:15px!important } .es-m-p15t { padding-top:15px!important } .es-m-p15b { padding-bottom:15px!important } .es-m-p15r { padding-right:15px!important } .es-m-p15l { padding-left:15px!important } .es-m-p20 { padding:20px!important } .es-m-p20t { padding-top:20px!important } .es-m-p20r { padding-right:20px!important } .es-m-p20l { padding-left:20px!important } .es-m-p25 { padding:25px!important } .es-m-p25t { padding-top:25px!important } .es-m-p25b { padding-bottom:25px!important } .es-m-p25r { padding-right:25px!important } .es-m-p25l { padding-left:25px!important } .es-m-p30 { padding:30px!important } .es-m-p30t { padding-top:30px!important } .es-m-p30b { padding-bottom:30px!important } .es-m-p30r { padding-right:30px!important } .es-m-p30l { padding-left:30px!important } .es-m-p35 { padding:35px!important } .es-m-p35t { padding-top:35px!important } .es-m-p35b { padding-bottom:35px!important } .es-m-p35r { padding-right:35px!important } .es-m-p35l { padding-left:35px!important } .es-m-p40 { padding:40px!important } .es-m-p40t { padding-top:40px!important } .es-m-p40b { padding-bottom:40px!important } .es-m-p40r { padding-right:40px!important } .es-m-p40l { padding-left:40px!important } .es-desk-hidden { display:table-row!important; width:auto!important; overflow:visible!important; max-height:inherit!important } }
    </style>
     </head>
     <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
      <div dir="ltr" class="es-wrapper-color" lang="en" style="background-color:#F6F6F6"><!--[if gte mso 9]>
                <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                    <v:fill type="tile" color="#f6f6f6"></v:fill>
                </v:background>
            <![endif]-->
       <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top;background-color:#f6f6f6" role="none">
         <tr>
          <td valign="top" style="padding:0;Margin:0">
           <table cellpadding="0" cellspacing="0" class="es-header" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
             <tr>
              <td align="center" style="padding:0;Margin:0">
               <table class="es-header-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" bgcolor="#FFFFFF" role="none">
                 <tr>
                  <td align="left" style="Margin:0;padding-top:15px;padding-bottom:15px;padding-left:20px;padding-right:20px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td align="center" valign="top" style="padding:0;Margin:0;width:560px">
                       <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                         <tr>
                          <td align="left" style="padding:0;Margin:0;font-size:0px">
                            <a target="_blank" href="" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#3D7781;font-size:14px">
                              <img src="" alt="Logo" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" title="Logo"  width="100"></a></td>
                         </tr>
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
               </table></td>
             </tr>
           </table>
           <table cellpadding="0" cellspacing="0" class="es-content" align="center" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%">
             <tr>
              <td align="center" style="padding:0;Margin:0">
               <table class="es-content-body" align="center" cellpadding="0" cellspacing="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#ffffff;border-radius:20px;background-repeat:no-repeat;width:600px;background-image:url(https://zmozcb.stripocdn.email/content/guids/CABINET_7e1f4b0db5d34f00a5f48265da918902/images/9621627291975543.png);background-position:center top" background="https://zmozcb.stripocdn.email/content/guids/CABINET_7e1f4b0db5d34f00a5f48265da918902/images/9621627291975543.png" bgcolor="#ffffff" role="none">
                 <tr>
                  <td align="left" style="Margin:0;padding-bottom:20px;padding-left:20px;padding-right:20px;padding-top:30px;border-radius:20px 20px 0px 0px">
                   <table cellpadding="0" cellspacing="0" width="100%" role="none" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                     <tr>
                      <td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:560px">
                       <table cellpadding="0" cellspacing="0" width="60%" style="margin:auto; mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:1px" role="presentation">
                         <tr>
                          <td align="left" class="es-m-txt-l" style="padding:0;Margin:0;padding-top:10px; background-color: #ffffff;">
                              <p>Nombre: ${nombre}</p>
                              <p>Correo Electronico: ${email}</p>
                              <p>Numero: ${numero}</p>
                              <p>Mensaje:  ${mensaje}</p>
                          </td>
                         </tr>
                         
                       </table></td>
                     </tr>
                   </table></td>
                 </tr>
           </table>
          
          </td>
         </tr>
       </table>
       <table class="footer" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top">
        <tr>
            <td align="center" style="padding:0;Margin:0">
                <table class="ver" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;">
                    <tr>
                        <td align="left" bgcolor="#f6f6f6" style="padding:0;Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;background-color:#f6f6f6">
                            <table cellpadding="0" cellspacing="0" width="100%" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                <tr>
                                    <td align="center" valign="top" style="padding:0;Margin:0;width:660px">
                                        <table cellpadding="0" cellspacing="0" width="100%" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                          <tr>
                                            <td style="font-family: 'Noto Sans', sans-serif; font-size:14px; color:#FFFFFF;  text-align: center;"><table width="585" border="0" cellspacing="0" cellpadding="0">
                                              <tr class="contactenos">
                                                
                                              </tr>
                                            </table></td>
                                
                                        </tr>
                                            <tr>
                                                <td align="center" style="padding:0;Margin:0;font-size:0">
                                                    <table border="0" width="100%" height="100%" cellpadding="0" cellspacing="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px">
                                                        <tr>
                                                            <td style="padding:0;Margin:0;border-bottom:1px solid #cccccc;background:unset;height:1px;width:100%;margin:0px"></td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                      <td valign="top" style="padding: 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%; background-color:#f6f6f6">
                        <table  width="100%" border="0" align="center" cellpadding="0" cellspacing="0" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                        <tbody>
                          <tr>
                            <td width="55%" valign="top" style="padding: 0 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%; v">
                              <table width="100%" border="0" cellpadding="0" cellspacing="0"  style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                              <tbody>
                                <tr>
                                  <td valign="top" style="padding-top: 0;padding-left: 2px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;color: #858585;font-family: 'Noto Sans', sans-serif;font-size: 12px;line-height: 150%;text-align: center;">
                                    <div style="text-align: left;">
                                      <a href="https://www.facebook.com/profile.php?id=61583033270948" target="_blank" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #000000;font-weight: normal;text-decoration: underline;">
                                          <img alt="rs" class="imgreal" height="30" src="" style="border: 0px;width: 30px;height: 30px;margin: 0px;outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;" width="30"/>
                                      </a>&nbsp;&nbsp;
                                      <a href="https://www.instagram.com/saludhelfen/" target="_blank" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #000000;font-weight: normal;text-decoration: underline;">
                                          <img alt="rs" class="imgreal" height="30" src="" style="border: 0px;width: 30px;height: 30px;margin: 0px;outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;" width="30"/>
                                      </a>&nbsp;&nbsp;
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table></td>
                            <td width="45%" valign="top"  style=" background-color:#f6f6f6; padding: 5px 9px;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                              <table  width="100%" align="right" border="0" cellpadding="0" cellspacing="0" style="border-collapse: collapse;mso-table-lspace: 0pt;mso-table-rspace: 0pt;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;">
                              <tbody>
                                <tr>
                                  <td valign="top" style="  background-color:#f6f6f6 font-size: 11px;line-height: 200%;text-align: right;mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;color: #808080;font-family: 'Noto Sans', sans-serif;">
                                    <div style="text-align: right;">
                                     <a href="" target="_blank" style="mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;color: #000000;font-weight: normal;text-decoration: underline;text-align: right;">
                                        <img alt="rs" class="imgreallogo" src="" style="border: 0px; margin: 0px;float: right;outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;" width="174"/>
                                     </a>
                                    </div>
                                  </td>
                                </tr>
                              </tbody>
                            </table></td>
                          </tr>
                        </tbody>
                      </table></td>
            </tr>
                      <tr>
          
                          <td valign="top" style=" background-color:#f6f6f6; padding: 0px 18px 9px;color: #666666;font-family: 'Noto Sans', sans-serif; mso-line-height-rule: exactly;-ms-text-size-adjust: 100%;-webkit-text-size-adjust: 100%;word-break: break-word;font-size: 12px;line-height: 150%;text-align: center;">
          
                              <div style="text-align: center; font-size:13px; font-weight:300; line-height:21px;">VISITA NUESTRO SITIO WEB <br />
                                <a href="https://HELFEMSALUD.com" target="_blank" style="text-decoration: none; color: #005BAE; font-size: 14px;">bpo-center.com</a>&nbsp;<br />
          &nbsp; </div>
          
                          </td>
                      </tr>
                </table>
            </td>
        </tr>
    </table>
      </div>
     </body>
    </html>`;
   
    return plantillac

}