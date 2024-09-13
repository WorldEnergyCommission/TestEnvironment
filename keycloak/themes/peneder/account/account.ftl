<#import "template.ftl" as layout>
<@layout.mainLayout active='account' bodyClass='user'; section>

    <div class="columns">
        <div class="col-md-10">
            <h2>${msg("editAccountHtmlTitle")}</h2>
        </div>
    </div>

    <form action="${url.accountUrl}" class="form-horizontal" method="post">

        <input type="hidden" id="stateChecker" name="stateChecker" value="${stateChecker}">

        <#if !realm.registrationEmailAsUsername>
            <div class="form-group ${messagesPerField.printIfExists('username','has-error')}">
                <div class="col-sm-2 col-md-2">
                    <label for="username" class="form-label">${msg("username")}</label>
                    <#if realm.editUsernameAllowed><span class="required">*</span></#if>
                </div>

                <div class="col-sm-10 col-md-10">
                    <input type="text"
                           class="form-input"
                           id="username"
                           name="username"
                           <#if !realm.editUsernameAllowed>disabled="disabled"</#if>
                           value="${(account.username!'')}"/>
                </div>
            </div>
        </#if>

        <div class="form-group ${messagesPerField.printIfExists('email','has-error')}">
            <div class="col-2 col-sm-12">
                <label for="email" class="form-label">${msg("email")}</label>
            </div>
            <div class="col-10 col-sm-12">
                <input type="text" class="form-input" required id="email" name="email" autofocus
                       value="${(account.email!'')}"/>
            </div>
        </div>

        <div class="form-group ${messagesPerField.printIfExists('firstName','has-error')}">
            <div class="col-2 col-sm-12">
                <label for="firstName" class="control-label">${msg("firstName")}</label>
            </div>

            <div class="col-10 col-sm-12">
                <input type="text" class="form-input" id="firstName" name="firstName" required
                       value="${(account.firstName!'')}"/>
            </div>
        </div>

        <div class="form-group ${messagesPerField.printIfExists('lastName','has-error')}">
            <div class="col-2 col-sm-12">
                <label for="lastName" class="control-label">${msg("lastName")}</label>
            </div>

            <div class="col-10 col-sm-12">
                <input type="text" class="form-input" id="lastName" name="lastName" required
                       value="${(account.lastName!'')}"/>
            </div>
        </div>

        <div class="form-group">
            <div class="col-2 col-sm-12">
                <label for="user.attributes.mobile" class="form-label">Mobile number</label>
            </div>

            <div class="col-10 col-sm-12">
                <input
                        type="text"
                        class="form-input"
                        id="user.attributes.mobile"
                        name="user.attributes.mobile"
                        required
                        value="${(account.attributes.mobile!'')}"/>
            </div>
        </div>
        <hr>
        <div class="form-group">
            <div class="col-2 col-sm-12">
                <label for="user.attributes.organization.id" class="form-label">${msg('addressStreet')}</label>
            </div>
            <div class="col-10 col-sm-12">
                <input
                        type="text"
                        class="form-input"
                        id="user.attributes.address.street"
                        name="user.attributes.address.street"
                        value="${(account.attributes["address.street"]!'')}"/>
            </div>
        </div>
        <div class="form-group">
            <div class="col-2 col-sm-12">
                <label for="user.attributes.address.country" class="form-label">${msg('addressCountry')}</label>
            </div>
            <div class="col-10 col-sm-12">
                <select class="${properties.kcInputClass!}"
                        id="user.attributes.address.country"
                        name="user.attributes.address.country">
                    <#--Make this mess more maintainable-->
                    <option value="ch"
                            <#if ((account.attributes['address.country']!'') == 'ch')>selected</#if>>${msg('addressCountrySwitzerland')}</option>
                    <option value="de"
                            <#if ((account.attributes['address.country']!'') == 'de')>selected</#if>>${msg('addressCountryGermany')}</option>
                    <option value="at"
                            <#if ((account.attributes['address.country']!'') == 'at')>selected</#if>>${msg('addressCountryAustria')}</option>
                    <option value="it"
                            <#if ((account.attributes['address.country']!'') == 'it')>selected</#if>>${msg('addressCountryItaly')}</option>
                </select>
            </div>
        </div>
        <div class="form-group">
            <div class="col-2 col-sm-12">
                <label for="user.attributes.address.zipCode" class="form-label">${msg('addressZipCode')}</label>
            </div>
            <div class="col-10 col-sm-12">
                <input
                        type="text"
                        class="form-input"
                        id="user.attributes.address.zipCode"
                        name="user.attributes.address.zipCode"
                        value="${(account.attributes["address.zipCode"]!'')}"/>
            </div>
        </div>
        <div class="form-group">
            <div class="col-2 col-sm-12">
                <label for="user.attributes.address.city" class="form-label">${msg('addressCity')}</label>
            </div>
            <div class="col-10 col-sm-12">
                <input
                        type="text"
                        class="form-input"
                        id="user.attributes.address.city"
                        name="user.attributes.address.city"
                        value="${(account.attributes["address.city"]!'')}"/>
            </div>
        </div>
        <#-- only allow if the data exists -->
        <#if account.attributes["organization.id"]?? && account.attributes["organization.name"]?? >
            <hr>
            <div class="form-group">
                <div class="col-2 col-sm-12">
                    <label for="user.attributes.organization.id" class="form-label">${msg('companyName')}</label>
                </div>
                <div class="col-10 col-sm-12">
                    <input
                            type="text"
                            class="form-input"
                            id="user.attributes.organization.name"
                            name="user.attributes.organization.name"
                            value="${(account.attributes["organization.name"]!'')}"/>
                </div>
            </div>
            <div class="form-group">
                <div class="col-2 col-sm-12">
                    <label for="user.attributes.organization.id" class="form-label">${msg('companyId')}</label>
                </div>
                <div class="col-10 col-sm-12">
                    <input
                            type="text"
                            class="form-input"
                            id="user.attributes.organization.id"
                            name="user.attributes.organization.id"
                            value="${(account.attributes["organization.id"]!'')}"/>
                </div>
            </div>
        </#if>
        <div class="form-group">
            <div class="col-2 hide-sm"></div>
            <div id="kc-form-buttons" class="col-10 col-sm-12 submit">
                <div class="">
                    <#if url.referrerURI??><a
                        href="${url.referrerURI}">${kcSanitize(msg("backToApplication")?no_esc)}</a></#if>
                    <button type="submit"
                            class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonLargeClass!}"
                            name="submitAction" value="Save">${msg("doSave")}</button>
                    <button type="submit"
                            class="${properties.kcButtonClass!} ${properties.kcButtonDefaultClass!} ${properties.kcButtonLargeClass!}"
                            name="submitAction" value="Cancel">${msg("doCancel")}</button>
                </div>
            </div>
        </div>
    </form>

</@layout.mainLayout>
