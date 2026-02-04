# Supabase Database Setup Instructions

## Prerequisites
- A Supabase account (sign up at https://supabase.com)
- Access to your Supabase project dashboard

## Setup Steps

### 1. Enable pgvector Extension

1. Go to your Supabase project dashboard
2. Navigate to **Database** → **Extensions**
3. Search for **vector**
4. Enable the **vector** extension

### 2. Run the Schema SQL

1. Navigate to **SQL Editor** in your Supabase dashboard
2. Create a new query
3. Copy the entire contents of `schema.sql` file
4. Paste into the SQL editor
5. Click **Run** to execute

This will:
- Enable the pgvector extension
- Create the `documents` table with proper schema
- Create necessary indexes for performance
- Create the `match_documents` function for similarity search

### 3. Get Your Connection Details

You'll need these for the backend configuration:

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** → This is your `SUPABASE_URL`
   - **Project API keys** → **service_role** key → This is your `SUPABASE_SERVICE_KEY`

 **Important**: Use the `service_role` key (not the `anon` key) for the backend to have full database access.

### 4. Verify Setup

Run this query in the SQL Editor to verify the table was created:

```sql
SELECT * FROM documents LIMIT 1;
```

To verify the function:

```sql
SELECT * FROM match_documents(
    ARRAY[0.1, 0.2, ...]::vector(768),  -- dummy embedding
    0.0,
    5
);
```

## Row Level Security (Optional)

If you want to enable RLS for additional security:

```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations for service role
CREATE POLICY "Allow all for service role" ON documents
FOR ALL USING (true);
```

## Troubleshooting

### Extension not available
- Make sure you're on a Supabase plan that supports extensions
- Some extensions might require contacting Supabase support

### Permission errors
- Ensure you're using the `service_role` key, not the `anon` key
- Check that the extension is properly enabled

### Index creation slow
- The ivfflat index creation might take time with large datasets
- You can adjust the `lists` parameter based on your dataset size
