1. Add the domain, MQTT certificate and private key, TLS certificate and private key.
   The best file format for the certificate and private key combination is .pfx (PKCS 12), there you can create the needed .crt file (containing the certificate) and .key file (containing the private key) that you need to BASE64-encode with the following commands, you need a password:
   ```shell
   openssl pkcs12 -in file.pfx -out file.crt -nokeys -clcerts
   openssl pkcs12 -in file.pfx -out file.key -nodes -nocerts
   ```
   This ensures that in the private key file only the private key is present and it also ensures that the certificate file contains just the last client certificate.
   Certificate files are usually stored in .crt
   and .pem file formats, each using the X.509 format, but .crt files usually only contain one certificate (no hard restriction), where .pem files can contain multiple (e.g. the whole certificate chain).
   If you get a separate .key file and .crt/.pem file, you can generate a .pfx file with the following command, you need to set a password:
   ```shell
   openssl pkcs12 -in file.{pem | crt} -inkey file.key -export -out file.pfx
   ```
   If you want to check if the private key matches the certificate (which is not checked by the above generation command), then you can use the following sanity check:
   ```shell
   openssl rsa -noout -modulus -in file.key | openssl sha256
   openssl x509 -noout -modulus -in file.crt | openssl sha256
   ```
   If the outputs do not match, they do not belong together, if the output matches it is very likely that they belong together.
   Then you need to copy all the intermediate certificates in-between the last client certificate and the root certificate authority to the generated file.crt file below the client certificate with one newline in-between.
   The required intermediate certificates can be extracted from a certificate file that contains the whole certificate chain or downloaded after a check on https://www.ssllabs.com/ssltest/analyze.html?d=api.{DOMAIN} under the point **Certification Paths**.
   The root certificate should not be included in the file.crt file.
   Please make sure that the last **client certificate is the top entry** (the one with the custom domain) and then all certificates on the path to the root certificate are added below in the correct order, except the root certificate.
2. Run the script **scripts/generate_credentials_for_cluster.py** with the appropriate params
3. Copy some entries from other clusters that contain these strings (remove the copy suffix):

   - REDIS_ADDRESS
   - POSTGRES_SSLMODE
   - POSTGRES_ADDRESS
   - POSTGRES_PORT
   - MOSQUITTO_ADDRESS
   - EXOSCALE_EFFICIENTIO_LINUX_SERVER_PUBLIC_KEY (if you want to have an own key per cluster, please change it,
     otherwise you can copy it)
   - EXOSCALE_EFFICIENTIO_LINUX_SERVER_PRIVATE_KEY (if you want to have an own key per cluster, please change it,
     otherwise you can copy it)
   - EXOSCALE_HUGE_SKS_NODEPOOL_INSTANCE_TYPE (for new clusters take the configuration from one other cluster)
   - EXOSCALE_HUGE_SKS_NODEPOOL (for new clusters take the configuration from one non-eneries cluster)
   - MINIMUM_RAM_BIG_SERVICES (for new clusters take the configuration from one non-eneries cluster)
   - MINIMUM_CPU_BIG_SERVICES (for new clusters take the configuration from one non-eneries cluster)
   - MAXIMUM_CPU_BIG_SERVICES (for new clusters take the configuration from one non-eneries cluster)
   - MAXIMUM_RAM_BIG_SERVICES (for new clusters take the configuration from one non-eneries cluster)
   - POSTGRES_CONFIG_BIG_SERVICES (for new clusters take the configuration from one non-eneries cluster)
   - OPENWEATHERMAP_KEY (if you want to have an own key per cluster, please change it, otherwise you can copy it)
   - OQDO_SIGNALR_CONNECTION_STRING (copy from eneries to actually have a connection, otherwise the connection is
     disabled)
   - OEAMTC_EVENT_HUB_CONNECTION_STRING (copy from eneries to actually have a connection, otherwise the connection
     is disabled)
   - EASEE_AMQP_CONNECTION_STRING (copy from eneries to actually have a connection, otherwise the connection
     is disabled)

4. Add the cluster name as key **{CLUSTER_PREFIX}\_CLUSTER_NAME_BASE64**, make sure it is correctly encoded and
   lowercase.
5. Add the sendgrid configs for the new cluster and all its realms in **{CLUSTER_PREFIX}\_SENDGRID_CONFIGS_BASE64**, try to
   decode the value to verify it is correct JSON, otherwise the API will fail to start
6. Add all realms to the new cluster under the realms group, please supply all needed configuration entries and check if
   the amount of entries matches the amount from other realms
7. Check the **console/WHITELABEL_README.md** file if also all necessary whitelabel configuration was made in the code
8. Open the Exoscale console for the cluster and add under **IAM/KEYS** a key with all rights and the name "
   infrastructure_provider_key". You also have to assign it the role "admin" which you must create before and you have
   to assign this role all service classes with "ALLOW"
9. Add the BASE64-encoded entries for the infrastructure key under **EXOSCALE_API_KEY** and **EXOSCALE_SECRET_KEY**
10. Add new cluster to **scripts/constants.py**
11. Before running the next script create a folder for the Terraform state file in the location \*
    \*infrastructure/terraform/{cluster_prefix}\*\*
12. Run **scripts/check_terraform.py** from the root of the repository and make sure to supply the cluster name, keepass
    path, keepass password and mode equal to "apply", update the state file in Git
13. When it is finished add the two entries **S3_ACCESS_KEY** and **S3_SECRET_KEY** to Keypass from the respective entry
    in the Terraform state file, you can find the entry by searching for "exoscale_iam_api_key" (you need to BASE64
    encode the entries), the one S3 keypair from the eneries cluster is also used in the clusterIndependent folder
    to store the Longhorn backups
14. Then, add the last entry in Keepass called **KUBECONFIG**, from the respective entry in the Terraform state file,
    you can find the entry by searching for "exoscale_sks_kubeconfig" (make sure to replace the **\n** with real
    newlines, save the file and encode it with **base64 -i config -w 0**)
15. Then add the new cluster as cluster option to all .yaml workflows using search and replace
16. Then start the workflow **cluster_ci_cd** just for the new cluster to deploy all services to sks cluster
17. Go to the Exoscale section **COMPUTE/LOAD BALANCERS** and copy the two IPs of them, the one IP with only port 80 and 443 is the console, the other IP is for nginx (the assignment of the IPs may take time)
18. Make sure to make the following DNS entries for the nginx IP address:

- admin.${DOMAIN}
- dashboard.${DOMAIN}
- monitoring.${DOMAIN}
- s3.${DOMAIN}
- static.${DOMAIN}
- accounts.${DOMAIN}
- api.${DOMAIN}
- mqtt.${DOMAIN}

18. Make sure to make the following DNS entries for the console IP address for each console URI in the realm configs:

- console URI host

19. Check the SSL settings of **api.${DOMAIN}** and **console URI host** using [SSL Server Test](https://www.ssllabs.com/ssltest/), make sure to get an **A** score on both tests.
20. To create a **platform admin** register on the new console (any realm), use keycloak to find out the _user_id_ (is of type UUID). Use the kubernetes cluster config file and the **scripts/make_cluster_services_available_locally.py** script to forward the services locally (Usage in the scripts folder: ` py .\make_cluster_services_available_locally.py --prefix .\${CLUSTER_PREFIX}`, Note: the config file needs to be saved in a `.kube` directory in the user home folder as `${CLUSTER_PREFIX}_config` where `${CLUSTER_PREFIX}` is the new prefix of the cluster)
    Use a database tool, e.g.: DBeaver, to log into the database. Run the following SQL command: `UPDATE public.user_role SET role_id = 'adminUser' WHERE user_id = ${USER_ID}` (Repalce "{User_id}" with the id from keycloak)
