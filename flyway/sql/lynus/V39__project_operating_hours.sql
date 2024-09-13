CREATE TABLE public.project_operating_hours (
    project_id uuid NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid NULL,
    payload jsonb NULL,
    CONSTRAINT project_operating_hours_fk FOREIGN KEY (project_id) REFERENCES public.project(id) ON DELETE CASCADE
);