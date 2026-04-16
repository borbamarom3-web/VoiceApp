
/*
  # Auto-assign admin role to email-registered users

  ## Summary
  Creates a trigger that automatically adds any user who registers with 
  an email address to the admin_users table. Anonymous auth users (students)
  do not have emails and are therefore not granted admin access.

  ## Logic
  - Email signup = school staff / admin
  - Anonymous signup = student
*/

CREATE OR REPLACE FUNCTION handle_new_user_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.email IS NOT NULL AND NEW.email != '' THEN
    INSERT INTO public.admin_users (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_admin ON auth.users;

CREATE TRIGGER on_auth_user_created_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user_admin();
