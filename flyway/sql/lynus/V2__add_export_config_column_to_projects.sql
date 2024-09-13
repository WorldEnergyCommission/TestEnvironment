-- add the column export config to the table project

ALTER TABLE project
    ADD export_config JSONB NOT NULL DEFAULT '{}';
