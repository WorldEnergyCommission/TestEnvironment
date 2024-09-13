# dashboard

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Lints and fixes files

```
npm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

## Whitelabels

The dashboard can be configured to work with different whitelabels, i.e. to use a specific logo, color theme, etc. for a
given client.

### Create new whitelabel

1. Open the `config.json` file in the root of the project.
1. Add the new config to the json object. As a key, specifying its domain, e.g. `<whitelabelname>.console.lynus.io` (
   default domain used for whitelabel demos). As the corresponding value, take a look at the other config definitions
   and take over the needed values. All values that are defined inside a whitelabel's config overwrite the default
   values of Lynus. Therefore, only values that **differ** from the default values have to be added to a whitelabel
   config. E.g.

```
"<whitelabelname>.console.lynus.io": {
  "TITLE": "new whitelabel",
  ...
}
```

4. To test a created config in development mode, run the console locally with `npm run serve` and follow the
   instructions inside `config.ts`.

### Test whitelabel in production mode

1. Run `npm run build` to build the console.
1. Serve the production version locally by running `serve dist -p 8080` within the console folder.
1. Open the file `dist/index.html` and find the `//{{WHITELABEL_CONFIG}}` comment. Replace it with:

```
var config = <WHITELABEL_JSON_OBJECT>;
```

where `<WHITELABEL_JSON_OBJECT>` is your whitelabel config (can be a copied value from `config.json`).
4\. Save the file.
5\. Open `localhost:8080` in your browser and see the whitelabel in action.

## Devices and Variables intro

A **Device** is a logical component of the system which stores its type, settings and the mappings to **Variables**
which it consumes. Devices are assigned to areas and can display linked vavriables in the UI or modify them with
controls. Some devices also produce variables in the cloud as controllers (see TimeSwitch).

**Variables** are stored and exchanged via MQTT broker. Variables are scoped by the project, therefore devices can share
variables and react upon each other. There are two MQTT channels for each project that allow bidirectional flow of
messages between the cloud (the api server) and edge devices:

```
GetDeviceToCloudMqttTopic: projects/{ projectId }/messages;
GetCloudToDeviceMqttTopic: projects/{ projectId }/messages2;
```

The UI console is listening to GetDeviceToCloudMqttTopic (messages) and publishing to GetCloudToDeviceMqttTopic (
messages2).

## Creating a new device

This example adds a new device named `DeviceXY`, its translations and library preview.

### 1. Create new component

In the console there is a directory for all devices. You can find it by following this path `console/src/ui/components/devices/...`. The file should look like `DeviceXY.vue`.

### 2. Fill new component

Your new component needs a property called `deviceData` of type `IDevice` and a wrapper component called `DefaultDeviceLayout.vue`. The Layout has slots which are used to configure various aspects of the device. It should look like the codeblock below.

```html
<template>
  <DefaultDeviceLayout>
    <template #custom-icon></template>
    <template #basic-controls></template>
    <template #additional-actions></template>
    <template #dnd></template>
    <template #charts-view></template>
    <template #settings-view></template>
  </DefaultDeviceLayout>
</template>
```

- `#custom-icon` - device icon slot, for configurable icon see ImpulseButton vue (enabled in deviceTypes)
- `#basic-controls` - device content in the area view
- `#additional-actions` -
- `#dnd` - copy from existing devices
- `#charts-view` - placeholder for a chart modal when clicking the button on the bottom right
- `#settings-view` - settings (enabled in deviceTypes)

### 3. Add device information to various files

- `config.ts` - add entry for DeviceXY depending on where you want to use it. The default implementation looks like the loc below.

  ```ts
  DEVICES: [..., "DeviceXY", ...]
  ```

- `deviceTypes.ts` (or `mlModelTypes.ts`) - add entry for DeviceXY within the mlModelTypes object. Your code should look like the code pattern below. Every object within the controllerMappings should exist in one of the mappingsByColumns. NOTE: Not all variables within DeviceXY are mandatory.

  ```ts
  DeviceXY: {
    mappingsByColumns: {
      inputMappings: [...],
      outputMappings: [...],
      middleMappings: [...],
    },
    controllerMappings: {...},
    groups: {...},
    systems: {...},
    settingsMappings: null,
    manageSchema: "DefaultSchema",
    isSettingsView: true,
  },
  ```

- `mlModel.json` - add entry three time for DeviceXY in german, italian and english
- `BaseDevicesList.ts` - import your new DeviceXY like in the codeblock below and add it the the defineComponent at the end of the file. NOTE: The name of your constant should be the same as the one in the mlModelTypes.ts.

  ```ts
  const DeviceXY = defineAsyncComponent({
    loader: () => import("@/ui/components/devices/.../DeviceXY.vue"),
    loadingComponent: CircleSpinner,
  });
  ```

- `devicesTypes.ts` - add entry for DeviceXY

  - **mappings** - add the names for used variables or the new device
  - **manageSchema** - `"DefaultSchema"` or use custom modal form to add and update device in area (e.g. muti step)
  - **isSettingsView** - enables or disable settings window
  - **iconSelection** - enables or disables custom icon selection in the adding process
  - **devicesSchemas** - in the created arrays you can define parts which are included in you component. It should look like the codeblock below

  ```ts
  mappings: {...},
  manageSchema: "DefaultSchema",
  isSettingsView: true or false,
  iconSelection: true or false,
  devicesSchemas: {
    basicDevices: [...],
    additionalBasicDevices: [...],
  },
  ```

### 4. Add Preview, Deviceview and Translations

- **Preview**
  - create `src/ui/components/devices/previews/devices/Indicator.vue` with getter named `previewNameLang` for device
    caption in the gallery
  - **DevicesView.vue** - import your **preview** device here, don't mix it up with the real one and add an entry in
    desired category of the `devicesLib` getter
- **Translations** - add device translations for all languages:
  - `src/lang/en/basicControls.json`
  - `src/lang/en/devices.json`
  - `src/lang/en/devicesDescriptions.json`

### 5. Add optional parts

- `Image`
  - You can provide a preview image for the device which is shown when adding the device as a new model. The image should be stored twice for the light and the dark theme of the website. Add the file to the path provided below:
  - `console/src/public/assets/images/previews/{themeDark or themeLight}/DeviceXY.png`
- `dnd.ts` - you can change the device size in the grid

## Reactivity

The devices can implement "push pattern" and reactively listen to MQTT variable changes by using

```
@Getter("measurements/measurement") measurement!: IMeasurementGetter;
```

```
get status() {
  return this.measurement(this.parsedMappings.status) === 1;
}
```

See `Indicator.vue` for details.

## Connect to local API instance

If you want to connect the console to the local API instance, rename the `.env.example-development`
to `.env.development` and set `VUE_APP_CUSTOM_API_URL` env variable. This will be picked up in `env.ts`, but only in dev
mode.
