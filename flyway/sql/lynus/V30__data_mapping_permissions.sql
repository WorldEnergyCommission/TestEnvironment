INSERT INTO public."permission"
VALUES (
        'readDataMapping',
        'Permission to read a Data mapping, either given as wildcard or in combination with foreign key'
    );
INSERT INTO public."permission"
VALUES (
        'createDataMapping',
        'Permission to create a Data mapping, either given as wildcard or in combination with foreign key'
    );
INSERT INTO public."permission"
VALUES (
        'deleteDataMapping',
        'Permission to delete a Data mapping, either given as wildcard or in combination with foreign key'
    );
INSERT INTO public."permission"
VALUES (
        'listDataMappingTypes',
        'Permission to list data mapping types, given as wildcard for everyone in a project'
    );
INSERT INTO public."permission"
VALUES (
        'listDataMapping',
        'Permission to list data mappings, given as wildcard for everyone in a project'
    );
-------------------------------
--- update groups and can_be_added
UPDATE public."permission"
SET "group" = 'dataMapping',
    can_be_added = true
WHERE id = 'readDataMapping'
    or id = 'createDataMapping'
    or id = 'deleteDataMapping';
UPDATE public."permission"
SET scope_column = 'data_mapping_id'
WHERE id = 'readDataMapping'
    or id = 'createDataMapping'
    or id = 'deleteDataMapping';
---------------------------------
--- add permissions to permission groups
call create_permission_group_permission('projectAdminGroup', 'createDataMapping');
call create_permission_group_permission('projectAdminGroup', 'deleteDataMapping');
call create_permission_group_permission('projectUserGroup', 'readDataMapping');

-- everyone can listDataMappingTypes 
call create_permission_group_permission('regularUserGroup', 'listDataMappingTypes');
-- everyone can listDataMapping * because list only returns should filter with read
call create_permission_group_permission('regularUserGroup', 'listDataMapping');