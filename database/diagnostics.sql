-- Quick diagnostic queries for Supabase
-- Run these in Supabase SQL Editor to debug the issue

-- 1. Check if documents table exists and has data
SELECT COUNT(*) as total_documents FROM documents;

-- 2. Check what sources are stored
SELECT source, COUNT(*) as chunk_count 
FROM documents 
GROUP BY source;

-- 3. Check if embeddings are stored (should not be NULL)
SELECT 
    source,
    chunk_index,
    CASE 
        WHEN embedding IS NULL THEN 'NULL'
        ELSE 'HAS EMBEDDING'
    END as embedding_status,
    LENGTH(content) as content_length
FROM documents 
ORDER BY source, chunk_index
LIMIT 10;

-- 4. Check if match_documents function exists
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'match_documents';

-- 5. Check if pgvector extension is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- 6. Try a simple similarity search manually (if you have data)
-- Replace the array with a dummy 768-dim vector
-- SELECT * FROM match_documents(
--     ARRAY[0.1, 0.2, 0.3, ...]::vector(768),
--     0.0,
--     5
-- );
