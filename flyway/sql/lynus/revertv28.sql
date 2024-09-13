DROP VIEW public.measurements_mapping;
--------------
drop view permissions_for_user;
drop view general_permissions_for_user;
drop view project_permissions_for_user;
------------------------------------------
CREATE OR replace view public.general_permissions_for_user as
SELECT user_role.user_id,
    r.id AS permission_id,
    rgrs.scope_id,
    s.wildcard,
    s.collection_id,
    s.device_id,
    s.user_id AS member_id,
    s.document_id,
    s.rule_id,
    s.invoice_id,
    s.report_id,
    s.model_id
FROM public.user_role user_role
    JOIN public."role" "role" on "role".id = user_role.role_id
    JOIN public.role_permission_group role_permission_group on role_permission_group.role_id = "role".id
    JOIN public.permission_group rg on rg.id = role_permission_group.permission_group_id
    JOIN public.permission_group_permissions rgrs on rgrs.permission_group_id = rg.id
    JOIN public.permission_scope s on s.id = rgrs.scope_id
    JOIN public.permission r on r.id = rgrs.permission_id;
---------------
CREATE OR replace view public.project_permissions_for_user as
SELECT *
FROM (
        SELECT project_permissions.project_id AS project_id,
            project_permissions.user_id AS user_id,
            r.id AS permission_id,
            project_permissions.scope_id,
            scope.wildcard,
            scope.collection_id,
            scope.device_id,
            scope.user_id AS member_id,
            scope.document_id,
            scope.rule_id,
            scope.invoice_id,
            scope.report_id,
            scope.model_id
        FROM public.additional_project_permissions project_permissions
            JOIN public.permission r on r.id = project_permissions.permission_id
            JOIN public.permission_scope scope on scope.id = project_permissions.scope_id
    ) added
union
SELECT *
FROM (
        SELECT project_user.project_id AS project_id,
            u.id AS user_id,
            r.id AS permission_id,
            rgrs.scope_id,
            s.wildcard,
            s.collection_id,
            s.device_id,
            s.user_id AS member_id,
            s.document_id,
            s.rule_id,
            s.invoice_id,
            s.report_id,
            s.model_id
        FROM public.user u
            JOIN public.project_user_role project_user on project_user.user_id = u.id
            JOIN public."role" "role" on "role".id = project_user.role_id
            JOIN public.role_permission_group role_permission_group on role_permission_group.role_id = "role".id
            JOIN public.permission_group rg on rg.id = role_permission_group.permission_group_id
            JOIN public.permission_group_permissions rgrs on rgrs.permission_group_id = rg.id
            JOIN public.permission_scope s on s.id = rgrs.scope_id
            JOIN public.permission r on r.id = rgrs.permission_id
    ) grouped;
;
---------------------------------
CREATE OR REPLACE VIEW public.permissions_for_user AS       
   	SELECT 	project_id, 
   			user_id, 
   			permission_id, 
   			scope_id, 
   			CASE WHEN p.group = 'project' THEN false ELSE wildcard END AS wildcard, 
   			collection_id, 
   			device_id, 
   			member_id, 
   			document_id, 
   			rule_id, 
   			invoice_id, 
   			report_id, 
   			model_id
 	FROM project_permissions_for_user pp
 	JOIN "permission" p on pp.permission_id = p.id
	UNION 
	SELECT 	null AS project_id,
			user_id, 
			permission_id, 
			scope_id, 
			wildcard, 
			collection_id, 
			device_id, 
			member_id, 
			document_id, 
			rule_id, 
			invoice_id, 
			report_id, 
			model_id
 	FROM general_permissions_for_user gp; 
 	
----------------
-----------------
DROP view variable_mapping;
DROP TABLE module_required_device_properties;
DROP TABLE module_device_mapping;
DROP TABLE project_collection_module_mapping;
alter table permission_scope drop column "module_id";
alter table device_type_properties drop column "group";
drop table device_property_category;
DROP TABLE modules;
DROP TABLE module_type_devices;
DROP TABLE module_types;
ALTER TABLE public.device_type_properties DROP column "name";
DELETE FROM project_data_mapping;
DELETE FROM public.data_mapping_property_mapping;
DELETE FROM public.data_mapping_type_properties;
DELETE FROM public.data_mapping_types;
DROP MATERIALIZED VIEW public.measurements_daily_integral;

-------------------------
--------------------


                    DELETE FROM public."permission"  WHERE id LIKE '%ataMappin%' ;
                    DELETE FROM public.permission_group_permissions WHERE permission_id LIKE '%ataMappin%'; 
-------------------------
--------------------
-------------------------
--------------------


-- NOT USED

ALTER TABLE public.device_property_mapping DROP CONSTRAINT IF EXISTS device_property_mapping_fk;

-------