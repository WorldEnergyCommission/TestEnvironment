# Testing Permissions Checklist

### General Project endpoints `/projects`
- [X] `/projects` Permission: **"listProject"**

*Note:* Users only see their projects, seems to work

- [X] `/projects` Permission: **"createProject"**

*Note:* Users don't see the button

- [ ] `/projects/{project_id}` Permission: **"readProject"**
- [ ] `/projects/{project_id}` Permission: **"writeProject"**
- [ ] `/projects/{project_id}` Permission: **"writeProject"**
- [ ] `/projects/{project_id}` Permission: **"deleteProject"**
- [ ] `/projects/{project_id}/mqtt-secret` Permission: **"readMQTTSecret"**


### Collection (Project specific) endpoints `projects/{project_id}/collections`
- [ ] `/projects/{project_id}/collections` Permission: **"createCollection"**

- [ ] `/projects/{project_id}/collections` Permission: **"listCollection"**

**Note** this is mapped, should allow to read collection that contains device

- [ ] `/projects/{project_id}/collections/{collection_id}` Permission: **"readDevice"** 

**Note** this is mapped, should allow to read collection that contains device

- [ ] `/projects/{project_id}/collections/{collection_id}` Permission: **"writeCollection"**
- [ ] `/projects/{project_id}/collections/{collection_id}` Permission: **"deleteCollection"**

### Devices (Project specific) endpoints `projects/{project_id}/devices`
- [ ] `/projects/{project_id}/devices-` Permission: **"createDevice"**
- [ ] `/projects/{project_id}/devices-` Permission: **"listDevice"**

*Note* **listDevice** is given to everyone, the handler filters with **readDevice**

- [ ] `/projects/{project_id}/devices/{device_id}` Permission: **"readDevice"**
- [ ] `/projects/{project_id}/devices/{device_id}` Permission: **"writeDevice"**
- [ ] `/projects/{project_id}/devices/chartOptions/{device_id}` Permission: **"readDevice"**

**Note** should this be writeDevice? or just get?

- [ ] `/projects/{project_id}/devices/{device_id}` Permission: **"deleteDevice"**
- [ ] `/projects/{project_id}/favorites/{device_id}` Permission: **"writeDevice"**
- [ ] `/projects/{project_id}/favorites/{device_id}` Permission: **"writeDevice"**


### Measurements (Project specific) endpoints `projects/{project_id}/collections`

These endpoints are mapped via *devices* or *AI Modules* 

- [ ] `/projects/measurements` Permission: ??
- [ ] `/projects/{project_id}/measurements-` Permission: **"listDevice"**

*Note* **listDevice** is given to everyone, the handler filters with **readDevice**

- [ ] `/projects/{project_id}/measurements/{measurement}` **"readDevice", "readAI"**
- [ ] `/projects/{project_id}/measurements/{measurement_id}/chart` **"readDevice" "readAI"**
- [ ] `/projects/{project_id}/measurements/{measurement_id}/publish` **"writeDevice", "writeAI"**
- [ ] `/projects/{project_id}/measurements/all/subscribe` 

*Note* subscribe handler filters directly


### Members (Project specific) endpoints `projects/{project_id}/members`

- [ ] `/projects/{project_id}/members-` Permission: **"listMember"**
- [ ] `/projects/{project_id}/members-` Permission: **"createMember"**
- [ ] `/projects/{project_id}/members/{member_id}` Permission: **"writeMember"**
- [ ] `/projects/{project_id}/members/{member_id}` Permission: **"readMember"**
- [ ] `/projects/{project_id}/members/{member_id}` Permission: **"deleteMember"**
- [ ] `/projects/{project_id}/members/{member_id}/permissions` Permission: **"readMember"**
- [ ] `/projects/{project_id}/members/{member_id}/permissions` Permission: **"writeMember"**
- [ ] `/projects/{project_id}/members/{member_id}/permissions` Permission: **"writeMember"**


### Users endpoints `/users`
- [ ] `/users` Permission: **"readUser"**
- [ ] `/users/{user}` Permission: **"readUser"**
- [ ] `/users/{user}/permissions` Permission: **"readUser"**

#### User-Enppoints without permissions
These are handled via JWT
- [X] `/users/me`
- [X] `/users/me/password`
- [X] `/users/me/otp`
- [X] `/users/me/otp`
- [X] `/users/me/otp/{otp_id}`
- [X] `/users/me/otp/qr`


### Documents (Project specific) endpoints `projects/{project_id}/documents`
- [ ] `/projects/{project_id}/documents-` Permission: **"readDocument"**                                                   
- [ ] `/projects/{project_id}/documents-` Permission: **"createDocument"**                                           
- [ ] `/projects/{project_id}/documents/{document_id}` Permission: **"deleteDocument"**


### Assets endpoints `/assets`
- [ ] `/assets` Permission: **"createAsset"**
- [ ] `/assets/{name}"` 
- [ ] `/weather` Permission: **"readWeather"**
- [ ] `/places` Permission: **"readWeather"**


### Alerts (Project specific) endpoints `projects/{project_id}/alerts`
- [ ] `/projects/{project_id}/alerts-` Permission: **"listAlert"**
- [ ] `/projects/{project_id}/alerts`                                    
- [ ] `/projects/{project_id}/alerts-` Permission: **"writeAlert"**
- [ ] `/projects/{project_id}/alerts/{alert_id}-` Permission: **"writeAlert"**

### Icons
- [ ] `/icons` Permission: **"readIcon"**

### Notifications
- [ ] `/notifications` notificationsCreateHandler 

### Invoices
- [ ] `/invoices` Permission: **"readInvoice"**
- [ ] `/invoices/{invoice_id}` Permission: **"readInvoice"**


### Rule (Project specific) endpoints `projects/{project_id}/rules`
- [ ] `/projects/{project_id}/rules-` Permission: **"listRule"**
- [ ] `/projects/{project_id}/rules-` Permission: **"createRule"**
- [ ] `/projects/{project_id}/rules/{rule_id}` Permission: []string{"writeRule", **"writeAI"}, **"rule_id", **"rule_id"**
- [ ] `/projects/{project_id}/rules/{rule_id}` Permission: []string{"deleteRule", **"deleteAI"}, **"rule_id", **"rule_id"**


### Reports (Project specific) endpoints `projects/{project_id}/reports`
- [ ] `/projects/{project_id}/reports-` Permission: **"listReport"**
- [ ] `/projects/{project_id}/reports-` Permission: **"createReport"**
- [ ] `/projects/{project_id}/reports/{report_id}` Permission: **"readReport", **"report_id", **"report_id"**
- [ ] `/projects/{project_id}/reports/{report_id}` Permission: **"writeReport", **"report_id", **"report_id"**
- [ ] `/projects/{project_id}/reports/{report_id}` Permission: **"deleteReport", **"report_id", **"report_id"**


### Permissions endpoints (some Project specific)
- [ ] `/permissions` Permission: **"readPermission"**
- [ ] `/permissions/groups` Permission: **"readPermission"**
- [ ] `/projects/{project_id}/permissions/{permission_id}/scopes` Permission: **"readPermission"**

*Note* should this work via writeMember? readDevices? ???


### AI (Project specific) endpoints `projects/{project_id}/controllers`
- [ ] `/projects/{project_id}/controllers-` Permission: **"listAI"**
- [ ] `/projects/{project_id}/controllers-` Permission: **"createAI"**
- [ ] `/projects/{project_id}/controllers/{model_id}` Permission: **"readAI"****
- [ ] `/projects/{project_id}/controllers/{model_id}` Permission: **"writeAI"****
- [ ] `/projects/{project_id}/controllers/{model_id}` Permission: **"deleteAI"****
- [ ] `/projects/{project_id}/controllers/{model_id}/favorites` Permission: **"writeAI"****
- [ ] `/projects/{project_id}/controllers/{model_id}/favorites` Permission: **"writeAI"****
- [ ] `/projects/{project_id}/controllers/{model_id}/timing` Permission: **"writeAI"****
- [ ] `/projects/{project_id}/controllers/{model_id}/settings` Permission: **"writeAI"****


### Autarchy (Project specific) endpoints `projects/{project_id}/autarchy`
- [ ] `/projects/{project_id}/autarchy/{start}/{end}-` Permission: **"readAutarchy"**


### (AI)-Weather (Project specific) endpoints `projects/{project_id}/weather`
- [ ] `/projects/{project_id}/weather-` Permission: **"readAIWeather"**
- [ ] `/projects/{project_id}/weather-` Permission: **"createAIWeather"**
- [ ] `/projects/{project_id}/weather-` Permission: **"deleteAIWeather"**
