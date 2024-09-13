<#macro mainLayout active bodyClass>
    <!doctype html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8"/>
        <meta name="robots" content="noindex, nofollow">

        <title>${msg("accountManagementTitle")}</title>
        <link rel="icon" href="${url.resourcesPath}/img/favicon.ico">
        <#if properties.stylesCommon?has_content>
            <#list properties.stylesCommon?split(' ') as style>
                <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet"/>
            </#list>
        </#if>
        <#if properties.styles?has_content>
            <#list properties.styles?split(' ') as style>
                <link href="${url.resourcesPath}/${style}" rel="stylesheet"/>
            </#list>
        </#if>
        <#if properties.scripts?has_content>
            <#list properties.scripts?split(' ') as script>
                <script type="text/javascript" src="${url.resourcesPath}/${script}"></script>
            </#list>
        </#if>
    </head>
    <body class="admin-console user ${bodyClass}">
    <div class="navbar-wrapper" style="box-shadow: 0 0.05rem 0.2rem rgba(0,31,51,.3); margin-bottom: 24px;">
        <header class="navbar container grid-xl" style="padding: 6px .4rem;">
            <section class="navbar-section">
                <img alt="logo" id="account-logo" src="${url.resourcesPath}/img/logo.svg"/>
            </section>
            <div class="navbar-section">
                <#if realm.internationalizationEnabled>
                    <div class="dropdown">
                        <a href="#" class="btn btn-link dropdown-toggle" tabindex="0">
                            ${locale.current} <i class="icon icon-caret"></i>
                        </a>
                        <!-- menu component -->
                        <ul class="menu">
                            <#list locale.supported as l>
                                <li class="menu-item"><a href="${l.url}">${l.label}</a></li>
                            </#list>
                        </ul>
                    </div>
                </#if>
                <#if referrer?has_content && referrer.url?has_content>
                    <a href="${referrer.url}" id="referrer">${msg("backTo",referrer.name)}</a>
                </#if>
                <a class="${properties.kcButtonClass} ${properties.kcButtonPrimaryClass}"
                   href="${url.logoutUrl}">${msg("doSignOut")}</a>
            </div>
        </header>
    </div>

    <div class="container grid-xl">
        <div class="columns">
            <div class="column col-3 col-sm-12" style="margin-bottom: 24px;">
                <ul class="menu">
                    <li class="menu-item">
                        <a href="${url.accountUrl}" class="<#if active=='account'>active</#if>">${msg("account")}</a>
                    </li>
                    <#if features.passwordUpdateSupported>
                        <li class="menu-item">
                            <a href="${url.passwordUrl}" class="<#if active=='password'>active</#if>">
                                ${msg("password")}
                            </a>
                        </li>
                    </#if>

                    <li class="menu-item">
                        <a href="${url.totpUrl}" class="<#if active=='totp'>active</#if>">${msg("authenticator")}</a>
                    </li>

                    <#if features.identityFederation>
                        <li class="menu-item">
                            <a href="${url.socialUrl}" class="<#if active=='social'>active</#if>">
                                ${msg("federatedIdentity")}
                            </a>
                        </li>
                    </#if>

                    <li class="menu-item">
                        <a href="${url.sessionsUrl}" class="<#if active=='sessions'>active</#if>">${msg("sessions")}</a>
                    </li>

                    <li class="menu-item">
                        <a href="${url.applicationsUrl}" class="<#if active=='applications'>active</#if>">
                            ${msg("applications")}
                        </a>
                    </li>

                    <#if features.log>
                        <li class="menu-item">
                            <a href="${url.logUrl}" class="<#if active=='log'>active</#if>">${msg("log")}</a>
                        </li>
                    </#if>

                    <#if realm.userManagedAccessAllowed && features.authorization>
                        <li class="menu-item">
                            <a href="${url.resourceUrl}" class="<#if active=='authorization'>active</#if>">
                                ${msg("myResources")}
                            </a>
                        </li>
                    </#if>
                </ul>
            </div>
            <div class="column col-9 col-sm-12">
                <#if message?has_content>
                    <div class="toast toast-${message.type}">
                        <span>${kcSanitize(message.summary)?no_esc}</span>
                    </div>
                </#if>

                <#nested "content">
            </div>
        </div>
    </div>
    </body>
    </html>
</#macro>