-- Create quotes table
CREATE TABLE IF NOT EXISTS quotes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    procedure VARCHAR(255) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    pdf_file VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    edited_at TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_quotes_date ON quotes(date);

-- Create index on deleted_at for filtering active/deleted quotes
CREATE INDEX IF NOT EXISTS idx_quotes_deleted_at ON quotes(deleted_at);
