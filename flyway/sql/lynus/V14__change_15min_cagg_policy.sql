-- remove old policy
SELECT remove_continuous_aggregate_policy('public.measurements_15_min');

-- create new policy that only starts six hours in the past
SELECT add_continuous_aggregate_policy('public.measurements_15_min',
                                       start_offset =>  INTERVAL '6 hours',
                                       end_offset => INTERVAL '1 minute',
                                       schedule_interval => INTERVAL '1 minute',
                                       initial_start=> now());
