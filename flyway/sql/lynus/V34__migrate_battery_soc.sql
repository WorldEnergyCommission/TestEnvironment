
-- select soc to coresponding power vars, that have been inserted into data_mapping tables

WITH mappings AS (
	SELECT id, split_part(KEY, '_', 1) AS SYSTEM, split_part(KEY, '_', 2) AS property, value AS measurement, project_id
	FROM project_device, LATERAL jsonb_each_text(DATA->'mappings')
	WHERE DATA->>'type' = 'EnergyView'
	AND value <> ''), current_power_vars AS (
	SELECT pdm.id,pdm.project_id, props.variable
	FROM public.project_data_mapping pdm
	JOIN  public.data_mapping_property_mapping props ON pdm.id = props.data_mapping_id
	JOIN public.data_mapping_type_properties prop_types ON props.property_id  = prop_types.id
	WHERE prop_types.name = 'power' AND pdm.type_id = '9b455a11-26b4-4058-9fad-c2a4db23a2fc'),
current_mappings AS (SELECT dmpm.data_mapping_id, pdm.project_id, dmpm.variable, dmtp.name AS property
					FROM project_data_mapping pdm 
                    JOIN data_mapping_property_mapping dmpm ON pdm.id = dmpm.data_mapping_id
                    JOIN data_mapping_type_properties dmtp ON dmpm.property_id = dmtp.id)	


INSERT INTO data_mapping_property_mapping (data_mapping_id, property_id, variable)	
SELECT DISTINCT cpv.id AS data_mapping_id,  
    (SELECT id FROM data_mapping_type_properties WHERE type_id = '9b455a11-26b4-4058-9fad-c2a4db23a2fc' AND "name" = 'soc') AS property_id,
    m2.measurement AS "soc"
FROM mappings m1
JOIN mappings m2 ON m1.id = m2.id AND m1.SYSTEM = m2.SYSTEM AND m1.project_id = m2.project_id
JOIN current_power_vars cpv ON m1.measurement = cpv.variable AND m1.project_id = cpv.project_id
full JOIN current_mappings curr ON CAST(m1.project_id AS uuid) = curr.project_id AND curr.variable = m2.measurement AND cpv.id = curr.data_mapping_id
WHERE m1.property = 'actualValue' 
and m2.property = 'socValue'
AND curr.data_mapping_id IS NULL;



--  migrate matching vars from ems
WITH mappings AS (
	SELECT id, KEY AS property, value AS measurement,component_key AS system ,project AS project_id
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
	AND component LIKE 'battery' || '%'	), 
current_power_vars AS (
	SELECT pdm.id,pdm.project_id, props.variable
	FROM public.project_data_mapping pdm
	JOIN  public.data_mapping_property_mapping props ON pdm.id = props.data_mapping_id
	JOIN public.data_mapping_type_properties prop_types ON props.property_id  = prop_types.id
	WHERE prop_types.name = 'power' AND pdm.type_id = '9b455a11-26b4-4058-9fad-c2a4db23a2fc'),
current_mappings AS (SELECT dmpm.data_mapping_id, pdm.project_id, dmpm.variable, dmtp.name AS property
					FROM project_data_mapping pdm 
                    JOIN data_mapping_property_mapping dmpm ON pdm.id = dmpm.data_mapping_id
                    JOIN data_mapping_type_properties dmtp ON dmpm.property_id = dmtp.id)	

INSERT INTO data_mapping_property_mapping (data_mapping_id, property_id, variable)
SELECT DISTINCT cpv.id AS data_mapping_id, 
    (SELECT id FROM data_mapping_type_properties WHERE type_id = '9b455a11-26b4-4058-9fad-c2a4db23a2fc' AND "name" = 'soc') AS property_id,
     m2.measurement AS "soc" 
FROM mappings m1
JOIN mappings m2 ON m1.id = m2.id AND m1.system = m2.system AND m1.project_id = m2.project_id
JOIN current_power_vars cpv ON m1.measurement = cpv.variable AND CAST(m1.project_id AS uuid) = cpv.project_id
full JOIN current_mappings curr ON CAST(m1.project_id AS uuid) = curr.project_id AND curr.variable = m2.measurement AND cpv.id = curr.data_mapping_id
WHERE m1.property = 'power' 
AND m2.property = 'soc'
AND curr.data_mapping_id IS NULL;
