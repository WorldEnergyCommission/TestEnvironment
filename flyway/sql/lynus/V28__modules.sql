DROP Table public.device_property_mapping;
DROP TABLE public.project_aggregation_device CASCADE;
DROP TABLE public.device_type_properties;
DROP TABLE public.device_types;

-- Recreate Aggregation Devices as Data mappings
CREATE TABLE public.data_mapping_types (
    id              uuid            NOT NULL PRIMARY key DEFAULT gen_random_UUID(),
    "name"          text            NOT NULL,
    "description"   varchar(250)    NOT NULL
);

--- create new data_mapping_property_category table to store category for each data_mapping property
--- this way modules can determine which catergory they need (making)
CREATE TABLE public.data_mapping_property_category (
	"name" varchar NOT null PRIMARY KEY
);

INSERT INTO public.data_mapping_property_category ("name") VALUES ('View');
insert into public.data_mapping_property_category ("name") values ('AdditionalView');
INSERT INTO public.data_mapping_property_category ("name") VALUES ('Control');
insert into public.data_mapping_property_category ("name") values ('AdditionalControl');


CREATE TABLE public.data_mapping_type_properties (
    id          uuid    NOT NULL PRIMARY key    DEFAULT gen_random_UUID(),
    type_id     uuid    NOT NULL REFERENCES public.data_mapping_types(id) ON DELETE CASCADE,
    "group"     varchar NOT null default 'AdditionalView' REFERENCES public.data_mapping_property_category("name") ON DELETE CASCADE,
    optional    boolean NOT NULL                DEFAULT true,
    unit        varchar(10) NULL
);

ALTER TABLE public.data_mapping_type_properties ADD "name" text NULL;

CREATE TABLE public.project_data_mapping (
    id              uuid        NOT NULL PRIMARY key    DEFAULT gen_random_UUID(),
    "name"          varchar(50) NOT NULL,
    project_id      uuid        NOT NULL REFERENCES public.project(id)            ON DELETE CASCADE,
    created_at      timestamptz NOT NULL                DEFAULT now(),
    type_id         uuid        NOT NULL REFERENCES public.data_mapping_types(id) ON DELETE CASCADE
);

CREATE TABLE public.data_mapping_property_mapping (
    data_mapping_id     uuid NOT NULL REFERENCES public.project_data_mapping(id)                    ON DELETE CASCADE,
    property_id         uuid NOT NULL REFERENCES public.data_mapping_type_properties(id)            ON DELETE CASCADE,
    variable            text     NULL
);


CREATE TABLE public.module_types (
    id         uuid    NOT NULL PRIMARY key DEFAULT gen_random_UUID(),
    description     varchar     NULL,
    frontend_type   varchar NULL,
    "name"          varchar     NULL
);

CREATE TABLE public.module_type_data_mappings (
    id                      uuid    NOT NULL PRIMARY key    DEFAULT gen_random_UUID(),
    "name"                  text    NOT NULL,
    "description"           text        NULL,
    module_type_id          uuid    NOT NULL REFERENCES public.module_types(id)                 ON DELETE CASCADE,
    data_mapping_type_id    uuid    NOT NULL REFERENCES public.data_mapping_types(id)           ON DELETE CASCADE,
    min_count               numeric NOT NULL default 0,
    max_count               numeric NOT NULL default 1
);

CREATE TABLE public.modules (
    id              uuid        NOT NULL PRIMARY key    DEFAULT gen_random_UUID(),
    "name"          varchar(50) NOT NULL,
    project_id      uuid        NOT NULL REFERENCES public.project(id)      ON DELETE CASCADE,
    created_at      timestamptz NOT NULL                DEFAULT now(),
    type_id         uuid        NOT NULL REFERENCES public.module_types(id) ON DELETE CASCADE
);

CREATE TABLE public.module_data_mapping_mapping (
   data_mapping_id          uuid NOT NULL REFERENCES public.project_data_mapping(id)            ON DELETE CASCADE,
   module_id                uuid NOT NULL REFERENCES public.modules(id)                         ON DELETE CASCADE,
   property_id              uuid NOT NULL REFERENCES public.module_type_data_mappings(id)       ON DELETE CASCADE
);

CREATE TABLE public.module_required_data_mapping_properties (
	module_type_data_mapping    uuid    NOT NULL REFERENCES public.module_type_data_mappings(id)            ON DELETE CASCADE,
	"group"                     varchar NOT NULL REFERENCES public.data_mapping_property_category("name")   ON DELETE CASCADE
);

CREATE VIEW public.variable_mapping as
SELECT 
    props.data_mapping_id,
    props.property_id,
    props.variable,
    mods.id as module_id
FROM public.data_mapping_property_mapping props
    JOIN public.module_data_mapping_mapping mapping on props.data_mapping_id = mapping.data_mapping_id
    JOIN public.modules mods on mapping.module_id = mods.id
;

CREATE TABLE public.project_collection_module_mapping (
    module_id       uuid        NOT NULL REFERENCES public.modules(id)                  ON DELETE CASCADE,
    project_id      uuid        NOT NULL REFERENCES public.project(id)                  ON DELETE CASCADE,
    collection_id   uuid        NOT NULL REFERENCES public.project_collection(id)       ON DELETE CASCADE,
    position        jsonb       NULL
);

-------------- alter permission_scope table to include fk to modules -----------
ALTER TABLE public.permission_scope ADD module_id uuid NULL;
ALTER TABLE public.permission_scope ADD CONSTRAINT permission_scope_modules_id_fk
FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE CASCADE;

-------------- alter permission_scope table to include fk to agg devs -----------
ALTER TABLE public.permission_scope ADD data_mapping_id uuid NULL;
ALTER TABLE public.permission_scope ADD CONSTRAINT permission_scope_data_mapping_id_fk
FOREIGN KEY (data_mapping_id) REFERENCES public.project_data_mapping(id) ON DELETE CASCADE;


------------------- alter permissions views ------------------------

 -- added aggregation devices & module scope columns to public.general_permissions_for_user

CREATE OR REPLACE VIEW public.general_permissions_for_user
AS SELECT user_role.user_id,
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
    s.model_id,
    s.data_mapping_id,
    s.module_id 
   FROM user_role user_role
     JOIN role role ON role.id::text = user_role.role_id::text
     JOIN role_permission_group role_permission_group ON role_permission_group.role_id::text = role.id::text
     JOIN permission_group rg ON rg.id::text = role_permission_group.permission_group_id::text
     JOIN permission_group_permissions rgrs ON rgrs.permission_group_id::text = rg.id::text
     JOIN permission_scope s ON s.id = rgrs.scope_id
     JOIN permission r ON r.id::text = rgrs.permission_id::text;
     

 -- added aggregation devices & module scope columns to public.project_permissions_for_user


CREATE OR REPLACE VIEW public.project_permissions_for_user
AS SELECT added.project_id,
    added.user_id,
    added.permission_id,
    added.scope_id,
    added.wildcard,
    added.collection_id,
    added.device_id,
    added.member_id,
    added.document_id,
    added.rule_id,
    added.invoice_id,
    added.report_id,
    added.model_id,
    added.data_mapping_id,
    added.module_id
   FROM ( SELECT project_permissions.project_id,
            project_permissions.user_id,
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
            scope.model_id,
            scope.data_mapping_id,
            scope.module_id
           FROM additional_project_permissions project_permissions
             JOIN permission r ON r.id::text = project_permissions.permission_id::text
             JOIN permission_scope scope ON scope.id = project_permissions.scope_id) added
UNION
 SELECT grouped.project_id,
    grouped.user_id,
    grouped.permission_id,
    grouped.scope_id,
    grouped.wildcard,
    grouped.collection_id,
    grouped.device_id,
    grouped.member_id,
    grouped.document_id,
    grouped.rule_id,
    grouped.invoice_id,
    grouped.report_id,
    grouped.model_id,
    grouped.data_mapping_id,
    grouped.module_id
   FROM ( SELECT project_user.project_id,
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
            s.model_id,
            s.data_mapping_id,
            s.module_id
           FROM "user" u
             JOIN project_user_role project_user ON project_user.user_id = u.id
             JOIN role role ON role.id::text = project_user.role_id::text
             JOIN role_permission_group role_permission_group ON role_permission_group.role_id::text = role.id::text
             JOIN permission_group rg ON rg.id::text = role_permission_group.permission_group_id::text
             JOIN permission_group_permissions rgrs ON rgrs.permission_group_id::text = rg.id::text
             JOIN permission_scope s ON s.id = rgrs.scope_id
             JOIN permission r ON r.id::text = rgrs.permission_id::text) grouped;   
    
            
            
 -- added aggregation devices & module scope columns to public.permissions_for_user source

CREATE OR REPLACE VIEW public.permissions_for_user
AS SELECT pp.project_id,
    pp.user_id,
    pp.permission_id,
    pp.scope_id,
        CASE
            WHEN p."group"::text = 'project'::text THEN false
            ELSE pp.wildcard
        END AS wildcard,
    pp.collection_id,
    pp.device_id,
    pp.member_id,
    pp.document_id,
    pp.rule_id,
    pp.invoice_id,
    pp.report_id,
    pp.model_id,
    pp.data_mapping_id,
    pp.module_id
   FROM project_permissions_for_user pp
     JOIN permission p ON pp.permission_id::text = p.id::text
UNION
 SELECT NULL::uuid AS project_id,
    gp.user_id,
    gp.permission_id,
    gp.scope_id,
    gp.wildcard,
    gp.collection_id,
    gp.device_id,
    gp.member_id,
    gp.document_id,
    gp.rule_id,
    gp.invoice_id,
    gp.report_id,
    gp.model_id,
    gp.data_mapping_id,
    gp.module_id
   FROM general_permissions_for_user gp;


CREATE OR REPLACE VIEW public.measurements_mapping
AS 
    SELECT device_id, measurement
    FROM public.project_device_measurement_mapping
UNION
    SELECT module_id, variable
    FROM public.variable_mapping
UNION 
    SELECT data_mapping_id, variable
    FROM public.variable_mapping;


----- new materialized views with integrals for postive and negative data only

CREATE MATERIALIZED VIEW public.measurements_daily_integral
WITH (timescaledb.continuous) AS
SELECT  variable,
    TIME_BUCKET('1 day', time, 'Etc/UTC') AS bucket,
    INTEGRAL(TIME_WEIGHT('LOCF', time, CASE WHEN value > 0 THEN value ELSE 0 END), 'hour')  AS integral_positive,
    INTEGRAL(TIME_WEIGHT('LOCF', time, CASE WHEN value < 0 THEN value ELSE 0 END), 'hour')  AS integral_negative
FROM measurements
GROUP BY variable, bucket
WITH NO DATA;

SELECT add_continuous_aggregate_policy('public.measurements_daily_integral', 
                                        start_offset =>  INTERVAL '3 days',
                                        end_offset => INTERVAL '1 minute', 
                                        schedule_interval => INTERVAL '15 minutes',
                                        initial_start=> now());