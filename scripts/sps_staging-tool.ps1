# SPS Staging Tool
# (c) Eneries GmbH
# for use on Win10 Devices (e.g. C6015)

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
    
    $eneries = [ChoiceDescription]::new('&eneries', 'platform choice: ENERIES')

    $options = [ChoiceDescription[]]($eneries)

    $global:result = $host.ui.PromptForChoice($Title, $Question, $options, 0)

    switch ($result) {
        0 { 'Your platform choice is: ENERIES' }
    }

}

Write-Output "Welcome! Script is starting"
# Platform Selector
New-Menu -Title 'Platform-Selector' -Question 'For which platform do you want to prepare?'

<#
 # generate Hostname
 #>

 # Default
$aomuserraw3 = (Read-Host "Please enter the target device name")
$aomuser = "$aomuserraw3"

# generate User, fetched from User Input
Write-Output "generated ADS-over-MQTT UserID: $aomuser"

<#
 # Download Files from FTP
 #>
Write-Output "starting File Download..."
New-Item -ItemType "directory" -Path "C:\EfficientIO-Staging\" -Force | Out-Null
#FTP Server Information - SET VARIABLES
$ftp = "ftp://lx63.hoststar.hosting" 
$user = 'efficientioSPS.efficientio.com' 
$pass = 'R7r|atu(~luY3k*GRefq'
$folder = 'staging'
if ($result -eq 0) {
    $folder2 = 'staging_EfficientIO'
}
if ($result -eq 1) {
    $folder2 = 'staging_TSG'
}
if ($result -eq 2) {
    $folder2 = 'staging_BE'
}
if ($result -eq 3) {
    $folder2 = 'staging_BMS'
}
if ($result -eq 4) {
    $folder2 = 'staging_Effectas'
}
$target = "C:\EfficientIO-Staging\"

#SET CREDENTIALS
$credentials = new-object System.Net.NetworkCredential($user, $pass)

function Get-FtpDir ($url,$credentials) {
    $request = [Net.WebRequest]::Create($url)
    $request.Method = [System.Net.WebRequestMethods+FTP]::ListDirectory
    if ($credentials) { $request.Credentials = $credentials }
    $response = $request.GetResponse()
    $reader = New-Object IO.StreamReader $response.GetResponseStream() 
    while(-not $reader.EndOfStream) {
        $reader.ReadLine()
    }
    #$reader.ReadToEnd()
    $reader.Close()
    $response.Close()
}

#SET FOLDER PATH
$folderPath= $ftp + "/" + $folder + "/"
$files = Get-FTPDir -url $folderPath -credentials $credentials

$files 

$webclient = New-Object System.Net.WebClient 
$webclient.Credentials = New-Object System.Net.NetworkCredential($user,$pass) 
$counter = 0
foreach ($file in ($files | where {$_ -like "*?.?*"})){
    $source=$folderPath + $file  
    $destination = $target + $file 
    $webclient.DownloadFile($source, $target+$file)

    #PRINT FILE NAME AND COUNTER
    $counter++
    $counter
    $source
}

$folderPath2= $ftp + "/" + $folder2 + "/"
$files = Get-FTPDir -url $folderPath2 -credentials $credentials

$files 

$webclient = New-Object System.Net.WebClient 
$webclient.Credentials = New-Object System.Net.NetworkCredential($user,$pass) 
$counter = 0
foreach ($file in ($files | where {$_ -like "*?.?*"})){
    $source=$folderPath2 + $file  
    $destination = $target + $file 
    $webclient.DownloadFile($source, $target+$file)

    #PRINT FILE NAME AND COUNTER
    $counter++
    $counter
    $source
}
Write-Output "File Download completed"

<#
 # Install TwinCAT XAR
 #>
Write-Output "starting TwinCAT XAR Installation..."
$procname = Get-ItemPropertyValue -Path 'C:\EfficientIO-Staging\TC31-XAR-Setup*.exe' -Name Name
$proc = Start-Process C:\EfficientIO-Staging\$procname -NoNewWindow -PassThru
$proc.WaitForExit()
cmd /c pause
Write-Output "TwinCAT XAR Installation completed"
Write-Output "running win8settick.bat ..."
$proc = Start-Process C:\TwinCAT\3.1\System\win8settick.bat -NoNewWindow -PassThru
$proc.WaitForExit()
Write-Output "win8settick.bat executed"

<#
 # Install TF6250 ModbusTCP
 #>
 Write-Output "starting TF6250 ModbusTCP Installation..."
 $procname = Get-ItemPropertyValue -Path 'C:\EfficientIO-Staging\TF6250-Modbus-TCP.exe' -Name Name
 $proc = Start-Process C:\EfficientIO-Staging\$procname -NoNewWindow -PassThru
 $proc.WaitForExit()
 Write-Output "TF6250 ModbusTCP Installation completed"

<#
 # Certificate Deployment
 #>
# create Folders
Write-Output "creating Certificate Folders..."
New-Item -ItemType "directory" -Path "C:\TwinCat\3.1\Config\Certificates" -Force | Out-Null
New-Item -ItemType "directory" -Path "C:\TwinCat\3.1\Target\Certificates" -Force | Out-Null
Write-Output "Certificate Folders created"

if ($result -eq 0) {
    # copy Files for EfficientIO
    Write-Output "copy Certificates..."
    Copy-Item "C:\EfficientIO-Staging\mqtt.pem" -Destination "C:\TwinCat\3.1\Config\Certificates"
    Copy-Item "C:\EfficientIO-Staging\CA.crt" -Destination "C:\TwinCat\3.1\Target\Certificates"
    Copy-Item "C:\EfficientIO-Staging\TwinCAT_XAR.crt" -Destination "C:\TwinCat\3.1\Target\Certificates"
    Copy-Item "C:\EfficientIO-Staging\TwinCAT_XAR.key" -Destination "C:\TwinCat\3.1\Target\Certificates"
    Write-Output "Certificates copied"
}

if ($result -eq 1) {
    # copy Files for TSG
    Write-Output "copy Certificates..."
    Copy-Item "C:\EfficientIO-Staging\mqtt_tsg.pem" -Destination "${drive}:\TwinCat\3.1\Config\Certificates"
    Copy-Item "C:\EfficientIO-Staging\CA_TSG.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "C:\EfficientIO-Staging\TwinCAT_XAR_TSG.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "C:\EfficientIO-Staging\TwinCAT_XAR_TSG.key" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Write-Output "Certificates copied"
}

if ($result -eq 2) {
    # copy Files for BE
    Write-Output "copy Certificates..."
    Copy-Item "C:\EfficientIO-Staging\mqtt_be.pem" -Destination "${drive}:\TwinCat\3.1\Config\Certificates"
    Copy-Item "C:\EfficientIO-Staging\CA_BE.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "C:\EfficientIO-Staging\TwinCAT_XAR_BE.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "C:\EfficientIO-Staging\TwinCAT_XAR_BE.key" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Write-Output "Certificates copied"
}

if ($result -eq 3) {
    # copy Files for BMS
    Write-Output "copy Certificates..."
    Copy-Item "C:\EfficientIO-Staging\mqtt_bms.pem" -Destination "${drive}:\TwinCat\3.1\Config\Certificates"
    Copy-Item "C:\EfficientIO-Staging\CA_bmsystems.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "C:\EfficientIO-Staging\TwinCAT_XAR_bmsystems.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "C:\EfficientIO-Staging\TwinCAT_XAR_bmsystems.key" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Write-Output "Certificates copied"
}

if ($result -eq 4) {
    # copy Files for Effectas
    Write-Output "copy Certificates..."
    Copy-Item "C:\EfficientIO-Staging\mqtt_effectas.pem" -Destination "${drive}:\TwinCat\3.1\Config\Certificates"
    Copy-Item "C:\EfficientIO-Staging\CA_effectas.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "C:\EfficientIO-Staging\TwinCAT_XAR_effectas.crt" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Copy-Item "C:\EfficientIO-Staging\TwinCAT_XAR_effectas.key" -Destination "${drive}:\TwinCat\3.1\Target\Certificates"
    Write-Output "Certificates copied"
}

<#
 # ADS-over-MQTT Config
 #>
# create File
Write-Output "generating ADS-over-MQTT Configuration..."
New-Item -ItemType "directory" -Path "C:\TwinCat\3.1\Target\Routes" -Force | Out-Null
New-Item -ItemType "file" -Path "C:\TwinCat\3.1\Target\Routes" -Name "MyRoute.xml"

if ($result -eq 0) {
    # insert File-Content from EfficientIO Template
    Get-Content -Path "C:\EfficientIO-Staging\MyRoute.xml" | Add-Content -Path "C:\TwinCat\3.1\Target\Routes\MyRoute.xml"
}

if ($result -eq 1) {
    # insert File-Content from TSG Template
    Get-Content -Path "C:\EfficientIO-Staging\MyRoute_TSG.xml" | Add-Content -Path "C:\TwinCat\3.1\Target\Routes\MyRoute.xml"
}

if ($result -eq 2) {
    # insert File-Content from BE Template
    Get-Content -Path "C:\EfficientIO-Staging\MyRoute_BE.xml" | Add-Content -Path "C:\TwinCat\3.1\Target\Routes\MyRoute.xml"
}

if ($result -eq 3) {
    # insert File-Content from BMS Template
    Get-Content -Path "C:\EfficientIO-Staging\MyRoute_bmsystems.xml" | Add-Content -Path "C:\TwinCat\3.1\Target\Routes\MyRoute.xml"
}

if ($result -eq 4) {
    # insert File-Content from Effectas Template
    Get-Content -Path "C:\EfficientIO-Staging\MyRoute_effectas.xml" | Add-Content -Path "C:\TwinCat\3.1\Target\Routes\MyRoute.xml"
}

# change User, based on MAC Adress
$filePathToTask = "C:\TwinCat\3.1\Target\Routes\MyRoute.xml"
$xml = New-Object XML
$xml.Load($filePathToTask)
$element =  $xml.SelectSingleNode("//User")
$element.InnerText = "$aomuser"
$xml.Save($filePathToTask)
Write-Output "ADS-over-MQTT Configuration completed"

<#
 # Install TeamViewer
 #>
Write-Output "starting TeamViewer Installation..."
$procname = Get-ItemPropertyValue -Path 'C:\EfficientIO-Staging\TeamViewer_Setup*.exe' -Name Name
$proc = Start-Process C:\EfficientIO-Staging\$procname -NoNewWindow -PassThru
$proc.WaitForExit()
Write-Output "TeamViewer Installation completed"

<#
 # Install AnyDesk
 #>
Write-Output "starting AnyDesk Installation..."
$procname = Get-ItemPropertyValue -Path 'C:\EfficientIO-Staging\AnyDes*.exe' -Name Name
$proc = Start-Process C:\EfficientIO-Staging\$procname -NoNewWindow -PassThru
$proc.WaitForExit()
Write-Output "AnyDesk Installation completed"

<#
 # Un-Zip TC3 Licensing Tool
 #>
Write-Output "un-zipping TC3 License Tool..."
Add-Type -AssemblyName System.IO.Compression.FileSystem
function Unzip
{
    param([string]$zipfile, [string]$outpath)

    [System.IO.Compression.ZipFile]::ExtractToDirectory($zipfile, $outpath)
}
New-Item -ItemType "directory" -Path "C:\TC3_LicenseTool\" -Force | Out-Null
Unzip "C:\EfficientIO-Staging\Tc3LicReqGen.zip" "C:\TC3_LicenseTool"
Write-Output "un-zipping completed"

<#
 # Grand Finale
 #>
# delete downloaded files
Remove-Item -Recurse -Force C:\EfficientIO-Staging

<#
 # change hostname
 #>
$hostname = hostname
Write-Output "current IPC Name: $hostname"
Rename-Computer -NewName $aomuser
$hostname = hostname
Write-Output "new IPC Name: $hostname"

Write-Output "Staging Automation completed, Download-Folder deleted"
Write-Output "Configure TeamViewer + AnyDesk for remote Access manually!"
Write-Output "and delete this script afterwards!"
Write-Output "... and do not forget the Licensing, but can be done later"
# cmd /c pause
Restart-Computer -Confirm