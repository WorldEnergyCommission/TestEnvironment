-- add calc month interval function based on timezones for interpolated average/interval queries

CREATE OR REPLACE FUNCTION calc_month_interval(day timestamptz, tz text) RETURNS INTERVAL as $$
SELECT ($1 at time zone $2) + interval '1 month' - ($1 at time zone $2) $$ LANGUAGE SQL IMMUTABLE PARALLEL SAFE;