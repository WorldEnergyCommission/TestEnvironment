-- add the column created_manually to the table project_rule

ALTER TABLE project_rule
    ADD created_manually BOOLEAN NOT NULL DEFAULT TRUE;
