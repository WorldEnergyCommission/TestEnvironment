# script documentation

Scripts folders contains various scripts (currently) either written in powershell or python.

Scripts used in Github Actions:

- [deploy_all_compenents_to_cluster.py](#deploy_all_compenents_to_cluster.py)

## deploy_all_compenents_to_cluster.py

Contains an "CLUSTER_CONFIG" object in which some github actions are defined. The script then calls the Github API tostart them.

## make_cluster_services_available_locally.py

Start `kubectl` to passthrough a given cluster to localhost. A `kubeconfig` needs to be saved in the `{users-home}/.kube` directory. With the `--prefix` different configurations can be saved.

## sps_staging-tool.ps1

script downloads all necessary files, copies them to the right place, installs or starts the installation-routine for the important tools.
downloaded files are deleted after script completion.
the script itself needs to be deleted manually!

**how-to**<br>
just copy the script (via RDP) to a SPS with Win10 und run it with powershell.
delete the script afterwards.
<br>
<br>

## sps_sd-card_preparation-tool.ps1

script copies all necessary files to the right place to prepare the SD-card correctly for the SPS to come online through ADS-over-MQTT and be able to send data through MQTT to the cloud.

**how-to**<br>
run the script with powershell - leave it in the `/scripts` folder within the GitHub structure.
<br>
<br>

## migrate_project.py

**script description**
<br>script fully migrates a project from one environment (source) to another environment (target).
the project will be created as new project on target site.
all historical DB data (measurements) gets migrated.
creates a `dump.csv` file in `./scripts` folder - can be deleted afterwards.
Users needs to re-register or be created manually and also be assigned to the project manually.

currently missing in migration process:

- weather variables
- weather settings
- project documents
- AI Devices
- Users

see: https://efficientio.atlassian.net/browse/DEV-227
<br>

**requirements**

- python
- pandas
- requests
- psycopg
- paho
  <br>

**arguments**

- source_project_id
  > Project GUID from source
- source_domain
  > Domain (environment) from source
- source_realm
  > Source Realm used for authentication
- source_kubeconfig_filepath
  > path to kubeconfig-file from source environment
- source_db_user
  > DB user from source
- source_db_pass
  > DB password from source
- source_username
  > Username from source used for authentication (user must be assigned to project as admin which gets migrated)
- source_password
  > Password from source User used for authentication
- target_domain
  > Domain (environment) from target
- target_realm
  > Target Realm used for authentication
- target_kubeconfig_filepath
  > path to kubeconfig-file from target environment
- target_db_user
  > DB user from target
- target_db_pass
  > DB password from target
- target_username
  > Username from target used for authentication
- target_password
  > Password from target User used for authentication

<br>

**example**

```
python .\migrate_project.py --source_project_id "0d553fc2-e7f3-4571-9008-fb5428f4c828" --source_domain "efficientio.com" --source_realm "peneder" --source_kubeconfig_filepath "C:\Users\marku\.kube\efficientio_config" --source_db_user "axaxaxaxaxaxaxaxaxaxaxaxaxaxaxax" --source_db_pass "axaxaxaxaxaxaxaxaxaxaxaxaxaxaxax" --source_username "username" --source_password "password" --target_domain "connect.peneder.com" --target_realm "peneder" --target_kubeconfig_filepath "C:\Users\marku\.kube\peneder_config" --target_db_user "axaxaxaxaxaxaxaxaxaxaxaxaxaxaxax" --target_db_pass "axaxaxaxaxaxaxaxaxaxaxaxaxaxaxax" --target_username "username" --target_password "password"
```
