do $$
DECLARE
	compressed bool;
BEGIN
	SELECT compression_enabled
	INTO compressed
	FROM timescaledb_information.continuous_aggregates 
    WHERE view_name = 'measurements_15_min';

	IF NOT compressed THEN
	ALTER MATERIALIZED VIEW measurements_15_min SET (timescaledb.compress = true);
	END IF;
END $$
;

SELECT add_compression_policy('measurements_15_min', compress_after=>'45 days'::interval);