
-- Disable the auto-outbound-caller (every 15 min)
SELECT cron.unschedule('auto-outbound-caller');

-- Disable continuous lead discovery (every 30 min)
SELECT cron.unschedule('continuous-lead-discovery');

-- Disable outbound drip emails (every 6 hours)
SELECT cron.unschedule('outbound-drip-emails');
