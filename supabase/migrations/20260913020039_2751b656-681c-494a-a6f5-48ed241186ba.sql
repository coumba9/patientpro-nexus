CREATE OR REPLACE FUNCTION public.get_search_availability(p_doctor_ids uuid[], p_start date, p_end date)
RETURNS TABLE(doctor_id uuid, slot_date date, slot_time text, reason_id uuid, duration_minutes integer, location_id uuid, teleconsultation boolean)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
 IF cardinality(p_doctor_ids) > 100 OR p_end < p_start OR p_end - p_start > 31 THEN RAISE EXCEPTION 'Invalid availability range'; END IF;
 RETURN QUERY
 WITH days AS (SELECT d::date AS day FROM generate_series(greatest(p_start, (now() AT TIME ZONE 'Africa/Dakar')::date)::timestamp, p_end::timestamp, interval '1 day') d),
 candidates AS (
 SELECT s.doctor_id, days.day, t.ts, r.id rid, coalesce(r.duration_minutes,30) duration, s.location_id lid, coalesce(r.allows_teleconsultation,false) tele
 FROM public.doctor_availability_slots s
 JOIN public.doctors doc ON doc.id=s.doctor_id AND doc.is_verified=true
 CROSS JOIN days
 LEFT JOIN public.consultation_reasons r ON r.doctor_id=s.doctor_id AND r.is_active
 CROSS JOIN LATERAL generate_series(days.day+s.start_time, days.day+s.end_time-make_interval(mins=>greatest(coalesce(r.duration_minutes,30),1)), make_interval(mins=>greatest(coalesce(r.duration_minutes,30),1))) t(ts)
 WHERE s.doctor_id=ANY(p_doctor_ids)
 AND s.day=(ARRAY['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'])[extract(dow FROM days.day)::int+1]
 AND (s.location_id IS NULL OR EXISTS(SELECT 1 FROM public.practice_locations l WHERE l.id=s.location_id AND l.is_active))
 AND t.ts > now() AT TIME ZONE 'Africa/Dakar'
 )
 SELECT DISTINCT c.doctor_id,c.day,to_char(c.ts,'HH24:MI'),c.rid,c.duration,c.lid,c.tele
 FROM candidates c
 WHERE NOT EXISTS(SELECT 1 FROM public.doctor_unavailability_periods u WHERE u.doctor_id=c.doctor_id AND c.day BETWEEN u.start_date AND u.end_date AND (u.is_full_day OR (c.ts < c.day+u.end_time AND c.ts+make_interval(mins=>c.duration)>c.day+u.start_time)))
 AND NOT EXISTS(SELECT 1 FROM public.appointments a WHERE a.doctor_id=c.doctor_id AND a.status <> 'cancelled' AND ((a.date=c.day AND c.ts < a.date+a.time+make_interval(mins=>coalesce(a.duration_minutes,30)) AND c.ts+make_interval(mins=>c.duration)>a.date+a.time) OR (a.status='pending_reschedule' AND a.previous_date=c.day AND c.ts<a.previous_date+a.previous_time+make_interval(mins=>coalesce(a.duration_minutes,30)) AND c.ts+make_interval(mins=>c.duration)>a.previous_date+a.previous_time)))
 AND (SELECT count(*) FROM public.appointments a WHERE a.doctor_id=c.doctor_id AND a.date=c.day AND a.status<>'cancelled')<20
 ORDER BY 1,2,3;
END;
$$;
REVOKE ALL ON FUNCTION public.get_search_availability(uuid[],date,date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_search_availability(uuid[],date,date) TO authenticated;