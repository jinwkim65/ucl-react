# Run python3 update_sql.py to scan the rounds folder and update the SQLite database.

import os
import sqlite3
from pathlib import Path
from PyPDF2 import PdfReader

# Constants
VALID_LEVELS = {"novice", "intermediate", "advanced", "elite"}
PAGE_DIR = Path("./static/rounds")   # root folder containing subfolders of PDFs
DB_PATH = "data.db"         # path to your SQLite database

def extract_text_from_pdf(pdf_path: Path) -> str:
    """
    Extract and return all text from a PDF file using PyPDF2.
    """
    reader = PdfReader(str(pdf_path))
    pages_text = []
    for page in reader.pages:
        text = page.extract_text() or ""
        pages_text.append(text)
    return "\n".join(pages_text)

def scan_and_store_pdfs(rounds_root: Path, db_path: str):
    """
    Scans all PDFs under `rounds_root`, extracts metadata from filenames,
    pulls text from each PDF, and inserts into the SQLite `library` table.
    """
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    for pdf_file in rounds_root.rglob("*.pdf"):
        # Expect filenames like "florida_advanced_2023.pdf"
        parts = pdf_file.stem.split("_")
        if len(parts) != 3:
            print(f"Skipping unexpected filename format: {pdf_file.name}")
            continue

        tournament, level, year_str = parts
        if level not in VALID_LEVELS:
            print(f"Skipping invalid level '{level}' in {pdf_file.name}")
            continue

        try:
            year = int(year_str)
        except ValueError:
            print(f"Skipping non-integer year '{year_str}' in {pdf_file.name}")
            continue

        # Skip if already in the DB
        cursor.execute(
            "SELECT 1 FROM library WHERE tournament = ? AND level = ? AND year = ?",
            (tournament, level, year)
        )
        if cursor.fetchone():
            continue

        # Extract text
        try:
            text = extract_text_from_pdf(pdf_file)
        except Exception as e:
            print(f"Failed to extract from {pdf_file.name}: {e}")
            continue

        # Insert into database
        cursor.execute(
            "INSERT INTO library (tournament, level, year, text) VALUES (?, ?, ?, ?)",
            (tournament, level, year, text)
        )
        conn.commit()
        print(f"Added {pdf_file.name} to library.")

    conn.close()

# Create the database and table if they don't exist
def initialize_database(db_path: str):
    """
    Initializes the SQLite database and creates the library table if it doesn't exist.
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS library (
            tournament TEXT NOT NULL,
            year INTEGER NOT NULL,
            level TEXT NOT NULL,
            text TEXT NOT NULL,
            PRIMARY KEY (tournament, year, level)
        )
    """)
    conn.commit()
    conn.close()

# Drop the existing table if it exists
def reset_database(db_path: str):
    """
    Resets the SQLite database by dropping the existing library table.
    """
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("DROP TABLE IF EXISTS library")
    conn.commit()
    conn.close()

if __name__ == "__main__":
    reset_database(DB_PATH)  # Reset the database
    initialize_database(DB_PATH)  # Initialize the database
    print("Starting PDF scan and database update...")
    scan_and_store_pdfs(PAGE_DIR, DB_PATH)
    print("Database update complete.")