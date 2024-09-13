ALTER TABLE public.project_user_role DROP CONSTRAINT project_role_pk;
ALTER TABLE public.project_user_role ADD CONSTRAINT project_role_pk PRIMARY KEY (realm, project_id, user_id);
