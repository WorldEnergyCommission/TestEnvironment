DROP FUNCTION IF EXISTS get_charge_station_report;

CREATE OR REPLACE FUNCTION get_charge_station_report(
        from_time TIMESTAMPTZ,
        to_time TIMESTAMPTZ,
        connected_var int,
        power_var int
    ) RETURNS TABLE(
        session_id INT,
        session_start TIMESTAMPTZ,
        session_end TIMESTAMPTZ,
        total_power_usage double precision
    ) AS $$ BEGIN RETURN QUERY WITH ranked_measurements AS (
        SELECT time,
            variable,
            value AS session_status,
            LAG(value) OVER (
                PARTITION BY variable
                ORDER BY time
            ) AS prev_value,
            LEAD(value) OVER (
                PARTITION BY variable
                ORDER BY time
            ) AS next_value
        FROM measurements
        WHERE variable = connected_var
            AND time >= from_time
            AND time <= to_time
    ),
    session_ids AS (
        SELECT time AS session_start,
            LEAD(time) OVER (
                ORDER BY time
            ) AS next_session_start,
            ROW_NUMBER() OVER (
                ORDER BY time
            ) AS session_id
        FROM ranked_measurements
        WHERE session_status = 1
            AND prev_value = 0
    ),
    session_ends AS (
        SELECT time AS session_end
        FROM ranked_measurements
        WHERE session_status = 1
            AND next_value = 0
    ),
    power_usage AS (
        SELECT m.time,
            m.value AS power,
            s.session_id,
            s.session_start,
            se.session_end
        FROM measurements m
            JOIN session_ids s ON m.time >= s.session_start
            AND m.time < s.next_session_start
            JOIN session_ends se ON m.time <= se.session_end
            AND se.session_end < s.next_session_start
        WHERE m.variable = power_var
            AND m.value != 0
            AND m.time >= from_time
            AND m.time <= to_time
    )
SELECT CAST(s.session_id AS INTEGER),
    -- Casting session_id to INTEGER
    MIN(p.time) AS session_start,
    MIN(se.session_end) AS session_end,
    INTEGRAL(TIME_WEIGHT('LOCF', p.time, p.power), 'hour') AS total_power_usage
FROM power_usage p
    JOIN session_ids s ON p.session_id = s.session_id
    JOIN session_ends se ON p.session_end = se.session_end
GROUP BY s.session_id
ORDER BY s.session_id DESC;

END;

$$ LANGUAGE plpgsql;