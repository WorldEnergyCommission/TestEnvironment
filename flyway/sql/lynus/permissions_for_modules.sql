INSERT INTO public."permission" VALUES 
( 'readModule', 'Permission to read a module, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES 
( 'createModule', 'Permission to create a module, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES 
( 'deleteModule', 'Permission to delete a module, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES 
( 'updateModule', 'Permission to change a module, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES 
( 'listModuleTypes', 'Permission to list types of modules, given as wildcard for everyone');
INSERT INTO public."permission" VALUES 
( 'listModules', 'Permission to list types of modules, given as wildcard for everyone in a project');


UPDATE public."permission" SET "group" = 'module', can_be_added = true
WHERE id = 'readModule' or id = 'createModule' or
id = 'deleteModule' or id = 'updateModule';


UPDATE public."permission" SET scope_column = 'module_id' 
WHERE  id = 'readModule' or id = 'createModule' or
id = 'deleteModule' or id = 'updateModule';


call create_permission_group_permission('projectAdminGroup', 'readModule');
call create_permission_group_permission('projectAdminGroup', 'createModule');
call create_permission_group_permission('projectAdminGroup', 'deleteModule');
call create_permission_group_permission('projectAdminGroup', 'updateModule');
call create_permission_group_permission('regularUserGroup', 'listModuleTypes');
call create_permission_group_permission('regularUserGroup', 'listModules');