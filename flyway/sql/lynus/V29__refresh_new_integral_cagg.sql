CALL refresh_continuous_aggregate('public.measurements_daily_integral', 
								INTERVAL '7 days',
								INTERVAL '15 minutes');