# How to set up the MQTT publisher (custom script mode)

1. enable "ABP Decryption mode"
2. add the according amount of devices "ABP keys" (Dev ADDR, APP Session Key, Network Session Key, Decoder = ASCII)
3. prepare the correct mqtt certificate file for the mqtt broker and save this file under "./dragino/certificate.pem"
4. copy the files "./dragino/certificate.pem", "./dragino/forward_data_to_mqtt.lua", "./dragino/forward_data_to_mqtt.sh"
   and "./dragino/mappings.lua" into the folder "/etc/lora/customized_scripts" of the dragino gateway
5. adjust the file "/etc/lora/customized_scripts/mappings.lua" that maps identifiers to a base name and a device type to
   the identifiers at hand, these are the file names in the folder "/var/iot/channels" when the Dragino gateway is in
   the custom script execution mode
6. fill in the custom script parameters, these are "mqttHost" (parameter 1, example: mqtt.eneries.com),
   "mqttPort" (parameter 2, example: 8883), "mqttUser" (parameter 3, example: ecfbe82f-2099-4eca-8dc4-78aedc5d50f8),
   "mqttPass" (parameter 4, example: 0b18c213-18c3-4cff-a259-8b0cd9d073e3) and "checkIntervalSeconds" (parameter 5, example: 30)
7. after starting the custom script, logs will be written to "/var/customized_script_output.log" and the standard
   output, the payload conversion function can be tested by copying the file "./dragino/018229B9" to the folder "
   /var/iot/channels" with the default "./dragino/mappings.lua" configuration while the script is running

# How to set up the LoRaWAN sensor

## for Dragino sensors via AT commands, tested with: LSN50v2, LHT65N

1. set the 'network join mode' to "ABP mode" <br>
   `AT+NJM=0`&emsp;&emsp;_// Set the Network Join Mode. (0: ABP, 1: OTAA)_
2. adopt the data transmission interval if necessary<br>
   `AT+TDC=300000`&emsp;&emsp;_// set the application data transmission interval in ms_
3. reset MCU<br>
   `ATZ`&emsp;&emsp;_// Trig a reset of the MCU_
4. fetch all required data either by fetching it directly or via global config print<br>
   `AT+DADDR=?`&emsp;&emsp;_// Get the Device Address_<br>
   `AT+NWKSKEY=?`&emsp;&emsp;_// Get the Network Session Key_<br>
   `AT+APPSKEY=?`&emsp;&emsp;_// Get the Application Session Key_<br>
   `AT+CFG`&emsp;&emsp;_// print out all configuration_<br>

## Elsys sensors via App, tested with: ERS CO2, ERS CO2 Lite

1. open app "Sensor Settings", read sensor
2. disable OTAA, so the sensor switches to ABP mode
3. adopt timebase (= transmission interval)
4. set Device address, App session key and Network session key<br>
   _(!) needed to be done in the first test, seems pretty strange, may this isn't really necessary_
5. write settings to the sensor




## Dragino LoraWan Setup

	1. Gateway anstecken
	2. WLAN anmelden (dragino+dragino)
	3. Remote.it device hinzufügen
		a. 10.130.1.1/cgi-bin/system-remoteit.has
		b. Remote.it installieren
		c. License Key eingeben , Speichern und Registrieren
	4. Remote.it
		a. SSH Verbindung erstellen
		b. HTTP Verbindung erstellen
	5. Über SSH verbinden
		a. Username: root
		b. Passwort: dragino
		c. Eingabe -> 
			i. opkg update
			ii. opkg install luafilesystem
	6. SSH WinSCP Verbinden und Daten Hochladen
		a. /etc/lora/customized_scripts
		b. Daten kopieren: eneries\dragino
		c. cert, lua, sh & mapping
		d. Mappings anpassen auf die Sensoren mit ihrer Device ID
	7. HTTP Verbindung oder IP herstellen
		a. ABP aktivieren - Erstes Feld links oben
		b. Devices Sensoren Hinzufügen
		c. Custom Feld
			i. Parameter 1 mqttHost (mqtt.eneries.com)
			ii. Parameter 2 mqttPort (8883)
			iii. Parameter 3 mqttUser (Username Project)
			iv. Parameter 4 mqttPass (Password Project)
			v. Parameter 5 checkIntervalSeconds (zb 30)
		d. Speichern
	8. Reboot und fertig
		

