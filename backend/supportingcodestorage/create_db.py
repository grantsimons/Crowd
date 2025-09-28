#!/usr/bin/env python3
"""
Simple SQLite script to create a database with user entries schema.
This script creates a table with the following fields:
1. Entry ID (Primary Key)
2. User ID
3. First Name
4. Last Name
5. Phone Number
6. Email
7. Bio
8. Age
9. Vibe
"""

import sqlite3
import os


def create_database(db_name="user_entries.db"):
    """Create a SQLite database with the user entries table."""
    
    # Remove existing database if it exists
    if os.path.exists(db_name):
        os.remove(db_name)
        print(f"Removed existing database: {db_name}")
    
    # Connect to the database (creates it if it doesn't exist)
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    try:
        # Create the user_entries table
        create_table_sql = """
        CREATE TABLE user_entries (
            entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            first_name TEXT NOT NULL,
            last_name TEXT NOT NULL,
            phone_number TEXT NOT NULL,
            email TEXT NOT NULL,
            bio TEXT NOT NULL,
            age INTEGER NOT NULL,
            vibe TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
            deleted BOOLEAN DEFAULT 0 NOT NULL
        )
        """
        
        cursor.execute(create_table_sql)
        print("✅ Database created successfully!")
        print("✅ Table 'user_entries' created with the following schema:")
        print("   1. entry_id (INTEGER PRIMARY KEY AUTOINCREMENT)")
        print("   2. user_id (TEXT NOT NULL)")
        print("   3. first_name (TEXT NOT NULL)")
        print("   4. last_name (TEXT NOT NULL)")
        print("   5. phone_number (TEXT)")
        print("   6. email (TEXT)")
        print("   7. bio (TEXT)")
        print("   8. age (INTEGER)")
        print("   9. vibe (TEXT)")
        
        # Verify the table was created
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_entries'")
        result = cursor.fetchone()
        if result:
            print(f"✅ Table verification: {result[0]} exists")
        
        # Show table schema
        cursor.execute("PRAGMA table_info(user_entries)")
        columns = cursor.fetchall()
        print("\n📋 Table Schema Details:")
        for column in columns:
            print(f"   {column[1]} ({column[2]}) - {'NOT NULL' if column[3] else 'NULLABLE'}")
        
    except sqlite3.Error as e:
        print(f"❌ Database error: {e}")
    finally:
        conn.close()
        print(f"\n🔗 Database connection closed. Database file: {db_name}")


def insert_sample_data(db_name="user_entries.db"):
    """Insert some sample data into the database."""
    conn = sqlite3.connect(db_name)
    cursor = conn.cursor()
    
    try:
        # Sample data
        sample_entries = [
            ("user001", "John", "Doe", "+1234567890", "john.doe@email.com", "Software developer with passion for clean code", 28, "friendly"),
            ("user002", "Jane", "Smith", "+0987654321", "jane.smith@email.com", "Designer and artist", 25, "creative"),
            ("user003", "Bob", "Johnson", "+1122334455", "bob.johnson@email.com", "Entrepreneur and coffee enthusiast", 32, "energetic")
        ]
        
        insert_sql = """
        INSERT INTO user_entries (user_id, first_name, last_name, phone_number, email, bio, age, vibe)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """
        
        cursor.executemany(insert_sql, sample_entries)
        conn.commit()
        
        print(f"\n✅ Inserted {len(sample_entries)} sample entries")
        
        # Show the inserted data
        cursor.execute("SELECT * FROM user_entries")
        entries = cursor.fetchall()
        
        print("\n📊 Sample Data:")
        for entry in entries:
            print(f"   Entry ID: {entry[0]}, User: {entry[2]} {entry[3]} ({entry[1]})")
        
    except sqlite3.Error as e:
        print(f"❌ Insert error: {e}")
    finally:
        conn.close()


if __name__ == "__main__":
    print("🚀 Creating SQLite Database with User Entries Schema")
    print("=" * 50)
    
    # Create the database
    create_database()
    
    # Ask if user wants sample data
    print("\n" + "=" * 50)
    response = input("Would you like to insert sample data? (y/n): ").lower().strip()
    
    if response in ['y', 'yes']:
        print("\n📝 Inserting sample data...")
        insert_sample_data()
    
    print("\n🎉 Database setup complete!")
