const MQTT_BASE_TOPIC = "shellies/";
const MAX_SHELLY_CHANNELS = 4;
const MEASUREMENT_INTERVAL_MS = 1000;

function sendPhaseInfo(res) {
  const timestamp = Date.now() / 1000;
  const powerFactor = res.pf === 0 ? 1 : res.pf;
  const activePower = res.apower;
  const apparentPower = activePower / powerFactor;
  const reactivePower =
    Math.pow(Math.pow(apparentPower, 2) - Math.pow(activePower, 2), 0.5) || 0;
  const payload = {
    channelId: res.id,
    powerFactor: powerFactor,
    activePower: activePower,
    reactivePower: reactivePower,
    apparentPower: apparentPower,
    voltage: res.voltage,
    current: res.current,
    frequency: res.freq,
    activeEnergyCounter: res.aenergy.total,
    timestamp: timestamp,
  };
  MQTT.publish(
    MQTT_BASE_TOPIC + clientId + "/relay/" + JSON.stringify(res.id),
    JSON.stringify(payload),
    2,
    false
  );
}

let clientId = "";
Shelly.call(
  "MQTT.GetConfig",
  {},
  function (mqtt_res, error_code, error_msg, ud) {
    if (mqtt_res !== undefined) {
      clientId = mqtt_res.topic_prefix;
    }
  },
  null
);

let isShellyEnergyMeterDevice = false;
Shelly.call(
  "EM.GetStatus",
  { id: 0 },
  function (em_res, error_code, error_msg, ud) {
    if (em_res !== undefined) {
      isShellyEnergyMeterDevice = true;
    }
  },
  null
);

Timer.set(MEASUREMENT_INTERVAL_MS, true, function (ud) {
  if (isShellyEnergyMeterDevice) {
    Shelly.call(
      "EM.GetStatus",
      { id: 0 },
      function (em_res, error_code, error_msg, ud) {
        if (em_res !== undefined) {
          Shelly.call(
            "EMData.GetStatus",
            { id: 0 },
            function (emdata_res, error_code, error_msg, ud) {
              if (emdata_res !== undefined) {
                sendPhaseInfo({
                  pf: em_res.a_pf,
                  apower: em_res.a_act_power,
                  id: 0,
                  voltage: em_res.a_voltage,
                  current: em_res.a_current,
                  freq: em_res.a_freq,
                  aenergy: { total: emdata_res.a_total_act_energy },
                });
                sendPhaseInfo({
                  pf: em_res.b_pf,
                  apower: em_res.b_act_power,
                  id: 1,
                  voltage: em_res.b_voltage,
                  current: em_res.b_current,
                  freq: em_res.b_freq,
                  aenergy: { total: emdata_res.b_total_act_energy },
                });
                sendPhaseInfo({
                  pf: em_res.c_pf,
                  apower: em_res.c_act_power,
                  id: 2,
                  voltage: em_res.c_voltage,
                  current: em_res.c_current,
                  freq: em_res.c_freq,
                  aenergy: { total: emdata_res.c_total_act_energy },
                });
              }
            },
            null
          );
        }
      },
      null
    );
  } else {
    for (let channelId = 0; channelId < MAX_SHELLY_CHANNELS; channelId++) {
      Shelly.call(
        "Switch.GetStatus",
        { id: channelId },
        function (switch_res, error_code, error_msg, ud) {
          if (switch_res !== undefined) {
            sendPhaseInfo(switch_res);
          }
        },
        null
      );
    }
  }
});
