-- new aggregation tables are not needed, so just delete the old ones

SELECT remove_continuous_aggregate_policy('measurements_1h', true);
SELECT remove_continuous_aggregate_policy('measurements_6h', true);
SELECT remove_continuous_aggregate_policy('measurements_1d', true);
SELECT remove_continuous_aggregate_policy('measurements_1w', true);

DROP MATERIALIZED VIEW IF EXISTS measurements_1h;
DROP MATERIALIZED VIEW IF EXISTS measurements_6h;
DROP MATERIALIZED VIEW IF EXISTS measurements_1d;
DROP MATERIALIZED VIEW IF EXISTS measurements_1w;
