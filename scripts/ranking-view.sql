CREATE MATERIALIZED VIEW ranking AS
SELECT public.analytics_user_listened_tracks.user_id,
       COALESCE(SUM(public.analytics_track_info.duration_in_ms *
                    public.analytics_user_listened_tracks.listened), 0)           AS listened_in_ms,
       (ROW_NUMBER()
           OVER (ORDER BY SUM(public.analytics_track_info.duration_in_ms *
                           public.analytics_user_listened_tracks.listened) DESC)) AS position
FROM public.analytics_user_listened_tracks
    LEFT JOIN public.analytics_track_info
ON public.analytics_user_listened_tracks.track_id = public.analytics_track_info.id
GROUP BY public.analytics_user_listened_tracks.user_id
ORDER BY listened_in_ms DESC;
