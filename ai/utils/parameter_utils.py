SETPOINT_OPTIMIZER_INITIAL_PARAMETERS: dict[str, dict[str, float]] = {
    "heating_water": {
        "c1": 0.7,
        "c2": 5,
        "c3": 1.5
    },
    "heating_air": {
        "c1": 0.8,
        "c2": 0,
        "c3": 1.3,
    },
    "cooling_water": {
        "c1": 1.0,
        "c2": 1,
        "c3": 1.7,
    },
    "cooling_air": {
        "c1": 1.3,
        "c2": 1,
        "c3": 1.8
    },
    "hybrid_water": {
        "c1": 2.0,
        "c2": 5,
        "c3": 1.35,
        "hybrid_c1": 1.0,
        "hybrid_c2": 1,
        "hybrid_c3": 1.7
    },
    "hybrid_air": {
        "c1": 0.5,
        "c2": 0,
        "c3": 1.3,
        "hybrid_c1": 1.3,
        "hybrid_c2": 1,
        "hybrid_c3": 1.8
    }
}

SETPOINT_OPTIMIZER_CONSTRAINTS: dict[str, dict[str, float | dict[str, float]]] = {
    "heating_water": {
        "c1_min": 0.5, "c1_max": 0.9,
        "c2_min": 3, "c2_max": 7,
        "c3_min": 1.4, "c3_max": 1.6
    },
    "heating_air": {
        "c1_min": 0.5, "c1_max": 1.2,
        "c2_min": -1, "c2_max": 3,
        "c3_min": 1.3, "c3_max": 1.5
    },
    "cooling_water": {
        "c1_min": 1.0, "c1_max": 1.4,
        "c2_min": 1, "c2_max": 2,
        "c3_min": 1.7, "c3_max": 2
    },
    "cooling_air": {
        "c1_min": 1.0, "c1_max": 2.0,
        "c2_min": 1, "c2_max": 2,
        "c3_min": 1.3, "c3_max": 1.8
    },
    "hybrid_water": {
        "heating": {
            "c1_min": 0.5, "c1_max": 2.0,
            "c2_min": 0, "c2_max": 10,
            "c3_min": 1.0, "c3_max": 1.35
        },
        "cooling": {
            "c1_min": 1.0, "c1_max": 1.4,
            "c2_min": 1, "c2_max": 2,
            "c3_min": 1.7, "c3_max": 2
        }
    },
    "hybrid_air": {
        "heating": {
            "c1_min": 0.4, "c1_max": 1.0,
            "c2_min": -1, "c2_max": 0,
            "c3_min": 1.3, "c3_max": 1.4
        },
        "cooling": {
            "c1_min": 1.0, "c1_max": 2.0,
            "c2_min": 1, "c2_max": 2,
            "c3_min": 1.3, "c3_max": 1.8
        }
    }
}
