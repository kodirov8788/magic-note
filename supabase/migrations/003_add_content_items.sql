-- Add content_items JSONB column to notes table
ALTER TABLE notes 
ADD COLUMN content_items JSONB DEFAULT '[]'::jsonb;

-- Create index for JSONB queries
CREATE INDEX idx_notes_content_items ON notes USING GIN (content_items);

-- Add comment explaining the column
COMMENT ON COLUMN notes.content_items IS 'Structured content items (table rows and text fields) stored as JSON array';
