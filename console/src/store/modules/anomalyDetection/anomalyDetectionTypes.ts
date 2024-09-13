/**
 * A collection of device schemas with these options:
 * - **mappingsByColumns** - mappings grouped by columns, which will be drawn in the manage modal form
 * - **mappings** - collection of mappings used in device, are also the form fields in the manage modal form
 * - **isStartStopDate** - status whether the device has RangeDatePicker field in manage modal form
 * - **manageSchema** - manage modal form used to create, update device
 * - **isSettingsView** - status whether the device has a settings window
 */
const anomalyDetectionTypes = {
  HistoryAnomalyDetection: {
    mappingsByColumns: {
      variableMappings: ["unit", "var", "name", "agg", "scaling"],
      outputMappings: ["anomalyScore"],
      middleMappings: ["heartbeat", "errorWarning", "mpcReady"],
    },
    mappings: {
      unit: {
        component: "TextField",
        optional: false,
      },
      var: {
        component: "ComboboxField",
        items: "measurements",
        optional: false,
      },
      name: {
        component: "TextField",
        optional: false,
      },
      agg: {
        component: "SelectField",
        items: "aggregations",
        optional: false,
      },
      scaling: {
        component: "ScalingField",
        optional: false,
      },
      heartbeat: {
        component: "ComboboxField",
        items: "measurements",
        optional: false,
      },
      errorWarning: {
        component: "ComboboxField",
        items: "measurements",
        optional: false,
      },
      mpcReady: {
        component: "ComboboxField",
        items: "measurements",
        optional: false,
      },
      anomalyScore: {
        component: "ComboboxField",
        items: "measurements",
        optional: true,
      },
    },
    isStartStopDate: true,
    manageSchema: "DefaultSchema",
    isSettingsView: false,
  },
  StreamAnomalyDetection: {
    mappingsByColumns: {
      variableMappings: ["unit", "var", "name", "agg", "scaling"],
      outputMappings: ["anomalyScore"],
      middleMappings: ["heartbeat", "errorWarning", "mpcReady"],
    },
    mappings: {
      unit: {
        component: "TextField",
        optional: false,
      },
      var: {
        component: "ComboboxField",
        items: "measurements",
        optional: false,
      },
      name: {
        component: "TextField",
        optional: false,
      },
      agg: {
        component: "SelectField",
        items: "aggregations",
        optional: false,
      },
      scaling: {
        component: "ScalingField",
        optional: false,
      },
      heartbeat: {
        component: "ComboboxField",
        items: "measurements",
        optional: false,
      },
      errorWarning: {
        component: "ComboboxField",
        items: "measurements",
        optional: false,
      },
      mpcReady: {
        component: "ComboboxField",
        items: "measurements",
        optional: false,
      },
      anomalyScore: {
        component: "ComboboxField",
        items: "measurements",
        optional: true,
      },
    },
    isStartStopDate: false,
    manageSchema: "DefaultSchema",
    isSettingsView: false,
  },
};

export default anomalyDetectionTypes;
