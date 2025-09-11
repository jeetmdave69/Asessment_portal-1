-- Create function to get user by Clerk ID
CREATE OR REPLACE FUNCTION get_user_by_clerk_id(p_clerk_id TEXT)
RETURNS SETOF users AS $$
BEGIN
  RETURN QUERY SELECT * FROM users WHERE id::text = p_clerk_id;
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_by_clerk_id(TEXT) TO authenticated;
