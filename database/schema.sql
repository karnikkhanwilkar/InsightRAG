-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create documents table with vector embeddings
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding vector(768) NOT NULL,
    source TEXT NOT NULL,
    title TEXT NOT NULL,
    section TEXT DEFAULT '',
    chunk_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on source for faster deletion
CREATE INDEX IF NOT EXISTS idx_documents_source ON documents(source);

-- Create index on created_at for time-based queries
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

-- Create vector similarity search function using cosine distance
CREATE OR REPLACE FUNCTION match_documents (
    query_embedding vector(768),
    match_threshold FLOAT DEFAULT 0.0,
    match_count INT DEFAULT 8
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
    ORDER BY documents.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- Create index for vector similarity search (ivfflat)
-- Note: You may need to adjust lists parameter based on your dataset size
-- Rule of thumb: lists = rows / 1000 for datasets < 1M rows
CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Grant necessary permissions (adjust role name as needed)
-- For Supabase, you might need to grant to 'anon' and 'authenticated' roles
-- ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Example: Grant select, insert, update, delete to authenticated users
-- GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON documents TO anon;
