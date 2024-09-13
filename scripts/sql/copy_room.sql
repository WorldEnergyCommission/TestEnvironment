-- Select room to copy
SELECT id,
    "name"
FROM public.project_collection
WHERE project_id = '88eb7225-2446-4047-be39-c50e45046d19';

-- found id 3eb35af7-9d62-4176-909d-7ebae984a319
-- find devices in room
SELECT id,
    "name",
    jsonb_array_elements(meta->'devicesPositions')->>'i' AS devices
FROM public.project_collection
WHERE id = '3eb35af7-9d62-4176-909d-7ebae984a319'
    AND meta->'devicesPositions' IS NOT NULL;

-- get data of devices in room
SELECT *
FROM project_device
WHERE id::TEXT IN (
        SELECT jsonb_array_elements(meta->'devicesPositions')->>'i' AS devices
        FROM public.project_collection
        WHERE id = '3eb35af7-9d62-4176-909d-7ebae984a319'
            AND meta->'devicesPositions' IS NOT NULL
    );

-- test with device 1aab658a-88ff-4748-8553-fe7be7ce005a
-- to insert into collection bf66838f-05a3-47b9-aff6-72a1fe1268d4
INSERT INTO project_device (
        id,
        created_at,
        name,
        DATA,
        collection_id,
        project_id
    ) (
        SELECT gen_random_uuid(),
            now(),
            name,
            CAST(replace(DATA::TEXT, 'EM2', 'EM3') AS jsonb),
            'bf66838f-05a3-47b9-aff6-72a1fe1268d4',
            '88eb7225-2446-4047-be39-c50e45046d19'
        FROM project_device
        WHERE id = '1aab658a-88ff-4748-8553-fe7be7ce005a'
    );

-- select collection posistions to copy
SELECT d->>'i' AS device_id,
    d->'x' AS x,
    d->'y' AS y
FROM (
        SELECT jsonb_array_elements(meta->'devicesPositions') AS d
        FROM public.project_collection
        WHERE id = '3eb35af7-9d62-4176-909d-7ebae984a319'
    ) positions;

;

-- for every device in old collection, insert into new device, and then update new collection with new device and position
CREATE OR REPLACE PROCEDURE copy_devices_to_collection(
        collection_id uuid,
        text_to_replace TEXT,
        text_to_replace_with TEXT,
        new_collection_id uuid
    ) LANGUAGE plpgsql AS $$
DECLARE device_position RECORD;

_old_meta jsonb;

_new_device_id uuid;

_project_id uuid;

BEGIN -- 
-- get project id
SELECT project_id INTO _project_id
FROM public.project_collection
WHERE id = new_collection_id;

-- for every device in old collection, insert into new device, and then update new collection with new device and position
FOR device_position IN
SELECT d->>'i' AS device_id,
    d->'x' AS x,
    d->'y' AS y
FROM (
        SELECT jsonb_array_elements(meta->'devicesPositions') AS d
        FROM public.project_collection
        WHERE id = collection_id
    ) positions LOOP
SELECT gen_random_uuid() INTO _new_device_id;

-- insert new device
INSERT INTO project_device (
        id,
        created_at,
        name,
        DATA,
        collection_id,
        project_id
    ) (
        SELECT _new_device_id,
            now(),
            name,
            CAST(
                replace(
                    DATA::TEXT,
                    text_to_replace,
                    text_to_replace_with
                ) AS jsonb
            ),
            new_collection_id,
            _project_id
        FROM project_device
        WHERE id = cast(device_position.device_id as uuid)
    );

SELECT meta INTO _old_meta
FROM project_collection
WHERE id = new_collection_id;

-- example of collection meta 
-- {"cover": "/icons/5881404.svg", "devicesPositions": [{"i": "5e20afdd-78bd-4bad-b9cf-ed36dc25e0f9", "x": 2, "y": 0}]}
-- update collection meta to include new position 
UPDATE project_collection
SET meta = jsonb_set(
        COALESCE(_old_meta, '{}'::jsonb),
        '{devicesPositions}',
        COALESCE(_old_meta->'devicesPositions', '[]'::jsonb) || jsonb_build_object(
            'i',
            _new_device_id,
            'x',
            device_position.x,
            'y',
            device_position.y
        )
    )
WHERE id = new_collection_id;

END LOOP;

END;

$$;

-- call with 
CALL copy_devices_to_collection(
    CAST('3eb35af7-9d62-4176-909d-7ebae984a319' AS uuid),
    'EM2',
    'EM3',
    CAST('bf66838f-05a3-47b9-aff6-72a1fe1268d4' AS uuid)
)