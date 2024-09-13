-- Measruemtns size
WITH tsize AS (
    SELECT hypertable_size('measurements') AS total_size
),
csize AS (
    SELECT COALESCE(after_compression_total_bytes, 0::bigint) AS compressed_size
    FROM hypertable_compression_stats('measurements')
)
SELECT pg_size_pretty(total_size) AS total_size,
    pg_size_pretty(total_size - compressed_size) AS uncompressed_size,
    pg_size_pretty(compressed_size) AS compressed_size
FROM tsize,
    csize;
;
-- CAggs Size
SELECT view_name,
    pg_size_pretty(
        hypertable_size(
            format(
                '%I.%I',
                materialization_hypertable_schema,
                materialization_hypertable_name
            )::regclass
        )
    )
FROM timescaledb_information.continuous_aggregates;
-- 15min CAGG is _materialized_hypertable_69 on EIO
WITH tsize AS (
    SELECT hypertable_size(
            '_timescaledb_internal._materialized_hypertable_69'
        ) AS total_size
),
csize AS (
    SELECT COALESCE(after_compression_total_bytes, 0::bigint) AS compressed_size
    FROM hypertable_compression_stats(
            '_timescaledb_internal._materialized_hypertable_69'
        )
)
SELECT pg_size_pretty(total_size) AS total_size,
    pg_size_pretty(total_size - compressed_size) AS uncompressed_size,
    pg_size_pretty(compressed_size) AS compressed_size
FROM tsize,
    csize;
;
-- Measurements per month; 536.534.778 in feb 2024 on EIO
SELECT count(1),
    TIME_BUCKET('1 month', time, 'Etc/UTC') AS bucket
FROM measurements
WHERE time > now() - INTERVAL '33 days'
    AND time < now() - INTERVAL '15 minutes'
GROUP BY bucket;
-- determine blocking queires
select pid,
    usename,
    pg_blocking_pids(pid) as blocked_by,
    query as blocked_query
from pg_stat_activity
where cardinality(pg_blocking_pids(pid)) > 0;