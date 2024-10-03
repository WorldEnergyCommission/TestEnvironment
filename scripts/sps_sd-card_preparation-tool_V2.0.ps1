# SPS SD-Card Preparation-Tool
# (c) EfficientIO GmbH
# for use with CX8190 / WinCE

using namespace System.Management.Automation.Host

 function New-Menu {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [ValidateNotNullOrEmpty()]
        [string]$Title,

        [Parameter(Mandatory)]
        [ValidateNotNullOrEmpty()]
        [string]$Question
    )
    
    $effio = [ChoiceDescription]::new('&effio', 'platform choice: EfficientIO')
    $tsg = [ChoiceDescription]::new('&tsg', 'platform choice: TSG')
    $be = [ChoiceDescription]::new('&be', 'platform choice: BE')
    $pl = [ChoiceDescription]::new('&pl', 'platform choice: PowerLink')
    $an = [ChoiceDescription]::new('&an', 'platform choice: Anker')
    $bms = [ChoiceDescription]::new('&bms', 'platform choice: BMS')
    $eff = [ChoiceDescription]::new('&eff', 'platform choice: Effectas')
    $sspxy = [ChoiceDescription]::new('&sspxy', 'platform choice: SSP-Special')
    $ene = [ChoiceDescription]::new('&ene', 'platform choice: EneRies')

    $options = [ChoiceDescription[]]($effio, $tsg, $be, $pl, $an, $bms, $eff, $sspxy, $ene)

    $global:result = $host.ui.PromptForChoice($Title, $Question, $options, 0)

    switch ($result) {
        0 { 'Your platform choice is: EfficientIO' }
        1 { 'Your platform choice is: TSG' }
        2 { 'Your platform choice is: BE' }
        3 { 'Your platform choice is: Power-Link' }
        4 { 'Your platform choice is: Anker' }
        5 { 'Your platform choice is: BMS' }
        6 { 'Your platform choice is: Effectas' }
        7 { 'Your platform choice is: SSP Special' }
        8 { 'Your platform choice is: EneRies' }
    }

}

<#
 # Fetch Infos
 #>
# Platform Selector
New-Menu -Title 'Platform-Selector' -Question 'For which platform do you want to prepare?'
# FilePath
$drive = (Read-Host "Please enter the Drive Name of the SD-Card (e.g. D)").ToUpper()

# Default
if ( $result -in 0,1,2,5,6,7,8 ) {
    $aomuserraw3 = (Read-Host "Please enter the target device name")
    $aomuser = "$aomuserraw3"
    }
# PowerLink / SSP
if ($result -eq 3) {
    $aomuserraw2 = (Read-Host "Please enter 2 digit Set Variant")
    $aomuserraw3 = (Read-Host "Please enter last 4 digits from Bunde-SN")
    $aomuser = "EIOPL$aomuserraw2$aomuserraw3"
    }
# Anker
if ($result -eq 4) {
    $aomuserraw2 = (Read-Host "Please enter 2 digit Set Variant")
    $aomuserraw3 = (Read-Host "Please enter last 4 digits from Bunde-SN")
    $aomuser = "EIOAN$aomuserraw2$aomuserraw3"
    }

# generate User, fetched from User Input
Write-Output "generated ADS-over-MQTT UserID: $aomuser"

<#
 # Image update
 #>
# save License file
Write-Output "creating tmp license Folders..."
New-Item -ItemType "directory" -Path ".\tmp_lic" -Force | Out-Null
Copy-Item -Path "${drive}:\TwinCAT\3.1\Target\License\*.tclrs" -Destination ".\tmp_lic"
    
# erase SD-card
Write-Output "erasing SD card..."
Remove-Item "${drive}:\*" -Recurse -Force
Get-Item "${drive}:\*"

# copy newest image to SD-card
Write-Output "copy new image to SD card..."
# Default
if ($result -in 0,1,2,5) {
    Copy-Item -Path "..\projects\spsbase\ce_image\default\*" -Destination "${drive}:" -Recurse
    }
# PowerLink / SSP
if ($result -in 3,7) {
    Copy-Item -Path "..\projects\spsbase\ce_image\powerlink\*" -Destination "${drive}:" -Recurse
    }
# Anker
if ($result -eq 4) {
    Copy-Item -Path "..\projects\spsbase\ce_image\anker\*" -Destination "${drive}:" -Recurse
    }
# Effectas
if ($result -eq 6) {
    Copy-Item -Path "..\projects\spsbase\ce_image\latest\*" -Destination "${drive}:" -Recurse
    }
# Eneries
if ($result -eq 8) {
    Copy-Item -Path "..\projects\spsbase\ce_image\eneries\*" -Destination "${drive}:" -Recurse
    }

# restore License file
Write-Output "restore license file..."
Copy-Item -Path ".\tmp_lic\*.tclrs" -Destination "${drive}:\TwinCAT\3.1\Target\License"
Get-Item "${drive}:\TwinCAT\3.1\Target\License\*"
Remove-Item ".\tmp_lic" -Recurse -Force

<#
 # Adopt Registry Files
 #>
# change Device Name
Write-Output "adopt Registry Files..."
New-Item "${drive}:\RegFiles\DeviceName.reg"
Set-Content "${drive}:\RegFiles\DeviceName.reg" '[HKEY_LOCAL_MACHINE\Ident]'
$regcont = "	""Name""=""$aomuser"""
Add-Content "${drive}:\RegFiles\DeviceName.reg" -Value($regcont)
$regcont = "	""Desc""=""by EneRies"""
Add-Content "${drive}:\RegFiles\DeviceName.reg" -Value($regcont)
# keep default Wallpaper for TSG
if ($result -eq 1) {
    Remove-Item "${drive}:\RegFiles\Wallpaper.reg" -Recurse -Force
    }
# keep default Wallpaper for Effectas
if ($result -eq 6) {
    Remove-Item "${drive}:\RegFiles\Wallpaper.reg" -Recurse -Force
    }

<#
 # Certificate Deployment
 #>
# create Folders
Write-Output "creating Certificate Folders..."
New-Item -ItemType "directory" -Path "${drive}:\TwinCat\3.1\Config\Certificates" -Force | Out-Null
New-Item -ItemType "directory" -Path "${drive}:\TwinCat\3.1\Target\Certificates" -Force | Out-Null
Write-Output "Certificate Folders created"

if ($result -eq 0) {
    # copy Files for EfficientIO
    Write-Output "copy Certificates..."
    Copy-Item "..\projects\spsbase\mqtt.pem" -Destination "${drive}:\TwinCat\3.1\Config\Certificates"
    Copy-Item "..\projects\spsbase\CA.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR.key" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Write-Output "Certificates copied"
}

if ($result -eq 1) {
    # copy Files for TSG
    Write-Output "copy Certificates..."
    Copy-Item "..\projects\spsbase\mqtt_tsg.pem" -Destination "${drive}:\TwinCat\3.1\Config\Certificates"
    Copy-Item "..\projects\spsbase\CA_TSG.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR_TSG.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR_TSG.key" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Write-Output "Certificates copied"
}

if ($result -eq 2) {
    # copy Files for BE
    Write-Output "copy Certificates..."
    Copy-Item "..\projects\spsbase\mqtt_be.pem" -Destination "${drive}:\TwinCat\3.1\Config\Certificates"
    Copy-Item "..\projects\spsbase\CA_BE.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR_BE.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR_BE.key" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Write-Output "Certificates copied"
}

if ($result -in 3,7 ) {
    # copy Files for Power-Link / SSP = EfficientIO
    Write-Output "copy Certificates..."
    Copy-Item "..\projects\spsbase\mqtt.pem" -Destination "${drive}:\TwinCat\3.1\Config\Certificates"
    Copy-Item "..\projects\spsbase\CA.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR.key" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Write-Output "Certificates copied"
}

if ($result -eq 4) {
    # copy Files for Anker = EfficientIO
    Write-Output "copy Certificates..."
    Copy-Item "..\projects\spsbase\mqtt.pem" -Destination "${drive}:\TwinCat\3.1\Config\Certificates"
    Copy-Item "..\projects\spsbase\CA.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR.key" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Write-Output "Certificates copied"
}

if ($result -eq 5) {
    # copy Files for BMS
    Write-Output "copy Certificates..."
    Copy-Item "..\projects\spsbase\mqtt_bms.pem" -Destination "${drive}:\TwinCat\3.1\Config\Certificates"
    Copy-Item "..\projects\spsbase\CA_bmsystems.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR_bmsystems.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR_bmsystems.key" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Write-Output "Certificates copied"
}

if ($result -eq 6) {
    # copy Files for Effectas
    Write-Output "copy Certificates..."
    Copy-Item "..\projects\spsbase\mqtt_effectas.pem" -Destination "${drive}:\TwinCat\3.1\Config\Certificates"
    Copy-Item "..\projects\spsbase\CA_effectas.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR_effectas.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR_effectas.key" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Write-Output "Certificates copied"
}

if ($result -eq 8) {
    # copy Files for EneRies
    Write-Output "copy Certificates..."
    Copy-Item "..\projects\spsbase\mqtt_eneries.pem" -Destination "${drive}:\TwinCat\3.1\Config\Certificates"
    Copy-Item "..\projects\spsbase\CA.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "..\projects\spsbase\TwinCAT_XAR.key" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Write-Output "Certificates copied"
}

<#
 # copy Setup Files
 #>
# create Folders
Write-Output "creating _setup Folder..."
New-Item -ItemType "directory" -Path "${drive}:\TwinCat\Functions\_setup" -Force | Out-Null
Write-Output "_setup Folder created"
# copy Files
Write-Output "copy CAB Files..."
Copy-Item "..\projects\spsbase\installer\TF6250-Modbus-TCP.ARMV4I.CAB" -Destination "${drive}:\TwinCat\Functions\_setup"
Write-Output "CAB Files copied"

<#
 # ADS-over-MQTT Config
 #>
# create File
Write-Output "generating ADS-over-MQTT Configuration..."
New-Item -ItemType "directory" -Path "${drive}:\TwinCat\3.1\Target\Routes" -Force | Out-Null
New-Item -ItemType "file" -Path "${drive}:\TwinCat\3.1\Target\Routes" -Name "MyRoute.xml"

# insert File-Content from EfficientIO Template
Get-Content -Path "..\projects\spsbase\MyRoute.xml" | Add-Content -Path "${drive}:\TwinCat\3.1\Target\Routes\MyRoute.xml"


# change User, based on MAC Adress
$filePathToTask = "${drive}:\TwinCat\3.1\Target\Routes\MyRoute.xml"
$xml = New-Object XML
$xml.Load($filePathToTask)
$element =  $xml.SelectSingleNode("//User")
$element.InnerText = "$aomuser"
if ($result -eq 0) {
    $aomurl = "aom.efficientio.com"
    $aomca = "\Hard Disk\TwinCAT\3.1\Target\Certificates\CA.crt"
    $aomcert = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR.crt"
    $aomkey = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR.key"
}
if ($result -eq 1) {
    $aomurl = "aom.tsg-portal.de"
    $aomca = "\Hard Disk\TwinCAT\3.1\Target\Certificates\CA_TSG.crt"
    $aomcert = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR_TSG.crt"
    $aomkey = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR_TSG.key"
}
if ($result -eq 2) {
    $aomurl = "aom.leo-b2b.burgenlandenergie.at"
    $aomca = "\Hard Disk\TwinCAT\3.1\Target\Certificates\CA_BE.crt"
    $aomcert = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR_BE.crt"
    $aomkey = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR_BE.key"
}
if ($result -in 3,7) {
    $aomurl = "aom.efficientio.com"
    $aomca = "\Hard Disk\TwinCAT\3.1\Target\Certificates\CA.crt"
    $aomcert = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR.crt"
    $aomkey = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR.key"
}
if ($result -eq 4) {
    $aomurl = "aom.efficientio.com"
    $aomca = "\Hard Disk\TwinCAT\3.1\Target\Certificates\CA.crt"
    $aomcert = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR.crt"
    $aomkey = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR.key"
}
if ($result -eq 5) {
    $aomurl = "aom.ems.bmsystems.at"
    $aomca = "\Hard Disk\TwinCAT\3.1\Target\Certificates\CA_bmsystems.crt"
    $aomcert = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR_bmsystems.crt"
    $aomkey = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR_bmsystems.key"
}
if ($result -eq 6) {
    $aomurl = "aom.effectas.com"
    $aomca = "\Hard Disk\TwinCAT\3.1\Target\Certificates\CA_effectas.crt"
    $aomcert = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR_effectas.crt"
    $aomkey = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR_effectas.key"
}

if ($result -eq 8) {
    $aomurl = "aom.eneries.com"
    $aomca = "\Hard Disk\TwinCAT\3.1\Target\Certificates\CA_eneries.crt"
    $aomcert = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR_eneries.crt"
    $aomkey = "\Hard Disk\TwinCAT\3.1\Target\Certificates\TwinCAT_XAR_eneries.key"
}

$element =  $xml.SelectSingleNode("//Address")
$element.InnerText = "$aomurl"
$element =  $xml.SelectSingleNode("//Ca")
$element.InnerText = "$aomca"
$element =  $xml.SelectSingleNode("//Cert")
$element.InnerText = "$aomcert"
$element =  $xml.SelectSingleNode("//Key")
$element.InnerText = "$aomkey"

$xml.Save($filePathToTask)
Write-Output "ADS-over-MQTT Configuration completed"


<#
 # Grand Finale
 #>
 Write-Output "SD-Card Preparation-Tool completed"
 Write-Output "Manual Steps needed: install ModbusTCP CAB, change Default PW"
 cmd /c pause
