select id, split_part(key, '_', 1) AS system, split_part(key, '_', 2) as property, value as measurement
from project_device,
lateral jsonb_each_text(data->'mappings')
where data->>'type' = 'EnergyView'
and value <> '';

select id,split_part( value->>'key', '_', 1) AS system, split_part( value->>'key', '_', 2) as property, value->>'value' as name
from project_device, 
lateral jsonb_array_elements(data->'meta'->'titleMapping')
where data->>'type' = 'EnergyView'
and split_part( value->>'key', '_', 2)<>''
;

select id, component, key as property,value as measurement 
FRom
(select id, component, value as val
from (
select id,  key as component, value->'components' as component_props 
from models, 
lateral jsonb_each(r->'data'->'meta'->'controllerMappings') 
where r->'data'->>'type' = 'EMS'
and value->'components' is not null 
and value->>'components' <> '{}') intermed,
lateral
jsonb_each(intermed.component_props)) component_mappings,
lateral jsonb_each_text(component_mappings.val)
where value <> ''
;
-- query for pv actual values from energy views
select distinct measurement, project_id from (
select id, split_part(key, '_', 1) AS system, split_part(key, '_', 2) as property, value as measurement, project_id 
from project_device,
lateral jsonb_each_text(data->'mappings')
where data->>'type' = 'EnergyView'
and value <> '') intermediate 
where "system" like 'pvSystem%' and "property" = 'actualValue';



--- more extended query for EMS
select id, component, key as property,value as measurement, component_key, project
FRom
(select id, component, value as val, key as component_key, project
from (
select id,  key as component, value->'components' as component_props, r->>'project_id' as project
from models, 
lateral jsonb_each(r->'data'->'meta'->'controllerMappings') 
where r->'data'->>'type' = 'EMS'
and value->'components' is not null 
and value->>'components' <> '{}') intermed,
lateral
jsonb_each(intermed.component_props)) component_mappings,
lateral jsonb_each_text(component_mappings.val)
where value <> '' ;


-- energy view mapping with title/name of future mapping
SELECT * FROM (SELECT titles.id, titles.system, titles.name AS title, mappings.property, mappings.measurement, 
	ROW_NUMBER() OVER( PARTITION BY mappings.measurement, titles.id) AS num
FROM (
	SELECT id, split_part( value->>'key', '_', 1) AS SYSTEM, split_part( value->>'key', '_', 2) AS property, value->>'value' AS name
	FROM project_device, LATERAL jsonb_array_elements(DATA->'meta'->'titleMapping')
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
ON titles.id = mappings.id AND titles.system = mappings.system
WHERE mappings.property = 'actualValue'
AND titles.system LIKE 'pv%') foo
WHERE foo.num = 1;
;


-- select to find soc values to matching power vars
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
	WHERE prop_types.name = 'power' AND pdm.type_id = '9b455a11-26b4-4058-9fad-c2a4db23a2fc')
	
SELECT m1.project_id AS project, m1.measurement AS "power", m2.measurement AS "soc" , cpv.id AS data_mapping_id
FROM mappings m1
JOIN mappings m2 ON m1.id = m2.id AND m1.SYSTEM = m2.SYSTEM AND m1.project_id = m2.project_id
JOIN current_power_vars cpv ON m1.measurement = cpv.variable AND m1.project_id = cpv.project_id
WHERE m1.property = 'actualValue' 
and m2.property = 'socValue';



-- matching vars from ems
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
	WHERE prop_types.name = 'power' AND pdm.type_id = '9b455a11-26b4-4058-9fad-c2a4db23a2fc')
	
SELECT m1.project_id AS project, m1.measurement AS "power", m2.measurement AS "soc", cpv.id AS data_mapping_id
FROM mappings m1
JOIN mappings m2 ON m1.id = m2.id AND m1.system = m2.system AND m1.project_id = m2.project_id
JOIN current_power_vars cpv ON m1.measurement = cpv.variable AND CAST(m1.project_id AS uuid) = cpv.project_id
WHERE m1.property = 'power' 
and m2.property = 'soc';