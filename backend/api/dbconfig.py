import sqlite3

DATABASE = 'data.db'

def get_db():
    """Opens a new database connection and sets row factory for dict output."""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

