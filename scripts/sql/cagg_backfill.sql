-- found in timescale slack
-- https://timescaledb.slack.com/archives/C4GT3N90X/p1709254368192069?thread_ts=1709246961.386429&cid=C4GT3N90X
CREATE TABLE IF NOT EXISTS cagg_backfill_progress (
    id SERIAL PRIMARY KEY,
    resolution INTERVAL NOT NULL,
    from_ts TIMESTAMPTZ NOT NULL,
    to_ts TIMESTAMPTZ NOT NULL,
    refresh_start TIMESTAMPTZ NOT NULL,
    refresh_end TIMESTAMPTZ NOT NULL
);

CREATE UNIQUE INDEX cagg_backfill_progress_resolution_idx ON cagg_backfill_progress (resolution, id DESC);

CREATE TABLE IF NOT EXISTS cagg_backfill_exit (
    resolution INTERVAL PRIMARY KEY,
    exit BOOL NOT NULL DEFAULT FALSE
);

CREATE OR REPLACE PROCEDURE backfill_continuous_aggregate(
        _cagg REGCLASS,
        _resolution INTERVAL,
        _step_size INTERVAL
    ) AS $$
DECLARE _from_ts TIMESTAMPTZ;

_to_ts TIMESTAMPTZ;

_refresh_start TIMESTAMPTZ;

_refresh_end TIMESTAMPTZ;

_should_exit BOOL;

BEGIN -- check that _step_size is a multiple of _resolution
IF EXTRACT(
    EPOCH
    FROM _step_size
)::INT % EXTRACT(
    EPOCH
    FROM _resolution
)::INT <> 0 THEN RAISE EXCEPTION 'Step size must be a multiple of resolution.';

END IF;

INSERT INTO cagg_backfill_exit (resolution, exit)
VALUES (_resolution, FALSE) ON CONFLICT (resolution) DO NOTHING;

SELECT to_ts INTO _from_ts
FROM cagg_backfill_progress
WHERE resolution = _resolution
ORDER BY id DESC
LIMIT 1;

IF _from_ts IS NULL THEN
SELECT '2022-01-01 00:00:00'::TIMESTAMPTZ INTO _from_ts;

END IF;

_to_ts = _from_ts + _step_size;

WHILE _to_ts < CLOCK_TIMESTAMP() LOOP
SELECT exit INTO _should_exit
FROM cagg_backfill_exit
WHERE resolution = _resolution;

IF _should_exit THEN RAISE NOTICE 'Exiting refresh procedure for % resolution due to exit flag in tmp_customer_interface_metrics_cag_backfill_exit table.',
_resolution;

RETURN;

END IF;

_refresh_start = CLOCK_TIMESTAMP();

CALL refresh_continuous_aggregate(_cagg, _from_ts, _to_ts);

_refresh_end = CLOCK_TIMESTAMP();

INSERT INTO cagg_backfill_progress (
        resolution,
        from_ts,
        to_ts,
        refresh_start,
        refresh_end
    )
SELECT _resolution,
    _from_ts,
    _to_ts,
    _refresh_start,
    _refresh_end;

_from_ts = _to_ts;

_to_ts = _from_ts + _step_size;

COMMIT;

END LOOP;

END;

$$ LANGUAGE plpgsql;

CREATE OR REPLACE PROCEDURE compress_uncompressed_chunks(
        _hypertable_schema TEXT,
        _hypertable_name TEXT
    ) LANGUAGE plpgsql AS $$
DECLARE t REGCLASS;

i REGCLASS;

BEGIN
SELECT FORMAT(
        '%s.%s',
        materialization_hypertable_schema,
        materialization_hypertable_name
    )::REGCLASS INTO t
FROM timescaledb_information.continuous_aggregates
WHERE view_schema = _hypertable_schema
    AND view_name = _hypertable_name;

FOR i IN (
    WITH numbered_rows AS (
        SELECT FORMAT('%s.%s', chunk_schema, chunk_name)::REGCLASS AS chunk_name,
            ROW_NUMBER() OVER (
                ORDER BY chunk_name
            ) AS rn
        FROM chunk_compression_stats(t)
        WHERE compression_status = 'Uncompressed'
    )
    SELECT chunk_name
    FROM numbered_rows
    WHERE rn < (
            SELECT MAX(rn)
            FROM numbered_rows
        )
) LOOP PERFORM compress_chunk(i);

COMMIT;

END LOOP;

END $$;