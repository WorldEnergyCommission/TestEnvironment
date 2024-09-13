----- SP for migration
CREATE OR REPLACE
PROCEDURE create_data_mapping_with_power(
	mappingName varchar, 
	powerVar varchar, 
	projectId uuid,
	typeId uuid)
LANGUAGE plpgsql
AS $$
DECLARE
  	mapping_id UUID := gen_random_UUID();
	mapping_type_id UUID;
BEGIN
    -- only insert if not already exists
    IF NOT EXISTS (SELECT FROM project_data_mapping pdm 
                    JOIN data_mapping_property_mapping dmpm ON pdm.id = dmpm.data_mapping_id 
                    WHERE pdm.project_id = projectId AND variable = powerVar) 
    THEN

        INSERT INTO project_data_mapping (id, "name", project_id, type_id)
        VALUES (mapping_id, mappingName, projectId, typeId);

        SELECT props.id INTO
            mapping_type_id
        FROM data_mapping_type_properties props
        WHERE props.type_id = typeId
        AND "name" = 'power';

        INSERT INTO data_mapping_property_mapping (data_mapping_id, property_id, variable)
        VALUES (mapping_id, mapping_type_id, powerVar);
    END IF;
END;
$$;

-- migration for energy view to data mapping, for power vars & names
CREATE OR REPLACE
PROCEDURE migrate_data_mapping_type_from_energy_view (
	typeId uuid, energyViewComponent varchar)
LANGUAGE plpgsql
AS $$
DECLARE
    result_row RECORD;
BEGIN 
	FOR result_row IN 
    SELECT foo.title, foo.measurement, foo.project, typeId
	FROM (
		SELECT titles.id, titles.system, titles.name AS title, 
			mappings.property, mappings.measurement, mappings.project_id AS project, 
			ROW_NUMBER() OVER( PARTITION BY mappings.measurement, titles.id) AS num
		FROM (
			SELECT id, 
				split_part( value->>'key', '_', 1) AS SYSTEM, 
				split_part( value->>'key', '_', 2) AS property, value->>'value' AS name
			FROM project_device, 
			LATERAL jsonb_array_elements(DATA->'meta'->'titleMapping')
			WHERE DATA->>'type' = 'EnergyView'
				AND split_part( value->>'key', '_', 2)<> ''
		) titles
		LEFT JOIN 
		(
			SELECT id, split_part(KEY, '_', 1) AS SYSTEM, split_part(KEY, '_', 2) AS property, value AS measurement, project_id
			FROM project_device, LATERAL jsonb_each_text(DATA->'mappings')
			WHERE DATA->>'type' = 'EnergyView'
				AND value <> ''
		) mappings 
		ON
		titles.id = mappings.id
			AND titles.system = mappings.system
		WHERE mappings.property = 'actualValue'
			AND titles.system LIKE energyViewComponent || '%'
	) foo
	WHERE foo.num = 1 
    LOOP
        CALL create_data_mapping_with_power(result_row.title, result_row.measurement, result_row.project, typeId);
    END LOOP;
END;
$$;


CALL migrate_data_mapping_type_from_energy_view('c84bf644-1290-441a-86a9-b3b40e73aa5c', 'pv');
CALL migrate_data_mapping_type_from_energy_view('85354087-07a6-459e-b524-2302e0ebc922', 'grid');
CALL migrate_data_mapping_type_from_energy_view('9b455a11-26b4-4058-9fad-c2a4db23a2fc', 'battery');
