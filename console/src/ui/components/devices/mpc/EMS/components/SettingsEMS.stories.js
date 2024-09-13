import SettingsEMSComponent from "./SettingsEMS.vue";

export default {
  title: "Devices/MPC/EMS/systems/SettingsEMS",
  component: SettingsEMSComponent,
};

export const SettingsEMS = {
  args: {
    mpcData: {
      data: {
        meta: {
          controllerMappings: {
            state_enable_ems: "state",
            enable_ems: "state",
            operation_mode: "state",
            message: "state",
            size_main_fuse: "actualValue",
            max_depth: "actualValue",
            reserve_battery: "actualValue",
            min_charge_battery: "actualValue",
            reserve_charge: "actualValue",
            update_time: "actualValue",
            allow_charging_button: "state",
            allow_charging_state: "state",
            activate_main_fuse: "state",
            state_main_fuse: "state",
          },
        },
      },
    },
    deviceData: {
      data: {
        meta: {
          settings: {
            mode: null,
            algorithmModelEms: null,
            energyPrice: {
              start_low: 2,
              end_low: 3,
              start_high: 4,
              end_high: 5,
              price_low: 6,
              price_high: 7,
            },
            timezone: "Europe/Vienna",
          },
        },
      },
    },
  },
};
