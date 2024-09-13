
/**
 * Represents the data structure for user data.
 * It contains all the information needed to display to layout the interface. 
 * The string arrays prefixed with 'pv_' and 'cs_' are measurement names.
 */
export interface UserData {
  name: string;
  keycloak_url: string;
  realm: string;
  effioapi_url: string;
  project_id: string;
  timezone: string;
  colors: Colors;
  font: string;
  slides: Slide[];
  pv_power?: string[];
  pv_aggregated_carbon_savings_ratio?: number;
  pv_aggregated_carbon_savings_symbolic_ratio?: number;
  pv_aggregated_produced_energy_prediction_next_day?: string[];
  cs_aggregated_current_connected_cars?: string[];
  cs_aggregated_charged_energy?: string[];
  cs_aggregated_charged_energy_ratio?: number;
  ws_average_room_humidity?: string[];
  ws_average_room_temperature?: string[];
  should_sum_up_all_projects?: boolean; // request for getting all the projects and all the variables for each project is called only if this value is set to true in the config files
}

/**
 * Represents the colors used in the user interface.
 */
export interface Colors {
    primary: string;
    secondary: string;
    sub_title: string;
    default: string;
}

/**
 * Represents a slide in the user interface.
 */
export interface Slide {
    backgrounds: SlideBackground[];
    modules: SlideElement[];
}

/**
 * Represents the background of a slide.
 */
export interface SlideBackground {
    file?: string;
    size: Size;
    position: Size;
}

/**
 * Represents an element in a slide.
 */
export interface SlideElement {
    id: string;
    size: Size;
    position: Size;
    ads?: Ads;
    text_field?: string;
    icon?: string;
    title?: string;
    subtitle?: string;
    variable?: string;
    unit?: string;
}

/**
 * Represents the size of an element or background.
 */
export interface Size {
    col: number;
    row: number;
}

/**
 * Represents an advertisement.
 */
export interface Ads {
    background?: string;
    url?: string;
}
