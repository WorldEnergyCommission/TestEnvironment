CREATE TABLE public.project_invite (
	id uuid NOT NULL,
	project_id uuid NOT NULL,
	created_by uuid NOT NULL,
	created_at timestamptz NOT NULL,
  used_at timestamptz NULL,
	email varchar NOT NULL,
	CONSTRAINT project_invite_pk PRIMARY KEY (id),
	CONSTRAINT project_invite_fk FOREIGN KEY (project_id) REFERENCES public.project(id) ON DELETE CASCADE
);


CREATE TABLE public.email_template (
	name varchar NOT NULL,
	realm varchar NOT NULL,
	email varchar NOT NULL,
	CONSTRAINT email_template_pk PRIMARY KEY (name, realm)
);



insert into email_template values ('invite', 'dev', 
'
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html data-editor-version="2" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <!--<![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <style type="text/css">
        body {
          width: 600px;
          margin: 0 auto;
          font-family: Roboto,sans-serif;
        }
        table {
          border-collapse: collapse;
        }
        table,
        td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }
      </style>
    <![endif]-->
  </head>
  <body>
    <table width="100%" style="width: 100%; max-width: 600px;  font-family: Roboto,sans-serif;" align="center">
      <tbody>
        <tr>
          <td
            role="modules-container"
            style="padding: 0px 0px 0px 0px; color: #000000; text-align: left"
            bgcolor="#ffffff"
            width="100%"
            align="left"
          >
            <table
              role="module"
              data-type="image"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed; margin-block: 1rem"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      font-size: 6px;
                      line-height: 10px;
                      padding: 0px 0px 0px 0px;
                    "
                    valign="top"
                    align="center"
                  >
                    <img
                      border="0"
                      style="
                        display: block;
                        color: #000000;
                        text-decoration: none;
                        font-family: Helvetica, arial, sans-serif;
                        font-size: 16px;
                        max-width: 100% !important;
                        width: 100%;
                        height: auto !important;
                        margin-bottom: 12px;
                      "
                      width="0"
                      alt=""
                      data-proportionally-constrained="true"
                      data-responsive="true"
                      src="https://console.efficientio.io/images/invite/development.jpg"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            &nbsp;
            <table
              role="module"
              data-type="text"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                      background-color: #ff9d00;
                    "
                    height="100%"
                    valign="top"
                    bgcolor="#FF9D00"
                    role="module-content"
                  >
                    <div style="font-family: inherit; text-align: center">
                      <span style="font-size: 30px; color: #fff">
                        Register at EfficientIO - DEV
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                    "
                    height="100%"
                    valign="top"
                    bgcolor=""
                    role="module-content"
                  >
                    <div>
                      <div style="font-family: inherit; text-align: center">
                        You got invited to use the EfficientIO console. To start
                        using it register here:
                      </div>
                      <div></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0px 0px 0px 0px">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tbody>
                        <tr style="text-align: center">
                          <div>
                            <!--[if mso]>
                              <v:roundrect
                                xmlns:v="urn:schemas-microsoft-com:vml"
                                xmlns:w="urn:schemas-microsoft-com:office:word"
                                href="http://console.efficientio.io/#/register?invite=REGISTERID"
                                style="
                                  height: 60px;
                                  v-text-anchor: middle;
                                  width: 200px;
                                "
                                arcsize="10%"
                                strokecolor="#ff9d00"
                                fillcolor="#ff9d00"
                              >
                                <w:anchorlock />
                                <center
                                  style="
                                    color: white;
                                    font-size: 17px;
                                    font-weight: bold;
                                  "
                                >
                                  Register
                                </center>
                              </v:roundrect>
                            <![endif]-->
                            <a
                              href="http://console.efficientio.io/#/register?invite=REGISTERID"
                              style="
                                background-color: #ff9d00;
                                border: 1px solid #ff9d00;
                                border-radius: 6px;
                                color: white;
                                display: inline-block;
                                font-family: sans-serif;
                                font-size: 17px;
                                font-weight: bold;
                                line-height: 40px;
                                text-align: center;
                                text-decoration: none;
                                width: 200px;
                                -webkit-text-size-adjust: none;
                                mso-hide: all;
                              "
                            >
                              Register
                            </a>
                          </div>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <!-- Banner Row -->
                    &nbsp;
                    <div
                      style="
                        color: #444444;
                        font-size: 12px;
                        line-height: 20px;
                        text-align: Center;
                        background-color: #ffd899;
                      "
                    >
                      <p style="font-weight: bold">&copy; EfficientIO GmbH</p>
                      <p>
                        <span>Billrothstraße 4, RG Top 4 & 5</span>,
                        <span>1190</span>, <span>Wien</span>,
                        <span>Österreich</span>
                      </p>
                      <p>
                        <a href="https://www.efficientio.com/" target="_blank"
                          >Web</a
                        >
                        |
                        <a
                          href="https://www.linkedin.com/company/80325191/"
                          target="_blank"
                          >LinkedIn</a
                        >
                        |
                        <a
                          href="https://www.youtube.com/@efficientio2616"
                          target="_blank"
                          >Youtube</a
                        >
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>

');




insert into email_template values ('invite', 'efficientio', '
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html data-editor-version="2" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <!--<![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <style type="text/css">
        body {
          width: 600px;
          margin: 0 auto;
          font-family: Roboto,sans-serif;
        }
        table {
          border-collapse: collapse;
        }
        table,
        td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }
      </style>
    <![endif]-->
  </head>
  <body>
    <table width="100%" style="width: 100%; max-width: 600px;  font-family: Roboto,sans-serif;" align="center">
      <tbody>
        <tr>
          <td
            role="modules-container"
            style="padding: 0px 0px 0px 0px; color: #000000; text-align: left"
            bgcolor="white"
            width="100%"
            align="left"
          >
            <table
              role="module"
              data-type="image"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed; margin-block: 1rem"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      font-size: 6px;
                      line-height: 10px;
                      padding: 0px 0px 0px 0px;
                    "
                    valign="top"
                    align="center"
                  >
                    <img
                      border="0"
                      style="
                        display: block;
                        color: #000000;
                        text-decoration: none;
                        font-family: Helvetica, arial, sans-serif;
                        font-size: 16px;
                        max-width: 100% !important;
                        width: 100%;
                        height: auto !important;
                        margin-bottom: 12px;
                      "
                      width="0"
                      alt=""
                      data-proportionally-constrained="true"
                      data-responsive="true"
                      src="https://console.efficientio.com/images/invite/efficientio.jpg"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            &nbsp;
            <table
              role="module"
              data-type="text"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                      background-color: #03e0b6;
                    "
                    height="100%"
                    valign="top"
                    bgcolor="#03e0b6"
                    role="module-content"
                  >
                    <div style="font-family: inherit; text-align: center">
                      <span style="font-size: 30px; color: #fff">
                        Register at EfficientIO
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                    "
                    height="100%"
                    valign="top"
                    bgcolor=""
                    role="module-content"
                  >
                    <div>
                      <div style="font-family: inherit; text-align: center">
                        You got invited to use the EfficientIO console. To start
                        using it register here:
                      </div>
                      <div></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0px 0px 0px 0px">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tbody>
                        <tr style="text-align: center">
                          <div>
                            <!--[if mso]>
                              <v:roundrect
                                xmlns:v="urn:schemas-microsoft-com:vml"
                                xmlns:w="urn:schemas-microsoft-com:office:word"
                                href="http://console.efficientio.com/#/register?invite=REGISTERID"
                                style="
                                  height: 60px;
                                  v-text-anchor: middle;
                                  width: 200px;
                                "
                                arcsize="10%"
                                strokecolor="#03e0b6"
                                fillcolor="#03e0b6"
                              >
                                <w:anchorlock />
                                <center
                                  style="
                                    color: white;
                                    font-size: 17px;
                                    font-weight: bold;
                                  "
                                >
                                  Register
                                </center>
                              </v:roundrect>
                            <![endif]-->
                            <a
                              href="http://console.efficientio.com/#/register?invite=REGISTERID"
                              style="
                                background-color: #03e0b6;
                                border: 1px solid #03e0b6;
                                border-radius: 6px;
                                color: white;
                                display: inline-block;
                                font-size: 17px;
                                font-weight: bold;
                                line-height: 40px;
                                text-align: center;
                                text-decoration: none;
                                width: 200px;
                                -webkit-text-size-adjust: none;
                                mso-hide: all;
                              "
                            >
                              Register
                            </a>
                          </div>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <!-- Banner Row -->
                    &nbsp;
                    <div
                      style="
                        color: #444444;
                        font-size: 12px;
                        line-height: 20px;
                        text-align: Center;
                        background-color: #fff;
                      "
                    >
                      <p style="font-weight: bold">&copy; EfficientIO GmbH</p>
                      <p>
                        <span>Billrothstraße 4, RG Top 4 & 5</span>,
                        <span>1190</span>, <span>Wien</span>,
                        <span>Österreich</span>
                      </p>
                      <p>
                        <a href="https://www.efficientio.com/" target="_blank"
                          >Web</a
                        >
                        |
                        <a
                          href="https://www.linkedin.com/company/80325191/"
                          target="_blank"
                          >LinkedIn</a
                        >
                        |
                        <a
                          href="https://www.youtube.com/@efficientio2616"
                          target="_blank"
                          >Youtube</a
                        >
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
');

insert into email_template values ('invite', 'smartsitepower', '
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html data-editor-version="2" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <!--<![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <style type="text/css">
        body {
          width: 600px;
          margin: 0 auto;
          font-family: Roboto,sans-serif;
        }
        table {
          border-collapse: collapse;
        }
        table,
        td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }
      </style>
    <![endif]-->
  </head>
  <body>
    <table width="100%" style="width: 100%; max-width: 600px;  font-family: Roboto,sans-serif;" align="center">
      <tbody>
        <tr>
          <td
            role="modules-container"
            style="padding: 0px 0px 0px 0px; color: #000000; text-align: left"
            bgcolor="white"
            width="100%"
            align="left"
          >
            <table
              role="module"
              data-type="image"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed; margin-block: 1rem"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      font-size: 6px;
                      line-height: 10px;
                      padding: 0px 0px 0px 0px;
                    "
                    valign="top"
                    align="center"
                  >
                    <img
                      border="0"
                      style="
                        display: block;
                        color: #000000;
                        text-decoration: none;
                        font-family: Helvetica, arial, sans-serif;
                        font-size: 16px;
                        max-width: 100% !important;
                        width: 100%;
                        height: auto !important;
                        margin-bottom: 12px;
                      "
                      width="0"
                      alt=""
                      data-proportionally-constrained="true"
                      data-responsive="true"
                      src="https://console.smartsitepower.com/images/invite/SSP.jpg"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            &nbsp;
            <table
              role="module"
              data-type="text"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                      background-color: #1B223C;
                    "
                    height="100%"
                    valign="top"
                    bgcolor="#1B223C"
                    role="module-content"
                  >
                    <div style="font-family: inherit; text-align: center">
                      <span style="font-size: 30px; color: #fff">
                        Register at SSP-Console
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                    "
                    height="100%"
                    valign="top"
                    bgcolor=""
                    role="module-content"
                  >
                    <div>
                      <div style="font-family: inherit; text-align: center">
                        You got invited to use the SmartSite Power Console. To start
                        using it register here:
                      </div>
                      <div></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0px 0px 0px 0px">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tbody>
                        <tr style="text-align: center">
                          <div>
                            <!--[if mso]>
                              <v:roundrect
                                xmlns:v="urn:schemas-microsoft-com:vml"
                                xmlns:w="urn:schemas-microsoft-com:office:word"
                                href="http://console.smartsitepower.com/#/register?invite=REGISTERID"
                                style="
                                  height: 60px;
                                  v-text-anchor: middle;
                                  width: 200px;
                                "
                                arcsize="10%"
                                strokecolor="#1B223C"
                                fillcolor="#1B223C"
                              >
                                <w:anchorlock />
                                <center
                                  style="
                                    color: white;
                                    font-size: 17px;
                                    font-weight: bold;
                                  "
                                >
                                  Register
                                </center>
                              </v:roundrect>
                            <![endif]-->
                            <a
                              href="http://console.smartsitepower.com/#/register?invite=REGISTERID"
                              style="
                                background-color: #1B223C;
                                border: 1px solid #1B223C;
                                border-radius: 6px;
                                color: white;
                                display: inline-block;
                                font-size: 17px;
                                font-weight: bold;
                                line-height: 40px;
                                text-align: center;
                                text-decoration: none;
                                width: 200px;
                                -webkit-text-size-adjust: none;
                                mso-hide: all;
                              "
                            >
                              Register
                            </a>
                          </div>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <!-- Banner Row -->
                    &nbsp;
                    <div
                      style="
                        color: #444444;
                        font-size: 12px;
                        line-height: 20px;
                        text-align: Center;
                        background-color: #fff;
                      "
                    >
                      <p style="font-weight: bold">&copy; SmartSite Power GmbH</p>
                      <p>
                        <span>Billrothstraße 4, RG Top 4 & 5</span>,
                        <span>1190</span>, <span>Wien</span>,
                        <span>Österreich</span>
                      </p>
                      <p>
                        <a href="https://www.smartsitepower.com/" target="_blank"
                          >Web</a
                        >
                        |
                        <a
                          href="https://www.linkedin.com/company/smartsitepowergmbh/"
                          target="_blank"
                          >LinkedIn</a
                        >
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
');


insert into email_template values ('invite', 'tsg', 
'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html data-editor-version="2" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <!--<![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <style type="text/css">
        body {
          width: 600px;
          margin: 0 auto;
          font-family: Roboto,sans-serif;
        }
        table {
          border-collapse: collapse;
        }
        table,
        td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }
      </style>
    <![endif]-->
  </head>
  <body>
    <table width="100%" style="width: 100%; max-width: 600px;  font-family: Roboto,sans-serif;" align="center">
      <tbody>
        <tr>
          <td
            role="modules-container"
            style="padding: 0px 0px 0px 0px; color: #000000; text-align: left"
            bgcolor="white"
            width="100%"
            align="left"
          >
            <table
              role="module"
              data-type="image"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed; margin-block: 1rem"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      font-size: 6px;
                      line-height: 10px;
                      padding: 0px 0px 0px 0px;
                    "
                    valign="top"
                    align="center"
                  >
                    <img
                      border="0"
                      style="
                        display: block;
                        color: #000000;
                        text-decoration: none;
                        font-family: Helvetica, arial, sans-serif;
                        font-size: 16px;
                        max-width: 100% !important;
                        width: 100%;
                        height: auto !important;
                        margin-bottom: 12px;
                      "
                      width="0"
                      alt=""
                      data-proportionally-constrained="true"
                      data-responsive="true"
                      src="https://console.tsg-portal.de/images/invite/tsg.jpg"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            &nbsp;
            <table
              role="module"
              data-type="text"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                      background-color: #ef414b;
                    "
                    height="100%"
                    valign="top"
                    bgcolor="#EF414B"
                    role="module-content"
                  >
                    <div style="font-family: inherit; text-align: center">
                      <span style="font-size: 30px; color: #fff">
                        Register at TSG-Portal
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                    "
                    height="100%"
                    valign="top"
                    bgcolor=""
                    role="module-content"
                  >
                    <div>
                      <div style="font-family: inherit; text-align: center">
                        You got invited to use the TSG-Portal. To start using it
                        register here:
                      </div>
                      <div></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0px 0px 0px 0px">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tbody>
                        <tr style="text-align: center">
                          <div>
                            <!--[if mso]>
                              <v:roundrect
                                xmlns:v="urn:schemas-microsoft-com:vml"
                                xmlns:w="urn:schemas-microsoft-com:office:word"
                                href="http://console.tsg-portal.de/#/register?invite=REGISTERID"
                                style="
                                  height: 60px;
                                  v-text-anchor: middle;
                                  width: 200px;
                                "
                                arcsize="10%"
                                strokecolor="#EF414B"
                                fillcolor="#EF414B"
                              >
                                <w:anchorlock />
                                <center
                                  style="
                                    color: white;
                                    font-size: 17px;
                                    font-weight: bold;
                                  "
                                >
                                  Register
                                </center>
                              </v:roundrect>
                            <![endif]-->
                            <a
                              href="http://console.tsg-portal.de/#/register?invite=REGISTERID"
                              style="
                                background-color: #ef414b;
                                border: 1px solid #ef414b;
                                border-radius: 6px;
                                color: white;
                                display: inline-block;
                                font-size: 17px;
                                font-weight: bold;
                                line-height: 40px;
                                text-align: center;
                                text-decoration: none;
                                width: 200px;
                                -webkit-text-size-adjust: none;
                                mso-hide: all;
                              "
                            >
                              Register
                            </a>
                          </div>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <!-- Banner Row -->
                    &nbsp;
                    <div
                      style="
                        color: #fff;
                        font-size: 12px;
                        line-height: 20px;
                        text-align: Center;
                        background-color: #525252;
                      "
                    >
                      <p style="font-weight: bold">TSG Deutschland GmbH & Co. KG</p>
                      <p>
                        <span>Lothstraße 1a</span>,
                        <span>80335</span>, <span>München</span>,
                        <span>Deutschland</span>
                      </p>
                      <p>
                        <a href="https://www.efficientio.com/" target="_blank"
                          >Web</a
                        >
                        |
                        <a
                          href="https://www.linkedin.com/company/80325191/"
                          target="_blank"
                          >LinkedIn</a
                        >
                        |
                        <a
                          href="https://www.youtube.com/@efficientio2616"
                          target="_blank"
                          >Youtube</a
                        >
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
');


insert into email_template values ('invite', 'be',
'
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html data-editor-version="2" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <!--<![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <style type="text/css">
        body {
          width: 600px;
          margin: 0 auto;
          font-family: Roboto,sans-serif;
        }
        table {
          border-collapse: collapse;
        }
        table,
        td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }
      </style>
    <![endif]-->
  </head>
  <body>
    <table width="100%" style="width: 100%; max-width: 600px;  font-family: Roboto,sans-serif;" align="center">
      <tbody>
        <tr>
          <td
            role="modules-container"
            style="padding: 0px 0px 0px 0px; color: #000000; text-align: left"
            bgcolor="white"
            width="100%"
            align="left"
          >
            <table
              role="module"
              data-type="image"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed; margin-block: 1rem"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      font-size: 6px;
                      line-height: 10px;
                      padding: 0px 0px 0px 0px;
                    "
                    valign="top"
                    align="center"
                  >
                    <img
                      border="0"
                      style="
                        display: block;
                        color: #000000;
                        text-decoration: none;
                        font-family: Helvetica, arial, sans-serif;
                        font-size: 16px;
                        max-width: 100% !important;
                        width: 100%;
                        height: auto !important;
                        margin-bottom: 12px;
                      "
                      width="0"
                      alt=""
                      data-proportionally-constrained="true"
                      data-responsive="true"
                      src="https://be-leo-business.burgenlandenergie.at/images/invite/BE.jpg"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            &nbsp;
            <table
              role="module"
              data-type="text"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                      background-color: #FDCC00;
                    "
                    height="100%"
                    valign="top"
                    bgcolor="#FDCC00"
                    role="module-content"
                  >
                    <div style="font-family: inherit; text-align: center">
                      <span style="font-size: 30px; color: #000000">
                        Register at LEO Business Console
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                    "
                    height="100%"
                    valign="top"
                    bgcolor=""
                    role="module-content"
                  >
                    <div>
                      <div style="font-family: inherit; text-align: center">
                        You got invited to use the Bessere Energie - LEO Business Console. To start using it
                        register here:
                      </div>
                      <div></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0px 0px 0px 0px">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tbody>
                        <tr style="text-align: center">
                          <div>
                            <!--[if mso]>
                              <v:roundrect
                                xmlns:v="urn:schemas-microsoft-com:vml"
                                xmlns:w="urn:schemas-microsoft-com:office:word"
                                href="http://be-leo-business.burgenlandenergie.at/#/register?invite=REGISTERID"
                                style="
                                  height: 60px;
                                  v-text-anchor: middle;
                                  width: 200px;
                                "
                                arcsize="10%"
                                strokecolor="#FDCC00"
                                fillcolor="#FDCC00"
                              >
                                <w:anchorlock />
                                <center
                                  style="
                                    color: #000000;
                                    font-size: 17px;
                                    font-weight: bold;
                                  "
                                >
                                  Register
                                </center>
                              </v:roundrect>
                            <![endif]-->
                            <a
                              href="http://be-leo-business.burgenlandenergie.at/#/register?invite=REGISTERID"
                              style="
                                background-color: #FDCC00;
                                border: 1px solid #FDCC00;
                                border-radius: 6px;
                                color: #000000;
                                display: inline-block;
                                font-size: 17px;
                                font-weight: bold;
                                line-height: 40px;
                                text-align: center;
                                text-decoration: none;
                                width: 200px;
                                -webkit-text-size-adjust: none;
                                mso-hide: all;
                              "
                            >
                              Register
                            </a>
                          </div>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <!-- Banner Row -->
                    &nbsp;
                    <div
                      style="
                        color: #000000;
                        font-size: 12px;
                        line-height: 20px;
                        text-align: Center;
                        background-color: #fff0b3;
                      "
                    >
                      <p style="font-weight: bold">BE Technology GmbH</p>
                      <p>
                        <span>Kasernenstraße 9</span>,
                        <span>7000</span>, <span>Eisenstadt</span>,
                        <span>Österreich</span>
                      </p>
                      <p>
                        <a href="https://www.efficientio.com/" target="_blank"
                          >Web</a
                        >
                        |
                        <a
                          href="https://www.linkedin.com/company/80325191/"
                          target="_blank"
                          >LinkedIn</a
                        >
                        |
                        <a
                          href="https://www.youtube.com/@efficientio2616"
                          target="_blank"
                          >Youtube</a
                        >
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
');



insert into email_template values ('invite', 'peneder',
'

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html data-editor-version="2" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <!--<![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <style type="text/css">
        body {
          width: 600px;
          margin: 0 auto;
          font-family: Roboto,sans-serif;
        }
        table {
          border-collapse: collapse;
        }
        table,
        td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }
      </style>
    <![endif]-->
  </head>
  <body>
    <table width="100%" style="width: 100%; max-width: 600px;  font-family: Roboto,sans-serif;" align="center">
      <tbody>
        <tr>
          <td
            role="modules-container"
            style="padding: 0px 0px 0px 0px; color: #222c37; text-align: left"
            bgcolor="white"
            width="100%"
            align="left"
          >
            <table
              role="module"
              data-type="image"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed; margin-block: 1rem"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      font-size: 6px;
                      line-height: 10px;
                      padding: 0px 0px 0px 0px;
                    "
                    valign="top"
                    align="center"
                  >
                    <img
                      border="0"
                      style="
                        display: block;
                        color: #222c37;
                        text-decoration: none;
                        font-family: Helvetica, arial, sans-serif;
                        font-size: 16px;
                        max-width: 100% !important;
                        width: 100%;
                        height: auto !important;
                        margin-bottom: 12px;
                      "
                      width="0"
                      alt=""
                      data-proportionally-constrained="true"
                      data-responsive="true"
                      src="https://connect.peneder.com/images/invite/peneder.jpg"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            &nbsp;
            <table
              role="module"
              data-type="text"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                      background-color: #ed1834;
                    "
                    height="100%"
                    valign="top"
                    bgcolor="#ed1834"
                    role="module-content"
                  >
                    <div style="font-family: inherit; text-align: center">
                      <span style="font-size: 30px; color: #fff">
                        Register at P_Connect
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                    "
                    height="100%"
                    valign="top"
                    bgcolor=""
                    role="module-content"
                  >
                    <div>
                      <div style="font-family: inherit; text-align: center">
                        You got invited to use the P_Connect Console. To start using it
                        register here:
                      </div>
                      <div></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0px 0px 0px 0px">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tbody>
                        <tr style="text-align: center">
                          <div>
                            <!--[if mso]>
                              <v:roundrect
                                xmlns:v="urn:schemas-microsoft-com:vml"
                                xmlns:w="urn:schemas-microsoft-com:office:word"
                                href="http://connect.peneder.com/#/register?invite=REGISTERID"
                                style="
                                  height: 60px;
                                  v-text-anchor: middle;
                                  width: 200px;
                                "
                                arcsize="10%"
                                strokecolor="#ed1834"
                                fillcolor="#ed1834"
                              >
                                <w:anchorlock />
                                <center
                                  style="
                                    color: #fff;
                                    font-size: 17px;
                                    font-weight: bold;
                                  "
                                >
                                  Register
                                </center>
                              </v:roundrect>
                            <![endif]-->
                            <a
                              href="http://connect.peneder.com/#/register?invite=REGISTERID"
                              style="
                                background-color: #ed1834;
                                border: 1px solid #ed1834;
                                border-radius: 6px;
                                color: #fff;
                                display: inline-block;
                                font-size: 17px;
                                font-weight: bold;
                                line-height: 40px;
                                text-align: center;
                                text-decoration: none;
                                width: 200px;
                                -webkit-text-size-adjust: none;
                                mso-hide: all;
                              "
                            >
                              Register
                            </a>
                          </div>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <!-- Banner Row -->
                    &nbsp;
                    <div
                      style="
                        color: #222c37;
                        font-size: 12px;
                        line-height: 20px;
                        text-align: Center;
                        background-color: #ffffff;
                      "
                    >
                      <p style="font-weight: bold">Peneder Bau-Elemente GmbH</p>
                      <p>
                        <span>Ritzling 9</span>,
                        <span>4904</span>, <span>Atzbach</span>,
                        <span>Österreich</span>
                      </p>
                      <p>
                        <a href="https://www.efficientio.com/" target="_blank"
                          >Web</a
                        >
                        |
                        <a
                          href="https://www.linkedin.com/company/80325191/"
                          target="_blank"
                          >LinkedIn</a
                        >
                        |
                        <a
                          href="https://www.youtube.com/@efficientio2616"
                          target="_blank"
                          >Youtube</a
                        >
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
');



insert into email_template values ('invite', 'bmsystems',
'
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html data-editor-version="2" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <!--<![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <style type="text/css">
        body {
          width: 600px;
          margin: 0 auto;
          font-family: Roboto,sans-serif;
        }
        table {
          border-collapse: collapse;
        }
        table,
        td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }
      </style>
    <![endif]-->
  </head>
  <body>
    <table width="100%" style="width: 100%; max-width: 600px;  font-family: Roboto,sans-serif;" align="center">
      <tbody>
        <tr>
          <td
            role="modules-container"
            style="padding: 0px 0px 0px 0px; color: #000000; text-align: left"
            bgcolor="white"
            width="100%"
            align="left"
          >
            <table
              role="module"
              data-type="image"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed; margin-block: 1rem"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      font-size: 6px;
                      line-height: 10px;
                      padding: 0px 0px 0px 0px;
                    "
                    valign="top"
                    align="center"
                  >
                    <img
                      border="0"
                      style="
                        display: block;
                        color: #000000;
                        text-decoration: none;
                        font-family: Helvetica, arial, sans-serif;
                        font-size: 16px;
                        max-width: 100% !important;
                        width: 100%;
                        height: auto !important;
                        margin-bottom: 12px;
                      "
                      width="0"
                      alt=""
                      data-proportionally-constrained="true"
                      data-responsive="true"
                      src="https://bmsystems.efficientio.com/images/invite/bms.jpg"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            &nbsp;
            <table
              role="module"
              data-type="text"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                      background-color: #FFBC00;
                    "
                    height="100%"
                    valign="top"
                    bgcolor="#FFBC00"
                    role="module-content"
                  >
                    <div style="font-family: inherit; text-align: center">
                      <span style="font-size: 30px; color: #fff">
                        Register at BMS - Best Modification Systems
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                    "
                    height="100%"
                    valign="top"
                    bgcolor=""
                    role="module-content"
                  >
                    <div>
                      <div style="font-family: inherit; text-align: center">
                        You got invited to use the BMS - Best Modification Systems console. To start
                        using it register here:
                      </div>
                      <div></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0px 0px 0px 0px">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tbody>
                        <tr style="text-align: center">
                          <div>
                            <!--[if mso]>
                              <v:roundrect
                                xmlns:v="urn:schemas-microsoft-com:vml"
                                xmlns:w="urn:schemas-microsoft-com:office:word"
                                href="http://bmsystems.efficientio.com/#/register?invite=REGISTERID"
                                style="
                                  height: 60px;
                                  v-text-anchor: middle;
                                  width: 200px;
                                "
                                arcsize="10%"
                                strokecolor="#FFBC00"
                                fillcolor="#FFBC00"
                              >
                                <w:anchorlock />
                                <center
                                  style="
                                    color: white;
                                    font-size: 17px;
                                    font-weight: bold;
                                  "
                                >
                                  Register
                                </center>
                              </v:roundrect>
                            <![endif]-->
                            <a
                              href="http://bmsystems.efficientio.com/#/register?invite=REGISTERID"
                              style="
                                background-color: #FFBC00;
                                border: 1px solid #FFBC00;
                                border-radius: 6px;
                                color: white;
                                display: inline-block;
                                font-size: 17px;
                                font-weight: bold;
                                line-height: 40px;
                                text-align: center;
                                text-decoration: none;
                                width: 200px;
                                -webkit-text-size-adjust: none;
                                mso-hide: all;
                              "
                            >
                              Register
                            </a>
                          </div>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <!-- Banner Row -->
                    &nbsp;
                    <div
                      style="
                        color: #fff;
                        font-size: 12px;
                        line-height: 20px;
                        text-align: Center;
                        background-color: #363636;
                      "
                    >
                      <p style="font-weight: bold">bms future energy GmbH</p>
                      <p>
                        <span>Buchenweg 7/2</span>,
                        <span>4484</span>, <span>Kronstorf</span>,
                        <span>Österreich</span>
                      </p>
                      <p>
                        <a href="https://www.efficientio.com/" target="_blank" style="color: rgb(194 194 238)"
                          >Web</a
                        >
                        |
                        <a
                          href="https://www.linkedin.com/company/80325191/"
                          target="_blank"
                          style="color: rgb(194 194 238)"
                          >LinkedIn</a
                        >
                        |
                        <a
                          href="https://www.youtube.com/@efficientio2616"
                          target="_blank"
                          style="color: rgb(194 194 238)"
                          >Youtube</a
                        >
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
');



insert into email_template values ('invite', 'powerlink',
'
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html data-editor-version="2" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1"
    />
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=Edge" />
    <!--<![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
    <!--[if (gte mso 9)|(IE)]>
      <style type="text/css">
        body {
          width: 600px;
          margin: 0 auto;
          font-family: Roboto,sans-serif;
        }
        table {
          border-collapse: collapse;
        }
        table,
        td {
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
        img {
          -ms-interpolation-mode: bicubic;
        }
      </style>
    <![endif]-->
  </head>
  <body>
    <table width="100%" style="width: 100%; max-width: 600px;  font-family: Roboto,sans-serif;" align="center">
      <tbody>
        <tr>
          <td
            role="modules-container"
            style="padding: 0px 0px 0px 0px; color: #000000; text-align: left"
            bgcolor="white"
            width="100%"
            align="left"
          >
            <table
              role="module"
              data-type="image"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed; margin-block: 1rem"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      font-size: 6px;
                      line-height: 10px;
                      padding: 0px 0px 0px 0px;
                    "
                    valign="top"
                    align="center"
                  >
                    <img
                      border="0"
                      style="
                        display: block;
                        color: #000000;
                        text-decoration: none;
                        font-family: Helvetica, arial, sans-serif;
                        font-size: 16px;
                        max-width: 100% !important;
                        width: 100%;
                        height: auto !important;
                        margin-bottom: 12px;
                      "
                      width="0"
                      alt=""
                      data-proportionally-constrained="true"
                      data-responsive="true"
                      src="https://console.power-link.at/images/invite/Powerlink.jpg"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
            &nbsp;
            <table
              role="module"
              data-type="text"
              border="0"
              cellpadding="0"
              cellspacing="0"
              width="100%"
              style="table-layout: fixed"
            >
              <tbody>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                      background-color: #74bb20;
                    "
                    height="100%"
                    valign="top"
                    bgcolor="#74bb20"
                    role="module-content"
                  >
                    <div style="font-family: inherit; text-align: center">
                      <span style="font-size: 30px; color: #fff">
                        Register at Powerlink
                      </span>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td
                    style="
                      padding: 18px 0px 18px 0px;
                      line-height: 22px;
                      text-align: inherit;
                    "
                    height="100%"
                    valign="top"
                    bgcolor=""
                    role="module-content"
                  >
                    <div>
                      <div style="font-family: inherit; text-align: center">
                        You got invited to use the Powerlink Console. To start
                        using it register here:
                      </div>
                      <div></div>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 0px 0px 0px 0px">
                    <table border="0" cellpadding="0" cellspacing="0">
                      <tbody>
                        <tr style="text-align: center">
                          <div>
                            <!--[if mso]>
                              <v:roundrect
                                xmlns:v="urn:schemas-microsoft-com:vml"
                                xmlns:w="urn:schemas-microsoft-com:office:word"
                                href="http://console.power-link.at/#/register?invite=REGISTERID"
                                style="
                                  height: 60px;
                                  v-text-anchor: middle;
                                  width: 200px;
                                "
                                arcsize="10%"
                                strokecolor="#74bb20"
                                fillcolor="#74bb20"
                              >
                                <w:anchorlock />
                                <center
                                  style="
                                    color: white;
                                    font-size: 17px;
                                    font-weight: bold;
                                  "
                                >
                                  Register
                                </center>
                              </v:roundrect>
                            <![endif]-->
                            <a
                              href="http://console.power-link.at/#/register?invite=REGISTERID"
                              style="
                                background-color: #74bb20;
                                border: 1px solid #74bb20;
                                border-radius: 6px;
                                color: white;
                                display: inline-block;
                                font-size: 17px;
                                font-weight: bold;
                                line-height: 40px;
                                text-align: center;
                                text-decoration: none;
                                width: 200px;
                                -webkit-text-size-adjust: none;
                                mso-hide: all;
                              "
                            >
                              Register
                            </a>
                          </div>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td>
                    <!-- Banner Row -->
                    &nbsp;
                    <div
                      style="
                        color: #000000;
                        font-size: 12px;
                        line-height: 20px;
                        text-align: Center;
                        background-color: #ffffff;
                      "
                    >
                      <p style="font-weight: bold">&copy; Power-Link by EfficientIO GmbH</p>
                      <p>
                        <span>Billrothstraße 4, RG Top 4 & 5</span>,
                        <span>1190</span>, <span>Wien</span>,
                        <span>Österreich</span>
                      </p>
                      <p>
                        <a href="https://www.efficientio.com/" target="_blank"
                          >Web</a
                        >
                        |
                        <a
                          href="https://www.linkedin.com/company/80325191/"
                          target="_blank"
                          >LinkedIn</a
                        >
                        |
                        <a
                          href="https://www.youtube.com/@efficientio2616"
                          target="_blank"
                          >Youtube</a
                        >
                      </p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
');
