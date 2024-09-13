--------------- PV -------------
INSERT INTO data_mapping_types("id", "name", description) values ('c84bf644-1290-441a-86a9-b3b40e73aa5c', 'PV System', 'Photovoltaik System mapping for Power and an optional error state');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('power', 'c84bf644-1290-441a-86a9-b3b40e73aa5c', false, 'kW', 'View');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('error', 'c84bf644-1290-441a-86a9-b3b40e73aa5c', true, '0 | 1 | 2', 'AdditionalView');

--------------- Generator -------------
INSERT INTO data_mapping_types("id", "name", description) values ('01cdfa7b-b6b9-4cec-9be3-d0f6cdaf4afb', 'Generator System', 'Generator System mapping with Input and Outpu controls');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('power', '01cdfa7b-b6b9-4cec-9be3-d0f6cdaf4afb', false, 'kW', 'View');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('error', '01cdfa7b-b6b9-4cec-9be3-d0f6cdaf4afb', false, '0 | 1 | 2', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('status', '01cdfa7b-b6b9-4cec-9be3-d0f6cdaf4afb', false, '0 | 1 | 2', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('reset_state', '01cdfa7b-b6b9-4cec-9be3-d0f6cdaf4afb', true, '0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('enabled_state', '01cdfa7b-b6b9-4cec-9be3-d0f6cdaf4afb', true, '0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('reset', '01cdfa7b-b6b9-4cec-9be3-d0f6cdaf4afb', true, '0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('enabled', '01cdfa7b-b6b9-4cec-9be3-d0f6cdaf4afb', true, '0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('soc_enabled', '01cdfa7b-b6b9-4cec-9be3-d0f6cdaf4afb', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('soc_disabled', '01cdfa7b-b6b9-4cec-9be3-d0f6cdaf4afb', true, '%', 'Control');

--------------- Grid -------------
INSERT INTO data_mapping_types("id", "name", description) values ('85354087-07a6-459e-b524-2302e0ebc922', 'Grid System', 'Grid connection mapping for Power and an optional error state'); 
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('power', '85354087-07a6-459e-b524-2302e0ebc922', false, 'kW', 'View');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('size', '85354087-07a6-459e-b524-2302e0ebc922', false, 'kW', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('status', '85354087-07a6-459e-b524-2302e0ebc922', true, '0 | 1 | 2', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('island', '85354087-07a6-459e-b524-2302e0ebc922', true, '0 | 1', 'AdditionalView');

--------------- Battery -------------
INSERT INTO data_mapping_types("id", "name", description) values ('9b455a11-26b4-4058-9fad-c2a4db23a2fc', 'Battery System', 'Battery System mapping'); 
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('power', '9b455a11-26b4-4058-9fad-c2a4db23a2fc', false, 'kW', 'View');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('soc', '9b455a11-26b4-4058-9fad-c2a4db23a2fc', false, '%', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('error', '9b455a11-26b4-4058-9fad-c2a4db23a2fc', true, '0 | 1 | 2', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('target_power', '9b455a11-26b4-4058-9fad-c2a4db23a2fc', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_enable', '9b455a11-26b4-4058-9fad-c2a4db23a2fc', true, '0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_reset', '9b455a11-26b4-4058-9fad-c2a4db23a2fc', true, '0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('capacity', '9b455a11-26b4-4058-9fad-c2a4db23a2fc', true, 'kWh', 'Control');

--------------- House -------------
INSERT INTO data_mapping_types("id", "name", description) values ('7f357a26-a1da-4dd3-9f9d-09b6d26d17f3', 'House System', 'House System mapping for Power and an optional error state as well as enabling and disabling connection');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('power', '7f357a26-a1da-4dd3-9f9d-09b6d26d17f3', false, 'kW', 'View');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('error', '7f357a26-a1da-4dd3-9f9d-09b6d26d17f3', true, '0 | 1 | 2', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_enable', '7f357a26-a1da-4dd3-9f9d-09b6d26d17f3', true, '0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('switch_enable', '7f357a26-a1da-4dd3-9f9d-09b6d26d17f3', true, '0 | 1', 'Control');


--------------- Charging Station -------------
INSERT INTO data_mapping_types("id", "name", description) values ('63b67d7e-5c3f-47ed-9815-e4e35b518d41', 'Generator System', 'Charging Station System mapping for electric car chargers');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('power', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', false, 'kW', 'View');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('error', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true,'0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('car_connected', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true,'0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('charging_time', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true, '32 bit', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_charging_station', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true, '0 | 1 | 2', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_emergency', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true, '0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('slider_target_power', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_manual', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true, '0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('min_power', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('target_power', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_enable', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true, '0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('switch_emergency', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true, '0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('priority', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true, '0-255', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('enable_soc', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('disable_soc', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('max_power', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', false, 'kW', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('switch_manual', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true,'0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('slider_manual', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('slider_min_power', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('switch_enable', '63b67d7e-5c3f-47ed-9815-e4e35b518d41', true,'0 | 1', 'Control');


--------------- Electric Heating Element -------------
INSERT INTO data_mapping_types("id", "name", description) values ('5324ec6e-8564-4dad-899e-f72be7dd6b2f', 'Electric Heating Element', 'Electric Heating Element mappings');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('power', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', false, 'kW', 'View');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('temperature', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true, '-30 +120', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('error', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true,'0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_electric_heating', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true, '0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('switch_emergency', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true, '0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_manual', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true, '0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_time', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true, '0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_disable_protection', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true,'0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('slider_target_power', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('target_power', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_enable', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true,'0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('switch_emergency', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true, '0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('priority', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true, '0-255', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('enable_soc', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('disable_soc', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('switch_disable_protection', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true,'0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('switch_manual', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true,'0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('slider_manual', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('switch_time', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true,'0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('hour_on', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true,'0-23', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('hour_off', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true,'0-23', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('minute_on', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true,'0-59', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('minute_off', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true,'0-59', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('target_temp_on', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true, '0-120', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('target_temp_off', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true, '0-120', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('target_temp_max', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true, '0-120', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('switch_enable', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', true,'0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('max_power', '5324ec6e-8564-4dad-899e-f72be7dd6b2f', false, 'kW', 'Control');


--------------- Heating Pump -------------
INSERT INTO data_mapping_types("id", "name", description) values ('26262521-3af4-4eb2-b2ad-c8e7cbb9a868', 'Heating Pump', 'Heating Pump mappings');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('power', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', false, 'kW', 'View');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('error', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true,'0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_reset', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_heating_pump', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_emergency', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_manual', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('manual_power', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '%', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_time', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '0 | 1', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_time_power', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '%', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('flow_temperature', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '-30 +120', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('return_temperature', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '-30 +120', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('inlet_temperature', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '-30 +120', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('outlet_temperature', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '-30 +120', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('boiler_temperature', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '-30 +120', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('boiler_water_temperature', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '-30 +120', 'AdditionalView');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('target_power', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('state_enable', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('switch_emergency', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('priority', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '0-255', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('enable_soc', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('disable_soc', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('switch_emergency', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('switch_manual', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true,'0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('slider_manual', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('switch_time', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true,'0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('slider_power', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true, '%', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('hour_on', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true,'0-23', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('hour_off', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true,'0-23', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('minute_on', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true,'0-59', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('minute_off', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true,'0-59', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('switch_enable', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', true,'0 | 1', 'Control');
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group") values ('max_power', '26262521-3af4-4eb2-b2ad-c8e7cbb9a868', false, 'kW', 'Control');




--------------- EMS -------------
INSERT INTO module_types ("id", "name", description, frontend_type) values ('93261f16-89eb-45b9-b074-742fe631ad01', 'Energy view', 'Efficiently manage show energy systems', 'EnergyViewModule'); 
INSERT INTO module_type_data_mappings ("name", description, module_type_id, data_mapping_type_id) 
VALUES ('PV','PV system(s) that should be controlled by EMS', '93261f16-89eb-45b9-b074-742fe631ad01', 'c84bf644-1290-441a-86a9-b3b40e73aa5c');
INSERT INTO module_type_data_mappings ("name", description, module_type_id, data_mapping_type_id) 
VALUES ('Grid','Grid system(s) that should be controlled by EMS','93261f16-89eb-45b9-b074-742fe631ad01','85354087-07a6-459e-b524-2302e0ebc922');
INSERT INTO module_type_data_mappings ("name", description, module_type_id, data_mapping_type_id) 
VALUES ('Battery','Battery system(s) that should be controlled by EMS','93261f16-89eb-45b9-b074-742fe631ad01','9b455a11-26b4-4058-9fad-c2a4db23a2fc');
INSERT INTO module_type_data_mappings ("name", description, module_type_id, data_mapping_type_id) 
VALUES ('House','Battery system(s) that should be controlled by EMS','93261f16-89eb-45b9-b074-742fe631ad01','7f357a26-a1da-4dd3-9f9d-09b6d26d17f3');
INSERT INTO module_type_data_mappings ("name", description, module_type_id, data_mapping_type_id) 
VALUES ('Generator','Generator system(s) that should be controlled by EMS','93261f16-89eb-45b9-b074-742fe631ad01','01cdfa7b-b6b9-4cec-9be3-d0f6cdaf4afb');
INSERT INTO module_type_data_mappings ("name", description, module_type_id, data_mapping_type_id) 
VALUES ('EVChargingStation','Battery system(s) that should be controlled by EMS','93261f16-89eb-45b9-b074-742fe631ad01','63b67d7e-5c3f-47ed-9815-e4e35b518d41');
INSERT INTO module_type_data_mappings ("name", description, module_type_id, data_mapping_type_id) 
VALUES ('ElectricHeatingElement','Electric Heating Element system(s) that should be controlled by EMS','93261f16-89eb-45b9-b074-742fe631ad01','5324ec6e-8564-4dad-899e-f72be7dd6b2f');
INSERT INTO module_type_data_mappings ("name", description, module_type_id, data_mapping_type_id) 
VALUES ('HeatingPump','Heating Pump system(s) that should be controlled by EMS','93261f16-89eb-45b9-b074-742fe631ad01','26262521-3af4-4eb2-b2ad-c8e7cbb9a868');