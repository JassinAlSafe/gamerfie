-- Create function to check if user exists without authentication
-- This is used for smart user detection during sign up/in

CREATE OR REPLACE FUNCTION check_user_exists(user_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    user_record auth.users%ROWTYPE;
    profile_record profiles%ROWTYPE;
    result jsonb;
BEGIN
    -- Check if user exists in auth.users
    SELECT * INTO user_record
    FROM auth.users
    WHERE email = user_email
    LIMIT 1;
    
    IF NOT FOUND THEN
        -- User doesn't exist
        RETURN jsonb_build_object(
            'exists', false,
            'hasProfile', false
        );
    END IF;
    
    -- User exists, check if they have a profile
    SELECT * INTO profile_record
    FROM profiles
    WHERE id = user_record.id
    LIMIT 1;
    
    -- Determine the provider (Google, email, etc.)
    DECLARE
        provider_name text := 'email';
        needs_verification boolean := false;
    BEGIN
        -- Check for Google provider
        IF user_record.raw_app_meta_data ? 'provider' THEN
            provider_name := user_record.raw_app_meta_data ->> 'provider';
        END IF;
        
        -- Check if email is verified
        IF user_record.email_confirmed_at IS NULL THEN
            needs_verification := true;
        END IF;
        
        RETURN jsonb_build_object(
            'exists', true,
            'hasProfile', FOUND,
            'provider', provider_name,
            'lastSignIn', user_record.last_sign_in_at,
            'needsEmailVerification', needs_verification
        );
    END;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION check_user_exists(text) TO authenticated;
GRANT EXECUTE ON FUNCTION check_user_exists(text) TO anon;