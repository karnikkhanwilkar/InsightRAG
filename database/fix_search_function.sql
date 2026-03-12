-- Fix for similarity search function
-- Run this in Supabase SQL Editor

-- First, make sure pgvector extension is enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop any old overloads that cause PostgREST ambiguity
DROP FUNCTION IF EXISTS match_documents(vector, float, int);
DROP FUNCTION IF EXISTS match_documents(vector, float, int, uuid);

-- Create the similarity search function (with user_id filter)
CREATE OR REPLACE FUNCTION match_documents (
    query_embedding vector(768),
    match_threshold FLOAT DEFAULT 0.0,
    match_count INT DEFAULT 8,
    p_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    content TEXT,
    embedding vector(768),
    source TEXT,
    title TEXT,
    section TEXT,
    chunk_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        documents.id,
        documents.content,
        documents.embedding,
        documents.source,
        documents.title,
        documents.section,
        documents.chunk_index,
        documents.created_at,
        1 - (documents.embedding <=> query_embedding) AS similarity
    FROM documents
    WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
      AND (p_user_id IS NULL OR documents.user_id = p_user_id)
    ORDER BY documents.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Verify it was created (should return exactly one row)
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'match_documents';
