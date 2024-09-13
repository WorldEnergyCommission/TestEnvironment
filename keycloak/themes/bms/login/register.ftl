<#import "template.ftl" as layout>
<@layout.registrationLayout; section>
    <#if section = "header">
        ${msg("registerTitle")}
    <#elseif section = "form">
        <div id="kc-form-options" class="${properties.kcFormOptionsClass!}">
            <div class="${properties.kcFormOptionsWrapperClass!}">
                <span><a href="${url.loginUrl}">${kcSanitize(msg("backToLogin"))?no_esc}</a></span>
            </div>
        </div>
        <form id="app"
              class="${properties.kcFormClass!}"
              action="${url.registrationAction}"
              method="post"
              style="margin-top: 16px;">
            <ul class="step">
                <li class="step-item" v-for="(step, index) in steps" :class="{'active': index == currentStep}">
                    <a href="#" class="tooltip" :data-tooltip="'Step ' + (index+1)">{{step.title}}</a>
                </li>
            </ul>
            <#-- first and last name -->
            <div :style="{display : currentStep == 1 ? 'none' : 'block'}">
                <div class="columns">
                    <div class="column col-6 col-sm-12">
                        <kc-input title="${msg("firstName")}"
                                  autocomplete="given-name"
                                  type="text"
                                  name="firstName"
                                  v-model="fields.account.firstName">
                        </kc-input>
                    </div>
                    <div class="column col-6 col-sm-12">
                        <kc-input title="${msg("lastName")}"
                                  autocomplete="family-name"
                                  type="text"
                                  name="lastName"
                                  v-model="fields.account.lastName">
                        </kc-input>
                    </div>
                </div>

                <kc-input title="${msg("email")}"
                          autocomplete="email"
                          type="email"
                          name="email"
                          v-model="fields.account.email">
                </kc-input>

                <kc-input title="${msg('mobileNumber')}"
                          autocomplete="tel"
                          type="text"
                          name="user.attributes.mobile"
                          v-model="fields.account.mobile">
                </kc-input>

                <#if !realm.registrationEmailAsUsername>
                    <kc-input title="${msg("username")}"
                              autocomplete="username"
                              type="text"
                              name="username"
                              v-model="fields.account.username">
                    </kc-input>
                </#if>

                <#if passwordRequired??>
                    <kc-input title="${msg("password")}"
                              autocomplete="new-password"
                              type="password"
                              name="password"
                              v-model="fields.account.password">
                    </kc-input>

                    <kc-input title="${msg("passwordConfirm")}"
                              type="password"
                              name="password-confirm"
                              v-model="fields.account.passwordConfirm">
                    </kc-input>
                </#if>
            </div>
            <div :style="{display : currentStep == 0 ? 'none' : 'block'}">
                <kc-input title="${msg('addressStreet')}"
                          autocomplete="street-address"
                          type="text"
                          name="user.attributes.address.street"
                          v-model="fields.address.street">
                </kc-input>

                <#-- SHOULD I CREATE A CUSTOM ELEMENT FOR THIS? -->
                <div class="${properties.kcFormGroupClass!}">
                    <div class="${properties.kcLabelWrapperClass!}">
                        <label for="user.attributes.address.street" class="${properties.kcLabelClass!}">${msg('addressCountry')}</label>
                    </div>
                    <div class="${properties.kcInputWrapperClass!}">
                        <select class="${properties.kcInputClass!}"
                                id="user.attributes.address.country"
                                name="user.attributes.address.country"
                                v-model="fields.address.country"
                                autocomplete="country">
                            <option value="ch">${msg('addressCountrySwitzerland')}</option>
                            <option value="de">${msg('addressCountryGermany')}</option>
                            <option value="at">${msg('addressCountryAustria')}</option>
                            <option value="it">${msg('addressCountryItaly')}</option>
                        </select>
                    </div>
                </div>

                <div class="columns">
                    <div class="column col-sm-12 col-4">
                        <kc-input title="${msg('addressZipCode')}"
                                  autocomplete="postal-code"
                                  type="text"
                                  name="user.attributes.address.zipCode"
                                  v-model="fields.address.zipCode">
                        </kc-input>
                    </div>
                    <div class="column col-sm-12 col-8">
                        <kc-input title="${msg('addressCity')}"
                                  autocomplete="city"
                                  type="text"
                                  name="user.attributes.address.city"
                                  v-model="fields.address.city">
                        </kc-input>
                    </div>
                </div>


                <div class="${properties.kcFormGroupClass!}" style="margin-top: 24px;">
                    <label class="form-checkbox">
                        <input type="checkbox" v-model="organization">
                        <i class="form-icon"></i> ${msg('optionRegisterCompany')}
                    </label>
                </div>

                <div v-if="organization">
                    <kc-input title="${msg('companyName')}"
                              autocomplete="organization"
                              type="text"
                              name="user.attributes.organization.name"
                              v-model="fields.organization.name">
                    </kc-input>

                    <kc-input title="${msg('companyId')}"
                              type="text"
                              name="user.attributes.organization.id"
                              v-model="fields.organization.id">
                    </kc-input>
                </div>
            </div>

            <#if recaptchaRequired??>
                <div class="form-group">
                    <div class="${properties.kcInputWrapperClass!}">
                        <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
                    </div>
                </div>
            </#if>

            <div style="margin-top: 12px;" class="${properties.kcFormGroupClass!}">
                <div v-if="currentStep == 0" id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                    <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!}"
                           type="button" value="${msg('continue')}" v-on:click="currentStep = 1"/>
                </div>
                <div v-else class="columns">
                    <div class="column col-sm-12 col-6">
                        <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                            <input class="${properties.kcButtonClass!} ${properties.kcButtonOutlineClass!} ${properties.kcButtonBlockClass!}"
                                   type="button" value="${msg('back')}" v-on:click="currentStep = 0"/>
                        </div>
                    </div>
                    <div class="column col-sm-12 col-6">
                        <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                            <input
                                    :disabled="!isFormValid"
                                    class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!}"
                                    type="submit" value="${msg("doRegister")}"/>
                        </div>
                    </div>
                </div>
            </div>
        </form>


        <script src="${url.resourcesPath}/js/vue.min.js"></script>
        <script>
            Vue.component('kc-input', {
                data: () => ({
                    id: null
                }),
                created() {
                    this.id = this.generateId()
                },
                props: ['title', 'autocomplete', 'name', 'value', 'type'],
                methods: {
                    // https://gist.github.com/gordonbrander/2230317
                    generateId() {
                        return '_' + Math.random().toString(36).substr(2, 9);
                    },
                    update() {
                        this.$emit('input', this.$refs.input.value)
                    }
                },
                template: `
                <div class="${properties.kcFormGroupClass!}">
                    <div class="${properties.kcLabelWrapperClass!}">
                        <label :for="id" class="${properties.kcLabelClass!}">{{title}}</label>
                    </div>
                    <div class="${properties.kcInputWrapperClass!}">
                        <input ref="input"
                               :name="name"
                               :id="id"
                               :type="type"
                               :value="value"
                               v-on:input="update"
                               :autocomplete="autocomplete"
                               class="${properties.kcInputClass!}"/>
                    </div>
                </div>
                `
            })


            new Vue({
                el: '#app',
                data: {
                    fields: {
                        account: {
                            firstName: '${(register.formData.firstName!'')}',
                            lastName: '${(register.formData.lastName!'')}',
                            email: '${(register.formData.email!'')}',
                            username: '${(register.formData.username!'')}',
                            mobile: '${(register.formData['user.attributes.mobile']!'')}',
                            password: '',
                            passwordConfirm: '',
                        },
                        address: {
                            street: '${(register.formData['user.attributes.address.street']!'')}',
                            country: '${(register.formData['user.attributes.address.country']!'')}',
                            zipCode: '${(register.formData['user.attributes.address.zipCode']!'')}',
                            city: '${(register.formData['user.attributes.address.city']!'')}'
                        },
                        organization: {
                            name: '${(register.formData['user.attributes.organization.name']!'')}',
                            id: '${(register.formData['user.attributes.organization.id']!'')}'
                        }
                    },
                    organization: false,
                    currentStep: 0,
                    steps: [{
                        title: '${msg('stepAccount')}',
                    }, {
                        title: '${msg('stepBilling')}'
                    }, {
                        title: '${msg('stepVerification')}'
                    }]
                },
                computed: {
                    // isFormValid is currently a simple form validator
                    // email won't be checked, since it has to match the email
                    // currently it looks so ugly because I intend to add a more
                    // complex validation solution
                    // I could also do it with required, but then everything is red...
                    // TODO: Add a better form validation
                    isFormValid() {
                        if (this.fields.account.firstName.length < 2 || this.fields.account.lastName.length < 2) return false
                        if (this.fields.account.mobile.length === 0) return false

                        if (this.fields.address.street.length < 2 ||
                            this.fields.address.country.length === 0 ||
                            this.fields.address.zipCode === 0 ||
                            this.fields.address.city.length < 2) return false

                        if (this.organization) {
                            if (this.fields.organization.name.length === 0) return false
                        }

                        return true
                    }
                }
            })
        </script>
    </#if>
</@layout.registrationLayout>