-- drop old views
DROP MATERIALIZED VIEW public.measurements_1_year_europe_vienna;

DROP MATERIALIZED VIEW public.measurements_1_month_europe_vienna;

DROP MATERIALIZED VIEW public.measurements_1_week_europe_vienna;

DROP MATERIALIZED VIEW public.measurements_1_day_europe_vienna;

DROP MATERIALIZED VIEW public.measurements_1_hour_europe_vienna;

-- 1 hour
CREATE MATERIALIZED VIEW public.measurements_1_hour_europe_vienna WITH (timescaledb.continuous) AS
SELECT variable,
    TIME_BUCKET('1 hour', bucket, 'Europe/Vienna') AS bucket,
    AVERAGE(ROLLUP(stats)) AS avg,
    NUM_VALS(ROLLUP(stats)) AS count,
    MAX(max) AS max,
    MIN(min) AS min,
    MAX(max) - MIN(min) AS range,
    SUM(ROLLUP(stats)) AS sum,
    first(first, bucket) AS first,
    last(last, bucket) AS last,
    STDDEV (ROLLUP(stats)) AS stddev,
    VARIANCE(ROLLUP(stats)) AS var,
    AVERAGE(ROLLUP(stats)) AS avgtw,
    SUM(integral) AS integral,
    ROLLUP(stats) AS stats
FROM public.measurements_15_min
GROUP BY 1,
    2 WITH NO DATA;

-- 1 day
CREATE MATERIALIZED VIEW public.measurements_1_day_europe_vienna WITH (timescaledb.continuous) AS
SELECT variable,
    TIME_BUCKET('1 day', bucket, 'Europe/Vienna') AS bucket,
    AVERAGE(ROLLUP(stats)) AS avg,
    NUM_VALS(ROLLUP(stats)) AS count,
    MAX(max) AS max,
    MIN(min) AS min,
    MAX(max) - MIN(min) AS range,
    SUM(ROLLUP(stats)) AS sum,
    first(first, bucket) AS first,
    last(last, bucket) AS last,
    STDDEV (ROLLUP(stats)) AS stddev,
    VARIANCE(ROLLUP(stats)) AS var,
    AVERAGE(ROLLUP(stats)) AS avgtw,
    SUM(integral) AS integral,
    ROLLUP(stats) AS stats
FROM public.measurements_1_hour_europe_vienna
GROUP BY 1,
    2 WITH NO DATA;

-- 1 week
CREATE MATERIALIZED VIEW public.measurements_1_week_europe_vienna WITH (timescaledb.continuous) AS
SELECT variable,
    TIME_BUCKET('1 week', bucket, 'Europe/Vienna') AS bucket,
    AVERAGE(ROLLUP(stats)) AS avg,
    NUM_VALS(ROLLUP(stats)) AS count,
    MAX(max) AS max,
    MIN(min) AS min,
    MAX(max) - MIN(min) AS range,
    SUM(ROLLUP(stats)) AS sum,
    first(first, bucket) AS first,
    last(last, bucket) AS last,
    STDDEV (ROLLUP(stats)) AS stddev,
    VARIANCE(ROLLUP(stats)) AS var,
    AVG(avgtw) AS avgtw,
    SUM(integral) AS integral,
    ROLLUP(stats) AS stats
FROM public.measurements_1_day_europe_vienna
GROUP BY 1,
    2 WITH NO DATA;

-- 1 month
CREATE MATERIALIZED VIEW public.measurements_1_month_europe_vienna WITH (timescaledb.continuous) AS
SELECT variable,
    TIME_BUCKET('1 month', bucket, 'Europe/Vienna') AS bucket,
    AVERAGE(ROLLUP(stats)) AS avg,
    NUM_VALS(ROLLUP(stats)) AS count,
    MAX(max) AS max,
    MIN(min) AS min,
    MAX(max) - MIN(min) AS range,
    SUM(ROLLUP(stats)) AS sum,
    first(first, bucket) AS first,
    last(last, bucket) AS last,
    STDDEV (ROLLUP(stats)) AS stddev,
    VARIANCE(ROLLUP(stats)) AS var,
    AVG(avgtw) AS avgtw,
    SUM(integral) AS integral,
    ROLLUP(stats) AS stats
FROM public.measurements_1_day_europe_vienna
GROUP BY 1,
    2 WITH NO DATA;

-- 1 year
CREATE MATERIALIZED VIEW public.measurements_1_year_europe_vienna WITH (timescaledb.continuous) AS
SELECT variable,
    TIME_BUCKET('1 year', bucket, 'Europe/Vienna') AS bucket,
    AVERAGE(ROLLUP(stats)) AS avg,
    NUM_VALS(ROLLUP(stats)) AS count,
    MAX(max) AS max,
    MIN(min) AS min,
    MAX(max) - MIN(min) AS range,
    SUM(ROLLUP(stats)) AS sum,
    first(first, bucket) AS first,
    last(last, bucket) AS last,
    STDDEV (ROLLUP(stats)) AS stddev,
    VARIANCE(ROLLUP(stats)) AS var,
    AVG(avgtw) AS avgtw,
    SUM(integral) AS integral
FROM public.measurements_1_month_europe_vienna
GROUP BY 1,
    2 WITH NO DATA;

-- refresh 
SELECT add_continuous_aggregate_policy(
        'public.measurements_1_hour_europe_vienna',
        start_offset => INTERVAL '5 years',
        end_offset => INTERVAL '1 minute',
        schedule_interval => INTERVAL '1 minutes',
        initial_start => now()
    );

SELECT add_continuous_aggregate_policy(
        'public.measurements_1_day_europe_vienna',
        start_offset => INTERVAL '5 years',
        end_offset => INTERVAL '1 minute',
        schedule_interval => INTERVAL '1 minute',
        initial_start => now()
    );

SELECT add_continuous_aggregate_policy(
        'public.measurements_1_week_europe_vienna',
        start_offset => INTERVAL '5 years',
        end_offset => INTERVAL '1 minute',
        schedule_interval => INTERVAL '1 minute',
        initial_start => now()
    );

SELECT add_continuous_aggregate_policy(
        'public.measurements_1_month_europe_vienna',
        start_offset => INTERVAL '5 years',
        end_offset => INTERVAL '1 minutes',
        schedule_interval => INTERVAL '1 minute',
        initial_start => now()
    );

SELECT add_continuous_aggregate_policy(
        'public.measurements_1_year_europe_vienna',
        start_offset => INTERVAL '5 years',
        end_offset => INTERVAL '1 minutes',
        schedule_interval => INTERVAL '1 minute',
        initial_start => now()
    );

-- retention 
SELECT add_retention_policy(
        'public.measurements_1_hour_europe_vienna',
        INTERVAL '5 years'
    );

SELECT add_retention_policy(
        'public.measurements_1_day_europe_vienna',
        INTERVAL '5 years'
    );

SELECT add_retention_policy(
        'public.measurements_1_week_europe_vienna',
        INTERVAL '5 years'
    );

SELECT add_retention_policy(
        'public.measurements_1_month_europe_vienna',
        INTERVAL '5 years'
    );

SELECT add_retention_policy(
        'public.measurements_1_year_europe_vienna',
        INTERVAL '5 years'
    );