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


insert into email_template values ('invite', 'eneries', '
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
                      src="https://console.eneries.com/images/invite/eneries.jpg"
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
                        Register at ENERIES
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
                        You got invited to use the ENERIES console. To start
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
                                href="http://console.eneries.com/#/register?invite=REGISTERID"
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
                              href="http://console.eneries.com/#/register?invite=REGISTERID"
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
                      <p style="font-weight: bold">&copy; ENERIES GmbH</p>
                      <p>
                        <span>Czartoryskigasse 143/6</span>,
                        <span>1170</span>, <span>Wien</span>,
                        <span>Österreich</span>
                      </p>
                      <p>
                        <a href="https://www.console.eneries.com/" target="_blank"
                          >Web</a
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
