ALTER TABLE public.asset DROP COLUMN user_id;
ALTER TABLE public.asset
ADD project_id uuid NULL;
ALTER TABLE public.asset
ADD CONSTRAINT asset_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project(id) ON DELETE CASCADE;
----------------------------------
---------   update assets   ------
----------------------------------
-- insert project id via cover ---
UPDATE asset
SET project_id = mappin.project_id
FROM (
        SELECT id AS project_id,
            cast(meta->>'imageId' AS uuid) AS asset_id
        FROM project
        WHERE meta->>'imageId' IS NOT NULL
    ) mappin
WHERE asset.id = mappin.asset_id;
-- insert project id via report ---
UPDATE asset
SET project_id = mappin.project_id
FROM (
        SELECT id AS project_id,
            cast(meta->>'reportImageId' AS uuid) AS asset_id
        FROM project
        WHERE meta->>'imageId' IS NOT NULL
    ) mappin
WHERE asset.id = mappin.asset_id;
-- insert collection id via cover --
UPDATE asset
SET project_id = mappin.project_id
FROM (
        SELECT project_id,
            cast(
                REPLACE(meta->>'cover', '/assets/', '') AS uuid
            ) AS asset_id
        FROM project_collection
        WHERE meta->>'cover' LIKE '/assets/%'
    ) mappin
WHERE asset.id = mappin.asset_id;
-- permissions to create project asset
INSERT INTO public."permission"
VALUES ('createProjectAsset', 'Permission to create an assets');
UPDATE public."permission"
SET "group" = 'assets',
    can_be_added = true
WHERE id = 'createProjectAsset';
call create_permission_group_permission('projectAdminGroup', 'createProjectAsset');
-- project asset --> collection dependency
INSERT INTO public.permission_dependency ("permission", dependent_on)
VALUES('writeCollection', 'createProjectAsset');
INSERT INTO public.permission_dependency ("permission", dependent_on)
VALUES('createCollection', 'createProjectAsset');
-- project asset --> project dependency
INSERT INTO public.permission_dependency ("permission", dependent_on)
VALUES('writeProject', 'createProjectAsset');