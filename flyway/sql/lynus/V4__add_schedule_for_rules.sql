-- add the column schedule to the table project

ALTER TABLE project_rule
    ADD schedule JSONB NOT NULL DEFAULT '[]';
