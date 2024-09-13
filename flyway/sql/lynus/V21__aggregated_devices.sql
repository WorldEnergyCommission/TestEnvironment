CREATE TABLE public.device_types (
    id              uuid            NOT NULL PRIMARY key DEFAULT gen_random_UUID(),
    "name"          varchar(50)     NOT NULL,
    "description"   varchar(250)    NOT NULL
);
CREATE TABLE public.device_type_properties (
    id          text    NOT NULL PRIMARY key    DEFAULT gen_random_UUID(),
    type_id     uuid    NOT NULL REFERENCES public.device_types(id) ON DELETE CASCADE,
    optional    boolean NOT NULL                DEFAULT true,
    unit        varchar(10) NULL
);
CREATE TABLE public.project_aggregation_device (
    id              uuid        NOT NULL PRIMARY key    DEFAULT gen_random_UUID(),
    "name"          varchar(50) NOT NULL,
    project_id      uuid        NOT NULL REFERENCES public.project(id)      ON DELETE CASCADE,
    created_at      timestamptz NOT NULL                DEFAULT now(),
    type_id         uuid        NOT NULL REFERENCES public.device_types(id) ON DELETE CASCADE
);
CREATE TABLE public.device_property_mapping (
    device_id   uuid NOT NULL REFERENCES public.project_aggregation_device(id)   ON DELETE CASCADE,
    property_id text NOT NULL REFERENCES device_type_properties(id)             ON DELETE CASCADE,
    variable    text     NULL
)