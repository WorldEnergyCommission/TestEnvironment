CREATE TABLE public.project_holidays (
    project_id uuid NOT NULL,
    created_at timestamptz NOT NULL,
    created_by uuid NULL,
    payload jsonb NULL,
    CONSTRAINT project_holidays FOREIGN KEY (project_id) REFERENCES public.project(id) ON DELETE CASCADE
);