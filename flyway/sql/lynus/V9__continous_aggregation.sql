-- continuous aggregates
-- https://docs.timescale.com/latest/using-timescaledb/continuous-aggregates

-- 15 minutes
CREATE MATERIALIZED VIEW public.measurements_15_min
WITH (timescaledb.continuous) AS
SELECT
    variable,
    TIME_BUCKET('15 minutes', time, 'Etc/UTC')          AS bucket,
    AVG(value)                                          AS avg,
    COUNT(value)                                        AS count,
    MAX(value)                                          AS max,
    MIN(value)                                          AS min,
    MAX(value) - MIN(value)                             AS range,
    SUM(value)                                          AS sum,
    FIRST(value, time)                                  AS first,
    LAST(value, time)                                   AS last,
    STDDEV_SAMP(value)                                  AS stddev,
    VAR_SAMP(value)                                     AS var,
    AVERAGE(TIME_WEIGHT('LOCF', time, value))           AS avgtw,
    INTEGRAL(TIME_WEIGHT('LOCF', time, value), 'hour')  AS integral,
    STATS_AGG(value)                                    AS stats,
    TIME_WEIGHT('LOCF', time, value)                    AS tw
FROM measurements
GROUP BY variable, bucket
WITH NO DATA;