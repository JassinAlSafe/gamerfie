-- Function to calculate challenge status based on dates
CREATE OR REPLACE FUNCTION calculate_challenge_status(
    p_start_date TIMESTAMPTZ,
    p_end_date TIMESTAMPTZ
) RETURNS text AS $$
BEGIN
    IF NOW() < p_start_date THEN
        RETURN 'upcoming';
    ELSIF NOW() >= p_start_date AND NOW() <= p_end_date THEN
        RETURN 'active';
    ELSE
        RETURN 'completed';
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update challenge status
CREATE OR REPLACE FUNCTION update_challenge_status()
RETURNS trigger AS $$
BEGIN
    NEW.status := calculate_challenge_status(NEW.start_date, NEW.end_date);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_challenge_status_trigger ON challenges;

-- Create trigger to automatically update status
CREATE TRIGGER update_challenge_status_trigger
    BEFORE INSERT OR UPDATE ON challenges
    FOR EACH ROW
    EXECUTE FUNCTION update_challenge_status();

-- Update all existing challenges
UPDATE challenges
SET status = calculate_challenge_status(start_date, end_date);

-- Create a function to periodically update challenge statuses
CREATE OR REPLACE FUNCTION update_all_challenge_statuses()
RETURNS void AS $$
BEGIN
    UPDATE challenges
    SET status = calculate_challenge_status(start_date, end_date)
    WHERE status != calculate_challenge_status(start_date, end_date);
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to update challenge statuses every hour
SELECT cron.schedule(
    'update-challenge-statuses',  -- job name
    '0 * * * *',                 -- every hour
    'SELECT update_all_challenge_statuses()'
); 