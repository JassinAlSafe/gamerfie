-- Function to get table relationships
CREATE OR REPLACE FUNCTION get_relationships()
RETURNS TABLE (
    constraint_name text,
    table_name text,
    column_name text,
    foreign_table_name text,
    foreign_column_name text
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        tc.constraint_name::text,
        tc.table_name::text,
        kcu.column_name::text,
        ccu.table_name::text AS foreign_table_name,
        ccu.column_name::text AS foreign_column_name
    FROM 
        information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
    ORDER BY tc.table_name, tc.constraint_name;
END;
$$; 