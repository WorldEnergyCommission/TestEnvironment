--- bug in timescaledb-toolkit
--
--    Caused by: org.postgresql.util.PSQLException: ERROR: called `Result::unwrap()` on an `Err` value: OrderError
--    Wobei: SQL statement "INSERT INTO _timescaledb_internal._materialized_hypertable_143 
--     SELECT * FROM _timescaledb_internal._partial_view_143 AS I WHERE I.bucket >= '-infinity' AND I.bucket < '2023-04-07 15:00:00+02' ;"

-- appears to happen because of rollup(timeweight) --> view could use roll up functions for average timeweight and intergral
-- "avg(avgtw) AS avgtw", --> set to "AVERAGE(rollup(tw)) AS avgtw," if bug is fixed
-- "avg(integral) * count(*) AS integral," --> set to "INTEGRAL(rollup(tw)) AS integral," workaround uses avg*count to combat null values (instead of sum)
-- also include "rollup(tw)    as tw" for other hierarchical caggs

-- 1 hour
CREATE MATERIALIZED VIEW public.measurements_1_hour_europe_vienna
WITH (timescaledb.continuous) AS
SELECT
    variable,
    TIME_BUCKET('1 hour', bucket, 'Europe/Vienna')      AS bucket,
    AVERAGE(ROLLUP(stats))                              AS avg,
    NUM_VALS(ROLLUP(stats))                             AS count,
    MAX(max)                                            AS max,
    MIN(min)                                            AS min,
    MAX(max) - MIN(min)                                 AS range,
    SUM(ROLLUP(stats))                                  AS sum,
    first(first, bucket)                                AS first,
    last(last, bucket)                                  AS last,
    STDDEV (ROLLUP(stats))                              AS stddev,
    VARIANCE(ROLLUP(stats))                             AS var,
    AVG(avgtw)                                          AS avgtw, 
    AVG(integral) * COUNT(*)                            AS integral,
    ROLLUP(stats)                                       AS stats
FROM public.measurements_15_min
GROUP BY 1, 2
WITH NO DATA;

-- 1 day
CREATE MATERIALIZED VIEW public.measurements_1_day_europe_vienna
WITH (timescaledb.continuous) AS
SELECT
    variable,
    TIME_BUCKET('1 day', bucket, 'Europe/Vienna')       AS bucket,
    AVERAGE(ROLLUP(stats))                              AS avg,
    NUM_VALS(ROLLUP(stats))                             AS count,
    MAX(max)                                            AS max,
    MIN(min)                                            AS min,
    MAX(max) - MIN(min)                                 AS range,
    SUM(ROLLUP(stats))                                  AS sum,
    first(first, bucket)                                AS first,
    last(last, bucket)                                  AS last,
    STDDEV (ROLLUP(stats))                              AS stddev,
    VARIANCE(ROLLUP(stats))                             AS var,
    AVG(avgtw)                                          AS avgtw, 
    AVG(integral) * COUNT(*)                            AS integral,
    ROLLUP(stats)                                       AS stats
FROM public.measurements_1_hour_europe_vienna
GROUP BY 1, 2
WITH NO DATA;

-- 1 week
CREATE MATERIALIZED VIEW public.measurements_1_week_europe_vienna
WITH (timescaledb.continuous) AS
SELECT
    variable,
    TIME_BUCKET('1 week', bucket, 'Europe/Vienna')      AS bucket,
    AVERAGE(ROLLUP(stats))                              AS avg,
    NUM_VALS(ROLLUP(stats))                             AS count,
    MAX(max)                                            AS max,
    MIN(min)                                            AS min,
    MAX(max) - MIN(min)                                 AS range,
    SUM(ROLLUP(stats))                                  AS sum,
    first(first, bucket)                                AS first,
    last(last, bucket)                                  AS last,
    STDDEV (ROLLUP(stats))                              AS stddev,
    VARIANCE(ROLLUP(stats))                             AS var,
    AVG(avgtw)                                          AS avgtw, 
    AVG(integral) * COUNT(*)                            AS integral,
    ROLLUP(stats)                                       AS stats
FROM public.measurements_1_day_europe_vienna
GROUP BY 1, 2
WITH NO DATA;

-- 1 month
CREATE MATERIALIZED VIEW public.measurements_1_month_europe_vienna
WITH (timescaledb.continuous) AS
SELECT
    variable,
    TIME_BUCKET('1 month', bucket, 'Europe/Vienna')     AS bucket,
    AVERAGE(ROLLUP(stats))                              AS avg,
    NUM_VALS(ROLLUP(stats))                             AS count,
    MAX(max)                                            AS max,
    MIN(min)                                            AS min,
    MAX(max) - MIN(min)                                 AS range,
    SUM(ROLLUP(stats))                                  AS sum,
    first(first, bucket)                                AS first,
    last(last, bucket)                                  AS last,
    STDDEV (ROLLUP(stats))                              AS stddev,
    VARIANCE(ROLLUP(stats))                             AS var,
    AVG(avgtw)                                          AS avgtw, 
    AVG(integral) * COUNT(*)                            AS integral,
    ROLLUP(stats)                                       AS stats
FROM public.measurements_1_day_europe_vienna
GROUP BY 1, 2
WITH NO DATA;

-- 1 year
CREATE MATERIALIZED VIEW public.measurements_1_year_europe_vienna
WITH (timescaledb.continuous) AS
SELECT
    variable,
    TIME_BUCKET('1 year', bucket, 'Europe/Vienna')      AS bucket,
    AVERAGE(ROLLUP(stats))                              AS avg,
    NUM_VALS(ROLLUP(stats))                             AS count,
    MAX(max)                                            AS max,
    MIN(min)                                            AS min,
    MAX(max) - MIN(min)                                 AS range,
    SUM(ROLLUP(stats))                                  AS sum,
    first(first, bucket)                                AS first,
    last(last, bucket)                                  AS last,
    STDDEV (ROLLUP(stats))                              AS stddev,
    VARIANCE(ROLLUP(stats))                             AS var,
    AVG(avgtw)                                          AS avgtw, 
    AVG(integral) * COUNT(*)                            AS integral,
    ROLLUP(stats)                                       AS stats
FROM public.measurements_1_month_europe_vienna
GROUP BY 1, 2
WITH NO DATA;

-- bug in timescale below 2.11
-- SELECT would takes long because of huge planning time
-- https://github.com/timescale/timescaledb/pull/5261
-- tmp fix as in https://github.com/timescale/timescaledb/issues/4699
--- all views only contain data older than 15min 
-- TODO: disable materialized only when updating timescale, also maybe change refresh policies
ALTER MATERIALIZED VIEW public.measurements_15_min SET (timescaledb.materialized_only = true);
ALTER MATERIALIZED VIEW public.measurements_1_hour_europe_vienna SET (timescaledb.materialized_only = true);
ALTER MATERIALIZED VIEW public.measurements_1_day_europe_vienna SET (timescaledb.materialized_only = true);
ALTER MATERIALIZED VIEW public.measurements_1_week_europe_vienna SET (timescaledb.materialized_only = true);
ALTER MATERIALIZED VIEW public.measurements_1_month_europe_vienna SET (timescaledb.materialized_only = true);
ALTER MATERIALIZED VIEW public.measurements_1_year_europe_vienna SET (timescaledb.materialized_only = true);

-- refresh policies
SELECT add_continuous_aggregate_policy('public.measurements_15_min', 
                                        start_offset =>  INTERVAL '1 month',
                                        end_offset => INTERVAL '1 minute', 
                                        schedule_interval => INTERVAL '1 minute',
                                        initial_start=> now());
SELECT add_continuous_aggregate_policy('public.measurements_1_hour_europe_vienna', 
                                        start_offset => INTERVAL '5 years',
                                        end_offset => INTERVAL '1 minute', 
                                        schedule_interval => INTERVAL '1 minutes',
                                        initial_start=> now());
SELECT add_continuous_aggregate_policy('public.measurements_1_day_europe_vienna', 
                                        start_offset => INTERVAL '5 years',
                                        end_offset => INTERVAL '1 minute', 
                                        schedule_interval => INTERVAL '1 minute',
                                        initial_start=> now());
SELECT add_continuous_aggregate_policy('public.measurements_1_week_europe_vienna', 
                                        start_offset => INTERVAL '5 years',
                                        end_offset => INTERVAL '1 minute', 
                                        schedule_interval => INTERVAL '1 minute',
                                        initial_start=> now());
SELECT add_continuous_aggregate_policy('public.measurements_1_month_europe_vienna', 
                                        start_offset => INTERVAL '5 years',
                                        end_offset => INTERVAL '1 minutes', 
                                        schedule_interval => INTERVAL '1 minute',
                                        initial_start=> now());
SELECT add_continuous_aggregate_policy('public.measurements_1_year_europe_vienna', 
                                        start_offset => INTERVAL '5 years',
                                        end_offset => INTERVAL '1 minutes', 
                                        schedule_interval => INTERVAL '1 minute',
                                        initial_start=> now());

-- retention 5 years for everything smaller than 1 month
SELECT add_retention_policy('public.measurements_15_min', INTERVAL '5 years');
SELECT add_retention_policy('public.measurements_1_hour_europe_vienna', INTERVAL '5 years');
SELECT add_retention_policy('public.measurements_1_day_europe_vienna', INTERVAL '5 years');
SELECT add_retention_policy('public.measurements_1_week_europe_vienna', INTERVAL '5 years');
SELECT add_retention_policy('public.measurements_1_month_europe_vienna', INTERVAL '5 years');
SELECT add_retention_policy('public.measurements_1_year_europe_vienna', INTERVAL '5 years');