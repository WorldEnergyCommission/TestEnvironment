#!/bin/sh

# Verzeichnis definieren, das die zu verarbeitenden Dateien enthält
CHANNEL_DIR="/var/iot/channels"

# Prüfen, ob das Verzeichnis existiert
if [ ! -d "$CHANNEL_DIR" ]; then
    echo "Verzeichnis $CHANNEL_DIR existiert nicht. Beenden."
    exit 1
fi

# Dateien im Verzeichnis abrufen und in einer temporären Datei speichern
FILE_LIST="/tmp/channel_files.txt"
ls -1 "$CHANNEL_DIR" > "$FILE_LIST"

# Sicherstellen, dass die Zertifikatsdatei existiert
CERT_FILE="/etc/lora/customized_scripts/certificate.pem"
if [ ! -f "$CERT_FILE" ]; then
    echo "Zertifikatsdatei $CERT_FILE fehlt. Beenden."
    exit 1
fi

# Lua-Skript mit den notwendigen Argumenten aufrufen
lua /etc/lora/customized_scripts/forward_data_to_mqtt.lua "$FILE_LIST" "$CHANNEL_DIR" "$CERT_FILE"
