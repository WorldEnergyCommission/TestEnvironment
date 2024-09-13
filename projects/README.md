# SPS Preparation

files located at: `eneries/projects/spsbase`

## MQTT Cert

1. deploy the MQTT-Broker Cert at `\TwinCat\3.1\Config\Certificates`

   > `mqtt.pem` or `mqtt_TSG.pem` or `mqtt_BE.pem`
   > or `mqtt_peneder.pem` - but normally maintained by STIWA

## ADS-over-MQTT

1. deploy the Route File (like a config file) at `\TwinCat\3.1\Target\Routes`

   there are templates for both Windows-Versions `Win` and `WinCE` and all customers (except Peneder, no ADS-over-MQTT deployed)
   > `MyRouteWin_*`<br>
   > `MyRouteWinCE_*`

   or correct the File-Path in the .xml if necessary

   - for WinCE devices (eg CX8190): `\HardDisk\...`
   - for Win10 devices (eg C6015): `C:\`

<br>

2. deploy the necessary certificates at `\TwinCat\3.1\Target\Certificates`

   > `CA.crt`, `TwinCAT_XAR.crt`, `TwinCAT_XAR.key`

   or

   > `CA_TSG.crt`, `TwinCAT_XAR_TSG.crt`, `TwinCAT_XAR_TSG.key`
   
   or

   > `CA_BE.crt`, `TwinCAT_XAR_BE.crt`, `TwinCAT_XAR_BE.key`

# XAE Preparation (TwinCAT Engineering Workstation)

files located at: `eneries/projects/spsbase/XAE`

## ADS-over-MQTT

1. deploy the Route File (like a config file) at `C:\TwinCat\3.1\Target\Routes`

   > `MyRoute_XAE_EfficientIO.xml` or/and `MyRoute_XAE_TSG.xml` or/and `MyRoute_XAE_BE.xml`

<br>

2. deploy the necessary certificates at `\TwinCat\3.1\Target\Certificates`

   > `CA.crt`, `TwinCAT_XAE.crt`, `TwinCAT_XAE.key`

   or/and

   > `CA_TSG.crt`, `TwinCAT_XAE_TSG.crt`, `TwinCAT_XAE_TSG.key`

   or/and

   > `CA_BE.crt`, `TwinCAT_XAE_BE.crt`, `TwinCAT_XAE_BE.key`
