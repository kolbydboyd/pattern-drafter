-- Add retry_count to pinterest_pins for automatic retry on IFTTT failures.
-- Pins with retry_count < 3 and ifttt_status = 'retry' will be re-attempted
-- on the next cron run. After 3 failures, status moves to 'error'.

alter table pinterest_pins
  add column if not exists retry_count integer not null default 0;
