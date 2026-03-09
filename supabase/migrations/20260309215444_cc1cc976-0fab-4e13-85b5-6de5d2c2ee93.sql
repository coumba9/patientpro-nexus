SELECT cron.schedule(
  'process-reminders-every-minute',
  '* * * * *',
  $$
  SELECT net.http_post(
    url := 'https://diieheagpzlqatqpzjua.supabase.co/functions/v1/process-reminders',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpaWVoZWFncHpscWF0cXB6anVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjYxNjAsImV4cCI6MjA2MjEwMjE2MH0._kaKTqG0RIs3DZCQ9GxYNSpdBS9P78L8O_RZOzwKwbU"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);