-- role table containing all roles and a description 
CREATE TABLE public.permission_group (
    id          VARCHAR(50) NOT NULL PRIMARY KEY,
    description VARCHAR         NULL
);

-- permission table containing all permissions and a description
CREATE TABLE public."permission" (
	id                  varchar(50) NOT NULL PRIMARY KEY,
	description         varchar         NULL,
	scope_column        varchar         NULL,
	"group"             varchar         NULL,
    can_be_added    bool        NOT NULL DEFAULT false
);

-- all roles
CREATE TABLE public."role" (
    id          VARCHAR(50) NOT NULL PRIMARY KEY,
    description VARCHAR         NULL
);

-- user FROM keycloak
CREATE TABLE public.user (
    id          UUID        NOT NULL PRIMARY KEY
);

CREATE TABLE public.permission_scope (
    id              UUID    NOT NULL PRIMARY key DEFAULT gen_random_UUID(),
    wildcard        boolean NOT NULL, -- true = *, false means other column needs reference, permissions without :{id|*} true
    collection_id   UUID        NULL REFERENCES public.project_collection(id) ON DELETE CASCADE,
    device_id       UUID        NULL REFERENCES public.project_device(id)       ON DELETE CASCADE,
    user_id         UUID        NULL REFERENCES public.user(id)                 ON DELETE CASCADE, --writeMember
    document_id     UUID        NULL REFERENCES public.project_document(id)     ON DELETE CASCADE,-- deleteDocument
    rule_id         UUID        NULL REFERENCES public.project_rule(id)         ON DELETE CASCADE, -- writeRule
    invoice_id      UUID        NULL REFERENCES public.invoice(id)              ON DELETE CASCADE,-- readInvoice
    report_id       UUID        NULL REFERENCES public.project_report           ON DELETE CASCADE,-- writeReport
    model_id        UUID        NULL REFERENCES public.models                   ON DELETE CASCADE
);

-- mapping FROM role groups to their permissions  
CREATE TABLE public.permission_group_permissions (
    permission_group_id    VARCHAR      NOT NULL   REFERENCES public.permission_group(id),
    permission_id          VARCHAR      NOT NULL   REFERENCES public.permission(id),
    scope_id          UUID    	        NOT NULL   REFERENCES public.permission_scope(id)   ON DELETE CASCADE,
    CONSTRAINT role_group_permissions_pk PRIMARY KEY (permission_group_id, permission_id,scope_id)
);


-- mapping FROM role to permission group
CREATE TABLE public.role_permission_group (
    role_id                 VARCHAR(50) NOT NULL REFERENCES public.role(id),
    permission_group_id    VARCHAR(50) NOT NULL REFERENCES public.permission_group(id),
    CONSTRAINT role_pk PRIMARY KEY (role_id,permission_group_id)
);

-- overall platform user roles
CREATE TABLE public.user_role (
    user_id     UUID    NOT NULL REFERENCES public.user(id)     ON DELETE CASCADE,
    role_id     VARCHAR NOT NULL REFERENCES public.role(id),
    realm       VARCHAR NOT NULL,
    CONSTRAINT user_role_pk PRIMARY KEY (user_id, role_id, realm)
);

-- store specific roles for projects (projectAdmin, projectUser, restrictedUser)
CREATE TABLE public.project_user_role (
    project_id  UUID    NOT NULL REFERENCES public.project(id) ON DELETE CASCADE,
    user_id     UUID    NOT NULL REFERENCES public.user(id)    ON DELETE CASCADE,
    role_id     VARCHAR NOT NULL REFERENCES public.role(id),
    realm       VARCHAR NOT NULL,
    CONSTRAINT project_role_pk PRIMARY KEY (realm, project_id,user_id,role_id)
);

-- additional project permissions table schema realm - projectId - userId - permissionId
CREATE TABLE public.additional_project_permissions (
    project_id  UUID            NOT NULL    REFERENCES public.project (id)           ON DELETE CASCADE,
	user_id     UUID            NOT NULL    REFERENCES public.user(id)               ON DELETE CASCADE,
	permission_id    varchar    NOT NULL    REFERENCES public.permission(id)         ON DELETE CASCADE,
    scope_id    UUID                NULL    REFERENCES public.permission_scope(id)   ON DELETE CASCADE,
	CONSTRAINT project_permissions_pk PRIMARY KEY (project_id,user_id,permission_id,scope_id)
);

-- some permissions only make sense with other permissions, this table represents their dependencies, e.g.: createDevice only makes sense with readDevices * 
CREATE TABLE public.permission_dependency (
	"permission" varchar(50) NOT NULL,
	dependent_on varchar(50) NOT NULL,
	CONSTRAINT permission_dependency_pk PRIMARY KEY ("permission",dependent_on),
	CONSTRAINT permission_dependency_fk FOREIGN KEY ("permission") REFERENCES public."permission"(id) ON DELETE CASCADE,
	CONSTRAINT permission_dependency_fk_1 FOREIGN KEY (dependent_on) REFERENCES public."permission"(id) ON DELETE CASCADE
);

--

-----------------------------------------------------------------------
--                           permission groups                           ---
-----------------------------------------------------------------------
-- project permission groups
INSERT INTO public.permission_group VALUES ( 'restrictedUserGroup', 'User permissions for a specific project, which are restricted');
INSERT INTO public.permission_group VALUES ( 'projectUserGroup', 'User permissions for a specific project');
INSERT INTO public.permission_group VALUES ( 'projectAdminGroup', 'Admin permissions for a specific project');
-- platform permission groups
INSERT INTO public.permission_group VALUES ( 'regularUserGroup', 'Regular User permissions on platform');
INSERT INTO public.permission_group VALUES ( 'adminUserGroup', 'Admin permissions on platform');
INSERT INTO public.permission_group VALUES ( 'serviceUserGroup', 'Service permissions on platFROM');

-------
-----------------------------------------------------------------------
--                             roles                                ---
-----------------------------------------------------------------------
-- platfomr roles
INSERT INTO public."role" VALUES ( 'adminUser', 'Admin on platform');
INSERT INTO public."role" VALUES ( 'regularUser', 'User on platform');
INSERT INTO public."role" VALUES ( 'serviceUser', 'Service on platform');

-- project roles
INSERT INTO public."role" VALUES ( 'projectAdmin', 'Admin of a project');
INSERT INTO public."role" VALUES ( 'projectUser', 'User of a project');
INSERT INTO public."role" VALUES ( 'restrictedProjectUser', 'Restricted user of a project');

-----------------------------------------------------------------------
--                  mapping roles to permission-group                    ---
-----------------------------------------------------------------------
-- platform 
INSERT INTO public.role_permission_group VALUES ( 'adminUser', 'adminUserGroup');
INSERT INTO public.role_permission_group VALUES ( 'adminUser', 'regularUserGroup');
INSERT INTO public.role_permission_group VALUES ( 'adminUser', 'projectAdminGroup');
INSERT INTO public.role_permission_group VALUES ( 'adminUser', 'projectUserGroup');
INSERT INTO public.role_permission_group VALUES ( 'adminUser', 'restrictedUserGroup');

INSERT INTO public.role_permission_group VALUES ( 'regularUser', 'regularUserGroup');

INSERT INTO public.role_permission_group VALUES ( 'serviceUser', 'serviceUserGroup');

-- project
INSERT INTO public.role_permission_group VALUES ( 'restrictedProjectUser', 'restrictedUserGroup');

INSERT INTO public.role_permission_group VALUES ( 'projectUser', 'restrictedUserGroup');
INSERT INTO public.role_permission_group VALUES ( 'projectUser', 'projectUserGroup');

INSERT INTO public.role_permission_group VALUES ( 'projectAdmin', 'restrictedUserGroup');
INSERT INTO public.role_permission_group VALUES ( 'projectAdmin', 'projectUserGroup');
INSERT INTO public.role_permission_group VALUES ( 'projectAdmin', 'projectAdminGroup');

-----------------------------------------------------------------------
--                            permissions                                ---
-----------------------------------------------------------------------


------------------------ platform permissions ------------------------------

-- swagger permission
INSERT INTO public."permission" VALUES ( 'readSwagger', 'Permission to read API-Swagger');

UPDATE public."permission" SET "group" = 'swagger' 
WHERE id = 'readSwagger';

-- permission permission
INSERT INTO public."permission" VALUES ('readPermission', 'Permission to read permissions');

UPDATE public."permission" SET "group" = 'Permission' 
WHERE id = 'readPermission';

-- icon permission
INSERT INTO public."permission" VALUES ( 'readIcon', 'Permission to fetch a list of icons');

UPDATE public."permission" SET "group" = 'icon' 
WHERE id = 'readIcon';

-- project permissions
INSERT INTO public."permission" VALUES ( 'listProject', 'Permission to list projects, given as wildcard for everyone');
INSERT INTO public."permission" VALUES ( 'createProject', 'Permission to create a project, given as wildcard for admins');
INSERT INTO public."permission" VALUES ( 'writeProject', 'Permission to change a project, either given as wildcard for admins or through project_user_role association');
INSERT INTO public."permission" VALUES ( 'deleteProject', 'Permission to delete a project, either given as wildcard for admins or through project_user_role association');

UPDATE public."permission" SET "group" = 'project' 
WHERE id = 'createProject' or id = 'writeProject' or
id = 'deleteProject';

-- user permissions
INSERT INTO public."permission" VALUES ( 'readUser', 'Permission to read Users, given as wildcard');

UPDATE public."permission" SET "group" = 'user' 
WHERE id = 'readUser';

-- assSETs ???? 
INSERT INTO public."permission" VALUES ('readAssets', 'Permission to read all assets');
INSERT INTO public."permission" VALUES ('createAsset', 'Permission to create an assets');

UPDATE public."permission" SET "group" = 'assets' 
WHERE id = 'readAssets'  or id = 'createAsset';

-- weather permissions
INSERT INTO public."permission" VALUES ( 'readWeather', 'Permission to read Weather, given as wildcard');

UPDATE public."permission" SET "group" = 'weather' 
WHERE id = 'readWeather';

-- notification permissions
INSERT INTO public."permission" VALUES ( 'createNotification', 'Permission to create a Notification, given as wildcard');

UPDATE public."permission" SET "group" = 'notification' 
WHERE id = 'createNotification';

-- invoice permissions ???? ID
INSERT INTO public."permission" VALUES ( 'readInvoice', 'Permission to create a Notification, given as wildcard');

UPDATE public."permission" SET "group" = 'invoice' 
WHERE id = 'readInvoice';

-- readMetric
INSERT INTO public."permission" VALUES ( 'readMetric', 'Permission to read a metric, given as wildcard');

UPDATE public."permission" SET "group" = 'metric' 
WHERE id = 'readMetric';

------------------------ project permissions ------------------------------
INSERT INTO public."permission" VALUES ( 'readProject', 'Permission to read a project, either given as wildcard for admins or through project_user_role association');

UPDATE public."permission" SET "group" = 'project' 
WHERE id = 'readProject';

-- mqtt secret
INSERT INTO public."permission" VALUES ( 'readMQTTSecret', 'Permission to read a MQTT secret. Given to project admins.');

-- collection permissions
INSERT INTO public."permission" VALUES ( 'createCollection', 'Permission to create a Collection, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'writeCollection', 'Permission to change a Collection, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'deleteCollection', 'Permission to delete a Collection, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'listCollection', 'Permission to list Collections, given as wildcard for everyone in a project');

UPDATE public."permission" SET "group" = 'collection', can_be_added = true
WHERE id = 'createCollection' or id = 'writeCollection' or
id = 'deleteCollection';

UPDATE public."permission" SET scope_column = 'collection_id' 
WHERE id = 'writeCollection' or
id = 'deleteCollection';

-- device permissions
INSERT INTO public."permission" VALUES ( 'readDevice', 'Permission to read a Device, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'createDevice', 'Permission to create a Device, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'writeDevice', 'Permission to change a Device, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'deleteDevice', 'Permission to delete a Device, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'listDevice', 'Permission to list devices, given as wildcard for everyone in a project');

UPDATE public."permission" SET "group" = 'device', can_be_added = true 
WHERE id = 'readDevice' or id = 'createDevice' or
id = 'writeDevice' or id = 'deleteDevice';

UPDATE public."permission" SET scope_column = 'device_id' 
WHERE id = 'readDevice' or
id = 'writeDevice' or id = 'deleteDevice';

INSERT INTO public.permission_dependency
("permission", dependent_on)
VALUES('createDevice', 'readDevice');

-- member permissions
INSERT INTO public."permission" VALUES ( 'readMember', 'Permission to read a Member, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'createMember', 'Permission to create a Member, given as wildcard for a project');
INSERT INTO public."permission" VALUES ( 'writeMember', 'Permission to change a Member, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'deleteMember', 'Permission to delete a Member, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'listMember', 'Permission to list member, given as wildcard for everyone in a project');

UPDATE public."permission" SET "group" = 'members'
WHERE id = 'readMember' or id = 'createMember' or
id = 'writeMember' or id = 'deleteMember';

UPDATE public."permission" SET scope_column = 'user_id' 
WHERE id = 'readMember' or
id = 'writeMember' or id = 'deleteMember';

INSERT INTO public.permission_dependency
("permission", dependent_on)
VALUES('createMember', 'readMember');

-- document permissions

INSERT INTO public."permission" VALUES ( 'listDocument', 'Permission to list documents, given as wildcard for everyone');
INSERT INTO public."permission" VALUES ( 'readDocument', 'Permission to read a Document, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'createDocument', 'Permission to create a Document, given as wildcard');
INSERT INTO public."permission" VALUES ( 'deleteDocument', 'Permission to delete a Document, either given as wildcard or in combination with foreign key');

UPDATE public."permission" SET "group" = 'documents', can_be_added = true  
WHERE id = 'readDocument' or id = 'createDocument' or
id = 'deleteDocument';

UPDATE public."permission" SET scope_column = 'document_id' 
WHERE id = 'readDocument' or id = 'deleteDocument';

INSERT INTO public.permission_dependency
("permission", dependent_on)
VALUES('createDocument', 'readDocument');

-- alert permissions
INSERT INTO public."permission" VALUES ( 'readAlert', 'Permission to read an Alert, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'createAlert', 'Permission to create an Alert, given as wildcard');
INSERT INTO public."permission" VALUES ( 'writeAlert', 'Permission to accept an Alert, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'listAlert', 'Permission to list alerts, given as wildcard for everyone in a project');

UPDATE public."permission" SET "group" = 'alerts'
WHERE id = 'readAlert' or id = 'createAlert' or
id = 'writeAlert';


-- rule permissions
INSERT INTO public."permission" VALUES ( 'readRule', 'Permission to read a Rule, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'createRule', 'Permission to create a Rule, given as wildcard for a project');
INSERT INTO public."permission" VALUES ( 'writeRule', 'Permission to change a Rule, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'deleteRule', 'Permission to delete a Rule, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'listRule', 'Permission to list alerts, given as wildcard for everyone in a project');

UPDATE public."permission" SET "group" = 'rules', can_be_added = true  
WHERE id = 'readRule' or id = 'createRule' or
id = 'writeRule' or id = 'deleteRule';

UPDATE public."permission" SET scope_column = 'rule_id' 
WHERE id = 'readRule' or id = 'writeRule' or id = 'deleteRule';

INSERT INTO public.permission_dependency
("permission", dependent_on)
VALUES('createRule', 'readRule');

-- reports permissions
INSERT INTO public."permission" VALUES ( 'readReport', 'Permission to read a Report, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'createReport', 'Permission to create a Report, given as wildcard for a project');
INSERT INTO public."permission" VALUES ( 'writeReport', 'Permission to change a Report, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'deleteReport', 'Permission to delete a Report, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'listReport', 'Permission to list alerts, given as wildcard for everyone in a project');

UPDATE public."permission" SET "group" = 'reports', can_be_added = true  
WHERE id = 'readReport' or id = 'createReport' or
id = 'writeReport' or id = 'deleteReport';

UPDATE public."permission" SET scope_column = 'report_id' 
WHERE id = 'readReport' or id = 'writeReport' or id = 'deleteReport';

INSERT INTO public.permission_dependency
("permission", dependent_on)
VALUES('createReport', 'readReport');

-- mpc permissions
INSERT INTO public."permission" VALUES ( 'listAI', 'Permission to list models, given as wildcard for everyone in a project');
INSERT INTO public."permission" VALUES ( 'readAI', 'Permission to read a AI, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'createAI', 'Permission to create a AI');
INSERT INTO public."permission" VALUES ( 'writeAI', 'Permission to change a AI, either given as wildcard or in combination with foreign key');
INSERT INTO public."permission" VALUES ( 'deleteAI', 'Permission to delete a AI, either given as wildcard or in combination with foreign key');

UPDATE public."permission" SET "group" = 'AI', can_be_added = true  
WHERE id = 'readAI' or id = 'createAI' or
id = 'writeAI' or id = 'deleteAI';

UPDATE public."permission" SET scope_column = 'model_id' 
WHERE id = 'readAI' or id = 'writeAI' or id = 'deleteAI';

INSERT INTO public.permission_dependency
("permission", dependent_on)
VALUES('createAI', 'readAI');

INSERT INTO public.permission_dependency
("permission", dependent_on)
VALUES('writeAI', 'createRule');

INSERT INTO public.permission_dependency 
("permission", dependent_on)
VALUES ('createAI','createRule');

INSERT INTO permission_dependency 
("permission", dependent_on)
VALUES ('deleteAI','deleteRule');

INSERT INTO permission_dependency 
("permission", dependent_on)
VALUES ('writeAI','deleteRule');

--------------
INSERT INTO public."permission" VALUES ( 'readAIWeather', 'Permission to read a weather FROM ai module, given as wildcard in a project');
INSERT INTO public."permission" VALUES ( 'createAIWeather', 'Permission to create a weather FROM ai module, given as wildcard in a project');
INSERT INTO public."permission" VALUES ( 'deleteAIWeather', 'Permission to delete a weather FROM ai module, given as wildcard in a project');

INSERT INTO public."permission" VALUES ( 'createMeasurement', 'Permission to create a measurement, given as wildcard for platform admins.');

-----------------------------------------------------------------------
--                              views                               ---
-----------------------------------------------------------------------
---------- helper procedures for  mapping table ---------

create or replace function is_valid_json(p_json text)
  returns boolean
as
$$
begin
  return (p_json::json is NOT null);
exception 
  when others then
     return false;  
end;
$$
language plpgsql;

create or replace function isnumeric(string text) returns bool AS $$
begin
  perform string::numeric;
  return true;
exception
when invalid_text_representation then
  return false;
end;
$$ language plpgsql;


 create or replace function isbool(string text) returns bool AS $$
begin
  perform string::boolean;
  return true;
exception
when invalid_text_representation then
  return false;
end;
$$ language plpgsql;

-------------- mapping FROM device to measurement ---------------------

CREATE materialized VIEW public.project_device_measurement_mapping
AS 
  SELECT 
    id AS device_id,
    measurement
  FROM project_device,
  lateral 
  (SELECT fin.value AS measurement
    FROM jsonb_array_elements(data->'chartOptions') AS nested_data, jsonb_each_text(nested_data) AS fin 
    WHERE data->>'type' = 'chart' AND fin.key = 'var' 
    union 
    SELECT value AS measurement
    FROM jsonb_each_text(data->'mappings') 
    WHERE data->>'type' != 'chart'
    ) val
  WHERE measurement != ''
UNION 
  SELECT distinct device_id, measurement FROM (
    SELECT 
      id AS device_id, 
      unnest(string_to_array(REGEXP_REPLACE(data->'chartOptions'->0->'calculation'->>'expression', 
        '(abs\()|(square\()|(cbrt\()|(cube\()|(sqrt\()|(pow\()|(ceil\()|(round\()|(floor\()|(fix\()|(exp\()|(log\()|(log2\()|(log10\()|(sign\()|(sin\()|(cos\()|(tan\()|\)|\+|\-|\*|\-',
        '',  'g'), ' ')) AS measurement 
    FROM project_device pd 
    WHERE jsonb_exists(data,'chartOptions')
    ) subquery
  WHERE trim(measurement) <> ''
UNION
  SELECT 
    id AS device_id,
    measurement
  FROM models,
  lateral
    (SELECT value AS measurement 
    FROM (SELECT cast(value AS jsonb) AS val 
          FROM (SELECT cast(value AS jsonb)->'components' AS val
                FROM jsonb_each_text(r->'data'->'meta'->'controllerMappings') 
                WHERE is_valid_json(value) = true 
                AND isnumeric(value) = false
                ) tmp, 
              jsonb_each_text(tmp.val)
            ) tmp2, 
      jsonb_each_text(tmp2.val)
    WHERE key NOT IN ('name', 'title','timezone', 'type') 
    AND isnumeric(value) = false 
    AND is_valid_json(value) = false
        ) internal
  WHERE measurement != ''
UNION
  SELECT 
    id AS device_id,
    measurement
  FROM models, 
  lateral 
  (
  SELECT fin.value AS measurement
    FROM jsonb_array_elements(r->'data'->'chartOptions') AS nested_data, jsonb_each_text(nested_data) AS fin 
    WHERE fin.key = 'var' 
    AND (r->'data'->>'type' = 'HistoryAnomalyDetection' OR r->'data'->>'type' = 'StreamAnomalyDetection')
  ) sub
UNION
  SELECT 
    id AS device_id, 
    value AS measurement 
  FROM models, 
  lateral 
    (SELECT value
    FROM jsonb_each_text(r->'data'->'meta'->'controllerMappings') 
    WHERE isnumeric(value) = false 
    AND is_valid_json(value) = false) tmp
  WHERE value != ''
UNION
	SELECT
	  id,
	  measurement
	FROM models,
  lateral
    (SELECT value AS measurement 
    FROM (SELECT cast(value AS jsonb) AS val 
                FROM jsonb_each_text(r->'data'->'meta'->'controllerMappings') 
                WHERE is_valid_json(value) = true 
                AND isnumeric(value) = false) tmp, 
                jsonb_each_text(tmp.val)
        ) internal
  WHERE measurement != '' 
  AND is_valid_json(measurement) = false 
  AND isnumeric(measurement) = false
union 
	SELECT
	  id,
	  measurement
  FROM models,
	  lateral
	  (SELECT value AS measurement
	  FROM (select cast(value AS jsonb) AS val
		  FROM (SELECT cast(value AS jsonb) AS val  
		    	FROM 
	    		 (SELECT cast(value AS jsonb) AS val 
		          FROM (SELECT cast(value AS jsonb)->'components' AS val
		                FROM jsonb_each_text(r->'data'->'meta'->'controllerMappings') 
		                WHERE is_valid_json(value) = true) 
		                tmp, jsonb_each_text(tmp.val)
		           ) tmp2,jsonb_each_text(tmp2.val)
		        	WHERE is_valid_json(value) = true 
              AND isnumeric(value) = false 
              AND isbool(value) = false 
              AND value::text <>'{}') 
	        	tmp3,jsonb_each_text(tmp3.val)
	        	WHERE is_valid_json(value) = true
	        	)
		       tmp4, jsonb_each_text(tmp4.val)
	       
	        WHERE key NOT IN ('name', 'title','timezone', 'type')
	        AND isnumeric(value) = false 
          AND is_valid_json(value) = false
	        ) internal
  WHERE measurement != '';

---------------- index may not bring much of an improvement -----------------

-- CREATE INDEX project_device_measurement_mapping_measurement
-- ON public.project_device_measurement_mapping (measurement);

-- CREATE INDEX project_device_measurement_mapping_device
-- ON public.project_device_measurement_mapping (device_id);


REFRESH MATERIALIZED VIEW public.project_device_measurement_mapping;

CREATE OR REPLACE FUNCTION refresh_project_device_measurement_mapping()
  RETURNS TRIGGER LANGUAGE plpgsql
  AS $$
  BEGIN
  REFRESH MATERIALIZED VIEW public.project_device_measurement_mapping;
  RETURN NULL;
END $$;

CREATE TRIGGER refresh_project_device_measurement_mapping_devices
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE
ON project_device
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_project_device_measurement_mapping();

CREATE TRIGGER refresh_project_device_measurement_mapping_models
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE
ON models
FOR EACH STATEMENT
EXECUTE PROCEDURE refresh_project_device_measurement_mapping();


-----------------     permission (both FROM group & additional -------------------

CREATE OR replace view public.project_permissions_for_user as
    SELECT * FROM (
        SELECT 	project_permissions.project_id AS project_id,project_permissions.user_id AS user_id, 
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
        JOIN public.permission r                             			on r.id = project_permissions.permission_id
        JOIN public.permission_scope scope                             	on scope.id = project_permissions.scope_id) added
    union
    SELECT * FROM (
        SELECT 	project_user.project_id AS project_id, 
                u.id AS user_id, r.id AS permission_id, 
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
        JOIN public.project_user_role project_user      on project_user.user_id = u.id
        JOIN public."role" "role"                       on "role".id =  project_user.role_id 
        JOIN public.role_permission_group role_permission_group   on role_permission_group.role_id = "role".id
        JOIN public.permission_group rg                      on rg.id = role_permission_group.permission_group_id
        JOIN public.permission_group_permissions rgrs             on rgrs.permission_group_id =  rg.id
        JOIN public.permission_scope s                  		on s.id = rgrs.scope_id
        JOIN public.permission r                         	on r.id = rgrs.permission_id) grouped;;

----------------         platform permissions            ------------------------

CREATE OR replace view public.general_permissions_for_user as
SELECT 
	user_role.user_id, 
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
JOIN public."role" "role"                       on "role".id =  user_role.role_id 
JOIN public.role_permission_group role_permission_group   on role_permission_group.role_id = "role".id
JOIN public.permission_group rg                      on rg.id = role_permission_group.permission_group_id
JOIN public.permission_group_permissions rgrs             on rgrs.permission_group_id =  rg.id
JOIN public.permission_scope s                  		on s.id = rgrs.scope_id
JOIN public.permission r                         	on r.id = rgrs.permission_id
;


-------------------        all permissions for user   -----------------

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

-----------------------------------------------------------------------
--                           procedures                             ---
-----------------------------------------------------------------------

---------- procedure to create a project permission for user ---------

CREATE OR replace PROCEDURE create_user_project_permission(
	userid varchar, 
	project varchar, 
	permissionid varchar,
	wildcard bool default false,  
	scope_value varchar default NULL)
LANGUAGE plpgsql
AS $$
DECLARE
  scope_id UUID := gen_random_UUID();
 	scope_key varchar;
  
begin

	SELECT scope_column into scope_key FROM public."permission" WHERE id = permissionid;

  IF NOT (SELECT can_be_added FROM public."permission" WHERE id = permissionid) then 
    RAISE NOTICE 'Permission can NOT be added';
  end if;

    IF (wildcard = false AND exists (select * 
  FROM public.project_permissions_for_user pfu
  WHERE pfu.project_id = cast(project AS uuid)
  AND pfu.user_id = cast(userid AS uuid)
  AND pfu.permission_id = permissionid
  AND ((pfu.device_id = cast(scope_value AS uuid))
    or (pfu.member_id = cast(scope_value AS uuid))
    or (pfu.document_id = cast(scope_value AS uuid))
    or (pfu.rule_id = cast(scope_value AS uuid))
    or (pfu.invoice_id = cast(scope_value AS uuid))
    or (pfu.report_id = cast(scope_value AS uuid))
    or (pfu.model_id = cast( scope_value AS uuid))
    or (pfu.collection_id = cast( scope_value AS uuid)))
    )) or exists (select * 
  FROM public.project_permissions_for_user pfu
  WHERE pfu.project_id = cast(project AS uuid)
  AND pfu.user_id = cast(userid AS uuid)
  AND pfu.permission_id = permissionid AND pfu.wildcard is true)
  then 
    return;
  end if;


	-- general insert
	INSERT INTO public.permission_scope (id,wildcard)
        VALUES (scope_id,wildcard);
    
  -- insert foreign key
  IF wildcard = false AND scope_key IS NOT NULL
  THEN       
    EXECUTE format('UPDATE public.permission_scope SET %s = CAST($1 AS UUID) WHERE id = $2', scope_key)
    USING scope_value, scope_id;
  end if;
  
  INSERT INTO public.additional_project_permissions (project_id, user_id, permission_id, scope_id) 
  VALUES (CAST(project AS UUID), CAST(userid AS UUID), permissionid, scope_id);

  EXCEPTION
    WHEN OTHERS THEN
        -- Rollback the transaction  if an error occurred
        ROLLBACK;
        RAISE; -- Raise the exception again to propagate it
end;
$$;
---------- wild card permission scopes + mapping to group ---------

CREATE OR replace PROCEDURE create_permission_group_permission(permission_group varchar, newRight varchar)
LANGUAGE plpgsql
AS $$
DECLARE
  scope_id UUID := gen_random_UUID();
begin
INSERT INTO public.permission_scope VALUES (scope_id, true);
INSERT INTO permission_group_permissions VALUES (permission_group, newRight, scope_id);
end;
$$;



--------------    list possible scopes ------------------------

   
CREATE OR REPLACE FUNCTION list_possible_scopes(permission_id text, project_id uuid)
  RETURNS TABLE (
    id uuid,
    name varchar
  )
AS $$
DECLARE
  referenced_table_name text;
 	refrenced_column_name text;
begin
	SELECT scope_column into refrenced_column_name
	FROM public."permission"
	WHERE "permission".id = permission_id;

  SELECT confrelid::regclass::text INTO referenced_table_name
  FROM pg_constraint c
  JOIN pg_attribute a ON a.attnum = ANY(c.conkey) AND a.attrelid = c.conrelid
  JOIN pg_attribute b ON b.attnum = ANY(c.confkey) AND b.attrelid = c.confrelid
  WHERE c.contype = 'f'
      AND a.attname = refrenced_column_name AND conrelid::regclass::text = 'permission_scope';


  IF referenced_table_name = 'models' THEN
    RETURN QUERY EXECUTE format('
      SELECT id, cast(r->>''name'' AS varchar) AS name
      FROM %I
	WHERE cast(r->>''project_id'' AS uuid) = $1',	
      referenced_table_name
    ) using project_id;
  ELSE
    RETURN QUERY EXECUTE format('
      SELECT id, name
      FROM %I
		WHERE project_id = $1',	
      referenced_table_name
    ) using project_id;
  END IF;

END;
$$ LANGUAGE plpgsql;


------------------------ restrictedUserGroup ------------------------------


call create_permission_group_permission('restrictedUserGroup', 'readProject'); -- ? readProject should be * 
-- call create_permission_group_permission('restrictedUserGroup', 'readAsSETs'); ???
call create_permission_group_permission('restrictedUserGroup', 'listMember');
call create_permission_group_permission('restrictedUserGroup', 'listDocument');
call create_permission_group_permission('restrictedUserGroup', 'listDevice');
call create_permission_group_permission('restrictedUserGroup', 'listCollection');
call create_permission_group_permission('restrictedUserGroup', 'listReport');
call create_permission_group_permission('restrictedUserGroup', 'listRule');
call create_permission_group_permission('restrictedUserGroup', 'listAI');
call create_permission_group_permission('restrictedUserGroup', 'readAIWeather');

------------------------ projectUserGroup ------------------------------

call create_permission_group_permission('projectUserGroup', 'readDevice');
call create_permission_group_permission('projectUserGroup', 'listAlert');
call create_permission_group_permission('projectUserGroup', 'readMember');
call create_permission_group_permission('projectUserGroup', 'readDocument');
call create_permission_group_permission('projectUserGroup', 'readAlert');
call create_permission_group_permission('projectUserGroup', 'readRule');
call create_permission_group_permission('projectUserGroup', 'readReport');
call create_permission_group_permission('projectUserGroup', 'readAI');


------------------------ projectAdminGroup ------------------------------

call create_permission_group_permission('projectAdminGroup', 'writeProject');
call create_permission_group_permission('projectAdminGroup', 'createCollection');
call create_permission_group_permission('projectAdminGroup', 'writeCollection');
call create_permission_group_permission('projectAdminGroup', 'deleteCollection');
call create_permission_group_permission('projectAdminGroup', 'createDevice');
call create_permission_group_permission('projectAdminGroup', 'writeDevice');
call create_permission_group_permission('projectAdminGroup', 'deleteDevice');
call create_permission_group_permission('projectAdminGroup', 'createMember');
call create_permission_group_permission('projectAdminGroup', 'deleteMember');
call create_permission_group_permission('projectAdminGroup', 'writeMember');
call create_permission_group_permission('projectAdminGroup', 'createDocument');
call create_permission_group_permission('projectAdminGroup', 'deleteDocument');
call create_permission_group_permission('projectAdminGroup', 'writeAlert');
call create_permission_group_permission('projectAdminGroup', 'createRule');
call create_permission_group_permission('projectAdminGroup', 'deleteRule');
call create_permission_group_permission('projectAdminGroup', 'writeRule');
call create_permission_group_permission('projectAdminGroup', 'createReport');
call create_permission_group_permission('projectAdminGroup', 'writeReport');
call create_permission_group_permission('projectAdminGroup', 'deleteReport');
call create_permission_group_permission('projectAdminGroup', 'createAI');
call create_permission_group_permission('projectAdminGroup', 'writeAI');
call create_permission_group_permission('projectAdminGroup', 'deleteAI');
call create_permission_group_permission('projectAdminGroup', 'createAIWeather');
call create_permission_group_permission('projectAdminGroup', 'deleteAIWeather');
call create_permission_group_permission('projectAdminGroup', 'readMQTTSecret');


--------------------------------------------------------------------
--                          platform groups                       --
--------------------------------------------------------------------

------------------------ serviceUserGroup ------------------------------

-- call create_permission_group_permission('serviceUserGroup', 'createMeasurement');
call create_permission_group_permission('serviceUserGroup', 'createNotification');
call create_permission_group_permission('serviceUserGroup', 'readMetric');

------------------------ regularUserGroup ------------------------------

call create_permission_group_permission('regularUserGroup', 'readSwagger');
call create_permission_group_permission('regularUserGroup', 'readUser');
call create_permission_group_permission('regularUserGroup', 'createAsset');
call create_permission_group_permission('regularUserGroup', 'readAssets');
call create_permission_group_permission('regularUserGroup', 'readWeather');
call create_permission_group_permission('regularUserGroup', 'readIcon');
call create_permission_group_permission('regularUserGroup', 'listProject'); -- everyone can listProject * because list only returns own projects
call create_permission_group_permission('regularUserGroup', 'readPermission');

------------------------ adminUserGroup ------------------------------

call create_permission_group_permission('adminUserGroup', 'createProject');
call create_permission_group_permission('adminUserGroup', 'deleteProject');
call create_permission_group_permission('adminUserGroup', 'createMeasurement');

-----------------------------------------------------------------------
--                            migration                             ---
-----------------------------------------------------------------------

INSERT INTO public."user"  (SELECT DISTINCT user_id FROM public.project_user);

INSERT INTO public.project_user_role SELECT project_id, user_id, 'projectAdmin',  p.realm 
FROM public.project_user pu
JOIN project p ON pu.project_id = p.id  WHERE is_admin = true;

INSERT INTO public.project_user_role SELECT  project_id, user_id, 'projectUser', p.realm 
FROM public.project_user pu
JOIN project p ON pu.project_id = p.id  WHERE is_admin = false;


INSERT INTO public.user_role SELECT DISTINCT user_id, 'regularUser', p.realm 
FROM public.project_user pu
JOIN project p ON pu.project_id = p.id;
