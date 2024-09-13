-- create the initial schema for the lynus database

-- https://blog.timescale.com/tutorials/how-to-explore-timescaledb-using-simulated-iot-sensor-data/
CREATE TABLE IF NOT EXISTS measurements
(
    time     TIMESTAMPTZ      NOT NULL DEFAULT now(), -- 8 bytes
    variable BIGINT           NOT NULL,               -- 4 bytes
    value    DOUBLE PRECISION NOT NULL,               -- 4 bytes
    unit     TEXT             NOT NULL DEFAULT ''
);


-- lookup table
CREATE TABLE IF NOT EXISTS measurements_meta
(
    id         SERIAL PRIMARY KEY,
    project    UUID        NOT NULL,
    variable   TEXT        NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project, variable)
);

-- created hypertable for measurements
-- https://docs.timescale.com/latest/using-timescaledb/data-retention#data-retention
SELECT *
FROM create_hypertable('measurements', 'time', chunk_time_interval => INTERVAL '6 hours', if_not_exists := true);

-- data compression that is older than 7 days
-- https://docs.timescale.com/latest/using-timescaledb/compression
ALTER TABLE measurements
    SET (timescaledb.compress,timescaledb.compress_segmentby = 'variable');
SELECT add_compression_policy('measurements', INTERVAL '7 days', if_not_exists := true);

-- continuous aggregates
-- https://docs.timescale.com/latest/using-timescaledb/continuous-aggregates

-- 1 week (1 data point per week)
CREATE MATERIALIZED VIEW IF NOT EXISTS measurements_1w
    WITH (timescaledb.continuous) AS
SELECT variable,
       time_bucket(INTERVAL '1 week', time) AS bucket,
       AVG(value)                           AS avg,
       COUNT(value)                         AS count,
       MAX(value)                           AS max,
       MIN(value)                           AS min,
       MAX(value) - MIN(value)              AS range,
       SUM(value)                           AS sum,
       FIRST(value, time)                   AS first,
       LAST(value, time)                    AS last,
       STDDEV_SAMP(value)                   AS stddev,
       VAR_SAMP(value)                      AS var
FROM measurements
GROUP BY variable, bucket
WITH NO DATA;

-- 1 day (1 data point per day)
CREATE MATERIALIZED VIEW IF NOT EXISTS measurements_1d
    WITH (timescaledb.continuous) AS
SELECT variable,
       time_bucket(INTERVAL '1 day', time) AS bucket,
       AVG(value)                          AS avg,
       COUNT(value)                        AS count,
       MAX(value)                          AS max,
       MIN(value)                          AS min,
       MAX(value) - MIN(value)             AS range,
       SUM(value)                          AS sum,
       FIRST(value, time)                  AS first,
       LAST(value, time)                   AS last,
       STDDEV_SAMP(value)                  AS stddev,
       VAR_SAMP(value)                     AS var
FROM measurements
GROUP BY variable, bucket
WITH NO DATA;

-- 6 hours (4 data points per day)
CREATE MATERIALIZED VIEW IF NOT EXISTS measurements_6h
    WITH (timescaledb.continuous) AS
SELECT variable,
       time_bucket(INTERVAL '6 hours', time) AS bucket,
       AVG(value)                            AS avg,
       COUNT(value)                          AS count,
       MAX(value)                            AS max,
       MIN(value)                            AS min,
       MAX(value) - MIN(value)               AS range,
       SUM(value)                            AS sum,
       FIRST(value, time)                    AS first,
       LAST(value, time)                     AS last,
       STDDEV_SAMP(value)                    AS stddev,
       VAR_SAMP(value)                       AS var
FROM measurements
GROUP BY variable, bucket
WITH NO DATA;

-- 1 hour (24 data points per day)
CREATE MATERIALIZED VIEW IF NOT EXISTS measurements_1h
    WITH (timescaledb.continuous) AS
SELECT variable,
       time_bucket(INTERVAL '1 hour', time) AS bucket,
       AVG(value)                           AS avg,
       COUNT(value)                         AS count,
       MAX(value)                           AS max,
       MIN(value)                           AS min,
       MAX(value) - MIN(value)              AS range,
       SUM(value)                           AS sum,
       FIRST(value, time)                   AS first,
       LAST(value, time)                    AS last,
       STDDEV_SAMP(value)                   AS stddev,
       VAR_SAMP(value)                      AS var
FROM measurements
GROUP BY variable, bucket
WITH NO DATA;

-- continuous aggregates
-- https://docs.timescale.com/latest/using-timescaledb/continuous-aggregates#detailed-look
SELECT add_continuous_aggregate_policy('measurements_1w', start_offset => NULL,
                                       end_offset => NULL, schedule_interval => INTERVAL '5 minutes');
SELECT add_continuous_aggregate_policy('measurements_1d', start_offset => NULL,
                                       end_offset => NULL, schedule_interval => INTERVAL '5 minutes');
SELECT add_continuous_aggregate_policy('measurements_6h', start_offset => NULL,
                                       end_offset => NULL, schedule_interval => INTERVAL '5 minutes');
SELECT add_continuous_aggregate_policy('measurements_1h', start_offset => NULL,
                                       end_offset => NULL, schedule_interval => INTERVAL '5 minutes');

-- asset is currently used for global assets (like project/room images)
-- TODO: this needs to be changed
CREATE TABLE IF NOT EXISTS asset
(
    id         UUID        NOT NULL PRIMARY KEY,
    user_id    uuid        NOT NULL,
    created_at timestamptz NOT NULL DEFAULT NOW()
);

-- table that stores superusers
CREATE TABLE IF NOT EXISTS superuser
(
    user_id    UUID        NOT NULL PRIMARY KEY,
    created_at timestamptz NOT NULL DEFAULT NOW()
);

-- project
CREATE TABLE IF NOT EXISTS project
(
    id                   UUID        NOT NULL PRIMARY KEY,
    realm                VARCHAR(50) NOT NULL,
    name                 VARCHAR(50) NOT NULL,
    meta                 JSONB       NOT NULL,
    secret               UUID        NOT NULL,
    owner_id             UUID        NOT NULL,
    limit_collections    SMALLINT    NOT NULL DEFAULT 10,
    limit_devices        SMALLINT    NOT NULL DEFAULT 50,
    limit_members        SMALLINT    NOT NULL DEFAULT 10,
    connectivity         BOOLEAN     NOT NULL DEFAULT FALSE,
    connectivity_actions JSONB       NOT NULL DEFAULT '[]',
    import_config        JSONB       NOT NULL DEFAULT '{}',
    created_at           TIMESTAMPTZ NOT NULL,
    deleted_at           TIMESTAMPTZ
);

-- collection
CREATE TABLE IF NOT EXISTS project_collection
(
    id         UUID        NOT NULL PRIMARY KEY,
    name       VARCHAR(50) NOT NULL,
    meta       JSONB       NOT NULL,
    project_id UUID        NOT NULL REFERENCES project ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL
);

-- device
CREATE TABLE IF NOT EXISTS project_device
(
    id            UUID        NOT NULL PRIMARY KEY,
    name          VARCHAR(50) NOT NULL,
    data          JSONB       NOT NULL,
    collection_id UUID        NOT NULL REFERENCES project_collection ON DELETE CASCADE,
    project_id    UUID        NOT NULL REFERENCES project ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL
);

-- document (previously asset)
CREATE TABLE IF NOT EXISTS project_document
(
    id           UUID         NOT NULL,
    project_id   UUID         NOT NULL REFERENCES project ON DELETE CASCADE,
    name         varchar(100) NOT NULL,
    content_type varchar(20)  NOT NULL,
    size         INTEGER      NOT NULL,
    created_at   TIMESTAMPTZ  NOT NULL,
    PRIMARY KEY (id)
);

-- member
CREATE TABLE IF NOT EXISTS project_user
(
    user_id    UUID    NOT NULL,
    project_id UUID    NOT NULL REFERENCES project ON DELETE CASCADE,
    is_admin   BOOLEAN NOT NULL,
    PRIMARY KEY (user_id, project_id)
);

-- device
CREATE TABLE IF NOT EXISTS project_favorite
(
    project_id UUID NOT NULL REFERENCES project ON DELETE CASCADE,
    user_id    UUID NOT NULL,
    device_id  UUID NOT NULL REFERENCES project_device ON DELETE CASCADE,
    PRIMARY KEY (user_id, device_id)
);

-- rule
CREATE TABLE IF NOT EXISTS project_rule
(
    id         UUID        NOT NULL PRIMARY KEY,
    project_id UUID        NOT NULL REFERENCES project (id),
    name       VARCHAR(50) NOT NULL,
    active     BOOLEAN     NOT NULL,
    timeout    INTEGER     NOT NULL,
    conditions JSONB       NOT NULL,
    actions    JSONB       NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- alert
CREATE TABLE IF NOT EXISTS project_alert
(
    id          UUID        NOT NULL PRIMARY KEY,
    project_id  UUID        NOT NULL REFERENCES project (id),
    body        TEXT        NOT NULL,
    type        SMALLINT    NOT NULL,
    accepted_by UUID,
    accepted_at TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_report
(
    id              UUID        NOT NULL PRIMARY KEY,
    project_id      UUID        NOT NULL REFERENCES project (id),
    name            VARCHAR(50) NOT NULL,
    type            VARCHAR(50) NOT NULL,
    timezone        VARCHAR(50) NOT NULL,
    address_street  VARCHAR(50) NOT NULL,
    address_city    VARCHAR(50) NOT NULL,
    address_country VARCHAR(50) NOT NULL,
    currency        VARCHAR(3)  NOT NULL,
    variables       JSONB       NOT NULL,
    active          BOOL        NOT NULL DEFAULT TRUE,
    actions         JSONB       NOT NULL DEFAULT '[]',
    meta            JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoice
(
    id          UUID        NOT NULL PRIMARY KEY,
    user_id     UUID        NOT NULL,
    name        TEXT        NOT NULL,
    description TEXT        NOT NULL,
    notes       TEXT        NOT NULL, -- information for admins (like stripe payment id, bank information, whatever)
    amount      MONEY       NOT NULL,
    paid_at     TIMESTAMPTZ,
    due_at      TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- MATERIALIZED VIEWS FOR FASTER QUERYING
-- PROJECT STATS
CREATE MATERIALIZED VIEW IF NOT EXISTS project_alert_stats AS
SELECT project_id,
       COUNT(case WHEN type = 0 then TRUE end) ok,
       COUNT(case WHEN type = 1 then TRUE end) warning,
       COUNT(case WHEN type = 2 then TRUE end) error
FROM project_alert
WHERE accepted_at IS NULL
GROUP BY project_id
WITH NO DATA;

CREATE OR REPLACE FUNCTION refresh_project_alert_stats()
    RETURNS TRIGGER
    LANGUAGE plpgsql
AS
$$
BEGIN
    REFRESH MATERIALIZED VIEW project_alert_stats;
    RETURN NULL;
END
$$;

CREATE
OR
REPLACE
TRIGGER refresh_project_alert_stats
    AFTER
INSERT OR
UPDATE OR
    DELETE OR TRUNCATE
ON project_alert
    FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_project_alert_stats();