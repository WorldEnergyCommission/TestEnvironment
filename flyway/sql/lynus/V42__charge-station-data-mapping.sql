--------------- Charge Station -------------
INSERT INTO data_mapping_types("id", "name", description)
values (
    '7436a8f1-88e1-49ec-8bb3-f019faa689dc',
    'Charging Station',
    'Charging Station mapping for curent used power and if station is in use'
  );

INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group")
values (
    'power',
    '7436a8f1-88e1-49ec-8bb3-f019faa689dc',
    false,
    'kW',
    'View'
  );

INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group")
values (
    'cs_state',
    '7436a8f1-88e1-49ec-8bb3-f019faa689dc',
    false,
    'boolean',
    'View'
  );

-- --  create CAggs for this -- not working, caggs don't support window functino
-- --   SELECT sum(charge_cycle), variable, time_bucket('1 day', time) AS bucket
-- --  FROM (
-- -- SELECT
-- --   time,
-- --   GREATEST ((value - lag(value) OVER w),0.0) AS "charge_cycle",
-- --   variable
-- --   FROM measurements
-- --   WHERE time > NOW() - INTERVAL '14 day' AND variable = 897
-- --   WINDOW w AS (ORDER BY time)) AS internal
-- --   GROUP BY variable, bucket 
-- --     ORDER BY time
-- CREATE MATERIALIZED VIEW public.on_off_cycles_1_day_europe_vienna WITH (timescaledb.continuous) AS
-- SELECT time_bucket('1 day', time, 'Europe/Vienna') AS bucket,
--   variable,
--   SUM(cylce) AS cycles
-- FROM (
--     SELECT time,
--       GREATEST((value - lag(value) OVER w), 0.0) AS cylce,
--       variable
--     FROM measurements WINDOW w AS (
--         ORDER BY time
--       )
--   ) AS internal
-- GROUP BY variable,
--   bucket WITH NO DATA;
-- SELECT add_continuous_aggregate_policy(
--     'public.on_off_cycles_1_day_europe_vienna',
--     start_offset => INTERVAL '5 years',
--     end_offset => INTERVAL '1 minute',
--     schedule_interval => INTERVAL '1 minute',
--     initial_start => now()
--   );