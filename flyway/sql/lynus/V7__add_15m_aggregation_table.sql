-- add 15 minutes continous measurement aggregates

CREATE MATERIALIZED VIEW IF NOT EXISTS measurements_15m_avg
WITH (timescaledb.continuous) AS
SELECT variable, 
	   time_bucket(INTERVAL '15 minutes', time) AS ts,
       AVG(value) AS value
FROM measurements
GROUP BY variable, ts
WITH NO DATA;

SELECT add_continuous_aggregate_policy('measurements_15m_avg', start_offset => NULL,
                                       end_offset => INTERVAL '6h', schedule_interval => INTERVAL '6h');