-- create the initial schema for the shelly measurements

CREATE TABLE IF NOT EXISTS shelly_measurements
(
    id           TEXT             NOT NULL,
    name         TEXT             NOT NULL,
    generation   INTEGER          NOT NULL,
    username     TEXT             NOT NULL,
    category     TEXT             NOT NULL,
    manufacturer TEXT             NOT NULL,
    model        TEXT             NOT NULL,
    phase        INTEGER          NOT NULL,
    property     TEXT             NOT NULL,
    value        DOUBLE PRECISION NOT NULL,
    unit         TEXT             NOT NULL,
    timestamp    TIMESTAMPTZ      NOT NULL
);

SELECT *
FROM create_hypertable('shelly_measurements', 'timestamp', chunk_time_interval => INTERVAL '6 hours',
                       if_not_exists := true);

ALTER TABLE shelly_measurements
    SET (timescaledb.compress,timescaledb.compress_segmentby = 'id');
SELECT add_compression_policy('shelly_measurements', INTERVAL '1 day', if_not_exists := true);
