CREATE TABLE public."models" (
	id uuid NOT null PRIMARY KEY,
	r jsonb NULL
);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_database WHERE datname = 'mpc') THEN
        INSERT INTO public."models" SELECT id, r FROM dblink('dbname=mpc user=' || current_user,
        'SELECT id, r FROM public.models') as t(id uuid, r jsonb);
    END IF;
END $$;

CREATE TABLE public.stations (
	project_id uuid NOT null REFERENCES public.project(id) ON DELETE CASCADE,
	site_id int4 NOT NULL,
	project_longitude float8 NOT NULL,
	project_latitude float8 NOT NULL,
	site_longitude float8 NOT NULL,
	site_latitude float8 NOT NULL,
	username uuid NOT NULL,
	"password" uuid NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now()
);

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_database WHERE datname = 'mpc') THEN
        INSERT INTO public.stations
        SELECT * FROM dblink('dbname=mpc user=' || current_user,
        'SELECT * FROM public.stations') as t(project_id uuid, site_id int4, project_longitude float8,
        project_latitude float8, site_longitude float8, site_latitude float8, username uuid,
        "password" uuid, created_at timestamptz);
    END IF;
END $$;
