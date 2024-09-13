<#import "template.ftl" as layout>
<@layout.mainLayout active='password' bodyClass='password'; section>

    <div class="columns">
        <div class="col-12">
            <h2>${msg("changePasswordHtmlTitle")}</h2>
        </div>
    </div>
    <form action="${url.passwordUrl}" class="form-horizontal" method="post">
        <input type="text" id="username" name="username" value="${(account.username!'')}" autocomplete="username"
               readonly="readonly" style="display:none;">

        <#if password.passwordSet>
            <div class="form-group">
                <div class="col-2 col-sm-12">
                    <label for="password" class="form-label">${msg("password")}</label>
                </div>

                <div class="col-10 col-sm-12">
                    <input type="password" class="form-input" id="password" name="password" autofocus
                           autocomplete="current-password">
                </div>
            </div>
        </#if>

        <input type="hidden" id="stateChecker" name="stateChecker" value="${stateChecker}">

        <div class="form-group">
            <div class="col-2 col-sm-12">
                <label for="password-new" class="form-label">${msg("passwordNew")}</label>
            </div>

            <div class="col-10 col-sm-12">
                <input type="password" class="form-input" id="password-new" name="password-new"
                       autocomplete="new-password">
            </div>
        </div>

        <div class="form-group">
            <div class="col-2 col-sm-12">
                <label for="password-confirm" class="form-label" class="two-lines">${msg("passwordConfirm")}</label>
            </div>

            <div class="col-10 col-sm-12">
                <input type="password" class="form-input" id="password-confirm" name="password-confirm"
                       autocomplete="new-password">
            </div>
        </div>

        <div class="form-group">
            <div class="col-2 sm-hide"></div>
            <div id="kc-form-buttons" class="col-10 col-sm-12">
                <div class="">
                    <button type="submit"
                            class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonLargeClass!}"
                            name="submitAction" value="Save">${msg("doSave")}</button>
                </div>
            </div>
        </div>
    </form>

</@layout.mainLayout>