import gymnasium as gym
import numpy as np

"""observation variables consist of time variables, simulator variables and meter variables"""

"""time observation variables"""
DEFAULT_TIME_VARIABLES = ['year', 'month', 'day_of_month', 'hour', 'minutes']

"""simulator observation variables"""
DEFAULT_5ZONE_VARIABLES = {
    'outdoor_temperature': (
        'Site Outdoor Air DryBulb Temperature',
        'Environment'),
    'outdoor_humidity': (
        'Site Outdoor Air Relative Humidity',
        'Environment'),
    'wind_speed': (
        'Site Wind Speed',
        'Environment'),
    'wind_direction': (
        'Site Wind Direction',
        'Environment'),
    'diffuse_solar_radiation': (
        'Site Diffuse Solar Radiation Rate per Area',
        'Environment'),
    'direct_solar_radiation': (
        'Site Direct Solar Radiation Rate per Area',
        'Environment'),
    'htg_setpoint': (
        'Zone Thermostat Heating Setpoint Temperature',
        'SPACE1-1'),
    'clg_setpoint': (
        'Zone Thermostat Cooling Setpoint Temperature',
        'SPACE1-1'),
    'air_temperature': (
        'Zone Air Temperature',
        'SPACE1-1'),
    'air_humidity': (
        'Zone Air Relative Humidity',
        'SPACE1-1'),
    'people_occupant': (
        'Zone People Occupant Count',
        'SPACE1-1'),
    'co2_emission': (
        'Environmental Impact Total CO2 Emissions Carbon Equivalent Mass',
        'site'),
    'boiler_outlet_temp': (
        'Boiler Outlet Temperature',
        'MAIN BOILER'),
    'supply_fan': (
        'Fan Electricity Energy',
        'US 1 SUPPLY FAN'),
    'heating_coil': (
        'Heating Coil Heating Energy',
        'US 1 HEATING COIL'),
    'terminal_temp': (
        'System Node Temperature',
        'SPACE1-1 Zone Equip Inlet'),
    'terminal_volume': (
        'System Node Current Density Volume Flow Rate',
        'SPACE1-1 Zone Equip Inlet'),
    'terminal_density': (
        'System Node Current Density',
        'SPACE1-1 Zone Equip Inlet'),
    'coil_inlet': (
        'System Node Temperature',
        'US 1 Supply Fan Outlet'),
    'coil_outlet': (
        'System Node Temperature',
        'US 1 Heating Coil Outlet')
}

DEFAULT_1ZONE_VARIABLES = {
    'outdoor_temperature': (
        'Site Outdoor Air DryBulb Temperature',
        'Environment'),
    'air_temperature': (
        'Zone Air Temperature',
        'ZONE ONE'),
    'diffuse_solar_radiation': (
        'Site Diffuse Solar Radiation Rate per Area',
        'Environment'),
    'direct_solar_radiation': (
        'Site Direct Solar Radiation Rate per Area',
        'Environment'),
    'boiler_outlet_temp': (
        'Boiler Outlet Temperature',
        'MAIN BOILER'),
    'coil_inlet': (
        'System Node Temperature',
        'US 1 Supply Fan Outlet'),
    'coil_outlet': (
        'System Node Temperature',
        'US 1 Heating Coil Outlet'),
    'coil_hw_inlet': (
        'System Node Temperature',
        'US 1 Heating Coil HW Inlet'),
    'coil_hw_outlet': (
        'System Node Temperature',
        'US 1 Heating Coil HW Outlet')
}

"""meter observation variables"""
DEFAULT_5ZONE_METERS = {'total_electricity_HVAC': 'Electricity:HVAC'}

"""action variables are configured with the action space and the action actuators"""

"""the action space configures the amount and range of the action variables"""
DEFAULT_5ZONE_ACTION_SPACE_CONTINUOUS = gym.spaces.Box(
    low=np.array([40.0], dtype=np.float32),
    high=np.array([80.0], dtype=np.float32),
    shape=(1,),
    dtype=np.float32
)

'''
DEFAULT_5ZONE_ACTION_SPACE_CONTINUOUS = gym.spaces.Box(
    low=np.array([10.0, 15.0], dtype=np.float32),
    high=np.array([90.0, 40.0], dtype=np.float32),
    shape=(2,),
    dtype=np.float32
)
'''

"""the mapping from the environment action to the simulator action is in this action actuator mapping"""
DEFAULT_5ZONE_ACTUATORS = {
    'Heating_Water_Setpoint': (
        'Schedule:Compact',
        'Schedule Value',
        'HotWater-SetP'),
    # 'Cooling_Water_Setpoint': (
    #    'Schedule:Compact',
    #    'Schedule Value',
    #    'CoolWater-SetP')
}
