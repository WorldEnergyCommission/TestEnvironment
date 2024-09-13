-- drop old stuff
DROP TRIGGER refresh_project_device_measurement_mapping_devices ON project_device;

DROP TRIGGER refresh_project_device_measurement_mapping_models ON models;

DROP FUNCTION refresh_project_device_measurement_mapping;

DROP VIEW public.measurements_mapping;

DROP MATERIALIZED VIEW public.project_device_measurement_mapping;

CREATE MATERIALIZED VIEW public.project_device_measurement_mapping AS
SELECT id AS device_id,
	measurement
FROM project_device,
	lateral (
		SELECT fin.value AS measurement
		FROM jsonb_array_elements(data->'chartOptions') AS nested_data,
			jsonb_each_text(nested_data) AS fin
		WHERE data->>'type' = 'chart'
			AND fin.key = 'var'
		union
		SELECT value AS measurement
		FROM jsonb_each_text(data->'mappings')
		WHERE data->>'type' != 'chart'
	) val
WHERE measurement != ''
UNION
SELECT distinct device_id,
	measurement
FROM (
		SELECT id AS device_id,
			unnest(
				string_to_array(
					REGEXP_REPLACE(
						data->'chartOptions'->0->'calculation'->>'expression',
						'(abs\()|(square\()|(cbrt\()|(cube\()|(sqrt\()|(pow\()|(ceil\()|(round\()|(floor\()|(fix\()|(exp\()|(log\()|(log2\()|(log10\()|(sign\()|(sin\()|(cos\()|(tan\()|\)|\+|\-|\*|\-',
						'',
						'g'
					),
					' '
				)
			) AS measurement
		FROM project_device pd
		WHERE jsonb_exists(data, 'chartOptions')
	) subquery
WHERE trim(measurement) <> ''
UNION
SELECT id AS device_id,
	measurement
FROM models,
	lateral (
		SELECT value AS measurement
		FROM (
				SELECT cast(value AS jsonb) AS val
				FROM (
						SELECT cast(value AS jsonb)->'components' AS val
						FROM jsonb_each_text(r->'data'->'meta'->'controllerMappings')
						WHERE is_valid_json(value) = true
							AND isnumeric(value) = false
					) tmp,
					jsonb_each_text(tmp.val)
				WHERE is_valid_json(value) = true
					AND isnumeric(value) = false
			) tmp2,
			jsonb_each_text(tmp2.val)
		WHERE key NOT IN ('name', 'title', 'timezone', 'type')
			AND isnumeric(value) = false
			AND is_valid_json(value) = false
	) internal
WHERE measurement != ''
UNION
SELECT id AS device_id,
	measurement
FROM models,
	lateral (
		SELECT fin.value AS measurement
		FROM jsonb_array_elements(r->'data'->'chartOptions') AS nested_data,
			jsonb_each_text(nested_data) AS fin
		WHERE fin.key = 'var'
			AND (
				r->'data'->>'type' = 'HistoryAnomalyDetection'
				OR r->'data'->>'type' = 'StreamAnomalyDetection'
			)
	) sub
UNION
SELECT id AS device_id,
	value AS measurement
FROM models,
	lateral (
		SELECT value
		FROM jsonb_each_text(r->'data'->'meta'->'controllerMappings')
		WHERE isnumeric(value) = false
			AND is_valid_json(value) = false
	) tmp
WHERE value != ''
UNION
SELECT id,
	measurement
FROM models,
	lateral (
		SELECT value AS measurement
		FROM (
				SELECT cast(value AS jsonb) AS val
				FROM jsonb_each_text(r->'data'->'meta'->'controllerMappings')
				WHERE is_valid_json(value) = true
					AND isnumeric(value) = false
			) tmp,
			jsonb_each_text(tmp.val)
	) internal
WHERE measurement != ''
	AND is_valid_json(measurement) = false
	AND isnumeric(measurement) = false
union
SELECT id,
	measurement
FROM models,
	lateral (
		SELECT value AS measurement
		FROM (
				select cast(value AS jsonb) AS val
				FROM (
						SELECT cast(value AS jsonb) AS val
						FROM (
								SELECT cast(value AS jsonb) AS val
								FROM (
										SELECT cast(value AS jsonb)->'components' AS val
										FROM jsonb_each_text(r->'data'->'meta'->'controllerMappings')
										WHERE is_valid_json(value) = true
											AND isnumeric(value) = false
									) tmp,
									jsonb_each_text(tmp.val)
								WHERE is_valid_json(value) = true
									AND isnumeric(value) = false
							) tmp2,
							jsonb_each_text(tmp2.val)
						WHERE is_valid_json(value) = true
							AND isnumeric(value) = false
							AND isbool(value) = false
							AND value::text <> '{}'
					) tmp3,
					jsonb_each_text(tmp3.val)
				WHERE is_valid_json(value) = true
					AND isnumeric(value) = false
			) tmp4,
			jsonb_each_text(tmp4.val)
		WHERE key NOT IN ('name', 'title', 'timezone', 'type')
			AND isnumeric(value) = false
			AND is_valid_json(value) = false
	) internal
WHERE measurement != '';


CREATE OR REPLACE VIEW public.measurements_mapping
AS 
    SELECT device_id, measurement
    FROM public.project_device_measurement_mapping
UNION
    SELECT module_id, variable
    FROM public.variable_mapping
UNION 
    SELECT data_mapping_id, variable
    FROM public.variable_mapping;

-- create triggers again
REFRESH MATERIALIZED VIEW public.project_device_measurement_mapping;

CREATE OR REPLACE FUNCTION refresh_project_device_measurement_mapping() RETURNS TRIGGER LANGUAGE plpgsql AS $$ BEGIN REFRESH MATERIALIZED VIEW public.project_device_measurement_mapping;

RETURN NULL;

END $$;

CREATE TRIGGER refresh_project_device_measurement_mapping_devices
AFTER
INSERT
	OR
UPDATE
	OR DELETE
	OR TRUNCATE ON project_device FOR EACH STATEMENT EXECUTE PROCEDURE refresh_project_device_measurement_mapping();

CREATE TRIGGER refresh_project_device_measurement_mapping_models
AFTER
INSERT
	OR
UPDATE
	OR DELETE
	OR TRUNCATE ON models FOR EACH STATEMENT EXECUTE PROCEDURE refresh_project_device_measurement_mapping();
