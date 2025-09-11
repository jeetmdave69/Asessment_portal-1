-- Test if the get_user_by_clerk_id function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name = 'get_user_by_clerk_id';

-- If the function doesn't exist, create it
CREATE OR REPLACE FUNCTION get_user_by_clerk_id(p_clerk_id TEXT)
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY SELECT * FROM users WHERE id::text = p_clerk_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_by_clerk_id(TEXT) TO authenticated;

-- Test the function with a sample Clerk ID
-- SELECT * FROM get_user_by_clerk_id('user_2y7ihSrD7ZiyfnavQJoEo6pggdq');
