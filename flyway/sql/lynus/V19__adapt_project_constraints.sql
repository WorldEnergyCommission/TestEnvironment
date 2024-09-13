--- REPORT
ALTER TABLE public.project_report DROP CONSTRAINT project_report_project_id_fkey;
ALTER TABLE public.project_report ADD CONSTRAINT project_report_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project(id) ON DELETE CASCADE;

--- RULE
ALTER TABLE public.project_rule DROP CONSTRAINT project_rule_project_id_fkey;
ALTER TABLE public.project_rule ADD CONSTRAINT project_rule_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project(id) ON DELETE CASCADE;

--- ALERT
ALTER TABLE public.project_alert DROP CONSTRAINT project_alert_project_id_fkey;
ALTER TABLE public.project_alert ADD CONSTRAINT project_alert_project_id_fkey FOREIGN KEY (project_id) REFERENCES public.project(id) ON DELETE CASCADE;

--- FK on project_user_role for role
ALTER TABLE public.project_user_role DROP CONSTRAINT project_user_role_role_id_fkey;
ALTER TABLE public.project_user_role ADD CONSTRAINT project_user_role_role_id_fkey FOREIGN KEY (role_id) REFERENCES public."role"(id) ON DELETE CASCADE;

--- ASSET constraint for user
ALTER TABLE public.asset ADD CONSTRAINT asset_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

--- Favorite constraint for user
ALTER TABLE public.project_favorite ADD CONSTRAINT project_favorite_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

--- INVITE constraint for user
ALTER TABLE public.project_invite ADD CONSTRAINT project_invite_user_id_fkey FOREIGN KEY (created_by) REFERENCES public."user"(id) ON DELETE CASCADE;

--- INVOICE constraint for user
ALTER TABLE public.invoice ADD CONSTRAINT project_invite_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

--- measurements meta constraint for user
ALTER TABLE public.measurements_meta ADD CONSTRAINT measurements_meta_project_id_fkey FOREIGN KEY (project) REFERENCES public.project(id) ON DELETE CASCADE;

--- Drop project_user
DROP TABLE public.project_user;


--- Drop super user
DROP TABLE public.superuser;