-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================
-- USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    credits_remaining FLOAT NOT NULL DEFAULT 5.0,
    credits_last_refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    storage_used_bytes BIGINT NOT NULL DEFAULT 0,
    max_storage_bytes BIGINT NOT NULL DEFAULT 10485760,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email)
    VALUES (NEW.id, NEW.email);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
    ON user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Service role full access"
    ON user_profiles FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- DOCUMENTS TABLE (with user_id)
-- ============================================
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding vector(768) NOT NULL,
    source TEXT NOT NULL,
    title TEXT NOT NULL,
    section TEXT DEFAULT '',
    chunk_index INTEGER NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_documents_source ON documents(source);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own documents"
    ON documents FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
    ON documents FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
    ON documents FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on documents"
    ON documents FOR ALL
    USING (auth.role() = 'service_role');

-- Vector similarity search function (with user_id filter)
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

CREATE INDEX IF NOT EXISTS idx_documents_embedding ON documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- ============================================
-- CREDIT TRANSACTIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS credit_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tokens_used INTEGER NOT NULL,
    credits_deducted FLOAT NOT NULL,
    credits_remaining_after FLOAT NOT NULL,
    question_preview TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

CREATE INDEX IF NOT EXISTS idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_transactions_created_at ON credit_transactions(created_at);

ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own transactions"
    ON credit_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Service role full access on credit_transactions"
    ON credit_transactions FOR ALL
    USING (auth.role() = 'service_role');

-- ============================================
-- CREDIT REFRESH FUNCTION (48 hours)
-- ============================================
CREATE OR REPLACE FUNCTION refresh_credits_if_needed(p_user_id UUID)
RETURNS FLOAT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_credits FLOAT;
    v_last_refreshed TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT credits_remaining, credits_last_refreshed_at
    INTO v_credits, v_last_refreshed
    FROM user_profiles
    WHERE id = p_user_id;

    IF v_last_refreshed IS NULL OR (NOW() - v_last_refreshed) >= INTERVAL '48 hours' THEN
        UPDATE user_profiles
        SET credits_remaining = 5.0,
            credits_last_refreshed_at = TIMEZONE('utc', NOW())
        WHERE id = p_user_id;
        RETURN 5.0;
    END IF;

    RETURN v_credits;
END;
$$;
