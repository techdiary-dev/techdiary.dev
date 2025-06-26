-- Thanks claude 🥰 for the help with this function
-- Function to recursively fetch comments and their replies up to a certain level
-- This function retrieves comments for a given resource and organizes them in a nested structure
-- It uses recursion to fetch replies to comments, limiting the depth to 3 levels
-- Function: public.get_comments(p_resource_id uuid, p_resource_type character varying, p_parent_id uuid DEFAULT NULL::uuid, p_current_level integer DEFAULT 0)


CREATE OR REPLACE FUNCTION public.get_comments(
    p_resource_id uuid, 
    p_resource_type character varying, 
    p_parent_id uuid DEFAULT NULL::uuid, 
    p_current_level integer DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
AS $function$
DECLARE
    result JSON;
BEGIN
    -- Base case: get comments for the given parent
    IF p_parent_id IS NULL THEN
        -- Get root comments
        SELECT json_agg(
            json_build_object(
                'id', c.id,
                'body', c.body,
                'level', 0,
                'created_at', c.created_at,
                'parent_id', NULL,
                'author', json_build_object(
                    'id', u.id,
                    'name', u.name,
                    'email', u.email,
                    'username', u.username
                ),
                'replies', get_comments(p_resource_id, p_resource_type, c.id, 1)
            ) ORDER BY c.created_at DESC  -- Changed to DESC
        ) INTO result
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.resource_id = p_resource_id 
          AND c.resource_type = p_resource_type;
    ELSE
        -- Get replies to a specific comment
        IF p_current_level >= 3 THEN
            -- Stop recursion at level 3
            RETURN '[]'::json;
        END IF;
        
        SELECT json_agg(
            json_build_object(
                'id', c.id,
                'body', c.body,
                'level', p_current_level,
                'created_at', c.created_at,
                'parent_id', p_parent_id,
                'author', json_build_object(
                    'id', u.id,
                    'name', u.name,
                    'email', u.email,
                    'username', u.username
                ),
                'replies', get_comments(p_resource_id, p_resource_type, c.id, p_current_level + 1)
            ) ORDER BY c.created_at DESC  -- Changed to DESC
        ) INTO result
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.resource_id = p_parent_id 
          AND c.resource_type = 'COMMENT';
    END IF;
    
    RETURN COALESCE(result, '[]'::json);
END;
$function$