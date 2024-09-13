<#import "template.ftl" as layout>
<@layout.registrationLayout; section>
    <#if section = "header">
        ${msg("emailVerifyTitle")}
    <#elseif section = "form">
    <#-- Continuation of step menu from register.ftl for consistency -->
        <ul class="step" style="margin: 24px 0;">
            <li class="step-item"><a href="#" class="tooltip" data-tooltip="Step 1">Account</a></li>
            <li class="step-item"><a href="#" class="tooltip" data-tooltip="Step 2">Billing</a></li>
            <li class="step-item active"><a href="#" class="tooltip" data-tooltip="Step 3">Verification</a></li>
        </ul>

        <p class="instruction">
            ${msg("emailVerifyInstruction1")}
        </p>
        <p class="instruction">
            ${msg("emailVerifyInstruction2")}
            <a href="${url.loginAction}">${msg("doClickHere")}</a>
            ${msg("emailVerifyInstruction3")}
        </p>
    </#if>
</@layout.registrationLayout>