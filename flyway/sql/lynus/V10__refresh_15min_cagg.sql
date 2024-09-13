CALL refresh_continuous_aggregate('public.measurements_15_min', 
								INTERVAL '5 years',
								INTERVAL '15 minutes');