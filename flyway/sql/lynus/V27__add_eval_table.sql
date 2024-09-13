-- creates a table to store evaluation metrices

-- https://blog.timescale.com/tutorials/how-to-explore-timescaledb-using-simulated-iot-sensor-data/
CREATE TABLE IF NOT EXISTS evaluations
(
    time     TIMESTAMPTZ      NOT NULL DEFAULT now(), -- 8 bytes
    variable TEXT             NOT NULL,               -- 4 bytes
    value    DOUBLE PRECISION NOT NULL,               -- 4 bytes
    model    UUID             NOT NULL,
    metric   TEXT             NOT NULL
);

-- creates hypertable for measurements
-- https://docs.timescale.com/latest/using-timescaledb/data-retention#data-retention
SELECT *
FROM create_hypertable('evaluations', 'time', chunk_time_interval => INTERVAL '6 hours', if_not_exists := true);

-- data compression that is older than 7 days
-- https://docs.timescale.com/latest/using-timescaledb/compression
ALTER TABLE evaluations
    SET (timescaledb.compress,timescaledb.compress_segmentby = 'variable');
SELECT add_compression_policy('evaluations', INTERVAL '7 days', if_not_exists := true);