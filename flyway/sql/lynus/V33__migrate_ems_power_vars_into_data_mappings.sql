-- migration for energy view to data mapping, for power vars & names
CREATE OR REPLACE
PROCEDURE migrate_data_mapping_type_from_ems (
	typeId uuid, energyViewComponent varchar)
LANGUAGE plpgsql
AS $$
DECLARE
    result_row RECORD;
BEGIN 
	FOR result_row IN 
		WITH mappings AS (
			SELECT id, component, KEY AS property, value AS measurement, component_key, project
			FROM(
				SELECT id, component, value AS val, KEY AS component_key, project
				FROM(
					SELECT id, KEY AS component, value->'components' AS component_props, r->>'project_id' AS project
					FROM models, LATERAL jsonb_each(r->'data'->'meta'->'controllerMappings')
				WHERE r->'data'->>'type' = 'EMS'
				AND value->'components' IS NOT NULL
				AND value->>'components' <> '{}') intermed, 
				LATERAL
				jsonb_each(intermed.component_props)) 
			component_mappings, 
			LATERAL jsonb_each_text(component_mappings.val)
			WHERE value <> ''
			AND component LIKE energyViewComponent || '%')


		SELECT DISTINCT m1.project AS project, m1.measurement AS "power", m2.measurement AS "title"
		FROM mappings m1
		JOIN mappings m2 ON
		m1.id = m2.id
		AND m1.component_key = m2.component_key
		AND m1.project = m2.project
		WHERE m1.property = 'power'
		AND m2.property = 'title'
	LOOP
		CALL create_data_mapping_with_power(result_row.title, result_row."power", cast(result_row.project as uuid), typeId);
	END LOOP;
END;
$$;


CALL migrate_data_mapping_type_from_ems('c84bf644-1290-441a-86a9-b3b40e73aa5c', 'pv');
CALL migrate_data_mapping_type_from_ems('85354087-07a6-459e-b524-2302e0ebc922', 'grid');
CALL migrate_data_mapping_type_from_ems('9b455a11-26b4-4058-9fad-c2a4db23a2fc', 'battery');
