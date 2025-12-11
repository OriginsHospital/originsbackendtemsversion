# Teams Module - SQL Installation Guide for MySQL Workbench

## 📋 Prerequisites

- MySQL Workbench installed and configured
- Access to your database server
- Database name (check your `.env` file for `MYSQL_DBNAME` or `MYSQL_DBNAME_PROD`)
- Database credentials (username and password)

## 🚀 Step-by-Step Instructions

### Step 1: Connect to MySQL Workbench

1. Open **MySQL Workbench**
2. Create a new connection or use an existing one:
   - Host: Your MySQL server address (from `.env` file: `MYSQL_HOST`)
   - Port: Your MySQL port (from `.env` file: `MYSQL_PORT`, usually `3306`)
   - Username: Your MySQL username (from `.env` file: `MYSQL_USERNAME`)
   - Password: Your MySQL password (from `.env` file: `MYSQL_PASSWORD`)
3. Click **Test Connection** to verify
4. Click **OK** to save and connect

### Step 2: Select Your Database

1. Once connected, you'll see your database in the left sidebar (SCHEMAS panel)
2. **Right-click** on your database name (e.g., `origins_hms` or your database name from `.env`)
3. Click **"Set as Default Schema"** OR
4. Double-click the database name to select it
5. You should see it highlighted/bolded in the SCHEMAS panel

### Step 3: Open the SQL Script

**Option A: Copy-Paste Method (Recommended)**
1. Open the SQL file: `origins-backend-hms/database/create_teams_tables.sql`
2. Copy the entire contents (Ctrl+A, then Ctrl+C)
3. In MySQL Workbench, click on the query tab (or press `Ctrl+T` to open a new tab)
4. Paste the SQL script (Ctrl+V)

**Option B: Import File Method**
1. In MySQL Workbench, go to **File** → **Open SQL Script**
2. Navigate to: `origins-backend-hms/database/create_teams_tables.sql`
3. Click **Open**

### Step 4: Verify Database Selection

Before running, ensure you're using the correct database:

```sql
-- Run this command first to check your current database
SELECT DATABASE();

-- If it shows the wrong database, use this command:
USE your_database_name;
```

Replace `your_database_name` with your actual database name from the `.env` file.

### Step 5: Execute the SQL Script

**Method 1: Execute All (Recommended)**
1. Make sure the entire SQL script is visible in the query tab
2. Click the **⚡ Execute** button (lightning bolt icon) in the toolbar
   - OR press `Ctrl+Shift+Enter`
3. Wait for execution to complete
4. Check the **Output** panel at the bottom for any errors

**Method 2: Execute Selected**
1. Select the portion of SQL you want to run
2. Click **⚡ Execute** or press `Ctrl+Shift+Enter`

### Step 6: Verify Tables Created

After execution, verify that all tables were created successfully:

```sql
-- Check if all Teams tables exist
SHOW TABLES LIKE 'teams_%';

-- You should see these 13 tables:
-- teams_users
-- teams_chats
-- teams_chat_members
-- teams_chat_messages
-- teams_groups
-- teams_group_members
-- teams_meetings
-- teams_meeting_participants
-- teams_calls_logs
-- teams_calendar_events
-- teams_calendar_event_participants
-- teams_scheduling
-- teams_message_reactions
-- teams_typing_indicators
```

**To verify table structure:**
```sql
-- Check structure of a specific table (example: teams_chats)
DESCRIBE teams_chats;

-- Or view all columns
SHOW COLUMNS FROM teams_chats;
```

## 🔍 Complete Verification Query

Run this query to see all created tables with their row counts:

```sql
SELECT 
    TABLE_NAME as 'Table Name',
    TABLE_ROWS as 'Row Count',
    CREATE_TIME as 'Created'
FROM 
    INFORMATION_SCHEMA.TABLES 
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME LIKE 'teams_%'
ORDER BY 
    TABLE_NAME;
```

## ⚠️ Important Notes

### If Tables Already Exist

If you get errors like "Table already exists", you have two options:

**Option 1: Drop Existing Tables (⚠️ WARNING: This will delete all data!)**
```sql
-- Run this ONLY if you want to start fresh (deletes all Teams data)
DROP TABLE IF EXISTS teams_typing_indicators;
DROP TABLE IF EXISTS teams_message_reactions;
DROP TABLE IF EXISTS teams_scheduling;
DROP TABLE IF EXISTS teams_calendar_event_participants;
DROP TABLE IF EXISTS teams_calendar_events;
DROP TABLE IF EXISTS teams_calls_logs;
DROP TABLE IF EXISTS teams_meeting_participants;
DROP TABLE IF EXISTS teams_meetings;
DROP TABLE IF EXISTS teams_group_members;
DROP TABLE IF EXISTS teams_groups;
DROP TABLE IF EXISTS teams_chat_messages;
DROP TABLE IF EXISTS teams_chat_members;
DROP TABLE IF EXISTS teams_chats;
DROP TABLE IF EXISTS teams_users;
```

Then re-run the `create_teams_tables.sql` script.

**Option 2: Keep Existing Data**
The script uses `CREATE TABLE IF NOT EXISTS`, so if tables already exist, they will be skipped. This is safe for production environments.

### Foreign Key Constraints

The script includes foreign key constraints that reference:
- `users(id)` - Make sure the `users` table exists
- Other Teams tables (self-referential)

If you get foreign key errors:
1. Verify the `users` table exists: `SHOW TABLES LIKE 'users';`
2. Check that foreign keys are supported: `SELECT @@foreign_key_checks;`

## 🐛 Troubleshooting

### Error: "Access denied"
- Check your MySQL username and password
- Verify user has CREATE TABLE permissions

### Error: "Unknown database"
- Make sure the database exists
- Use: `CREATE DATABASE your_database_name;` if needed
- Then: `USE your_database_name;`

### Error: "Table 'users' doesn't exist"
- The Teams module requires the `users` table to exist first
- Make sure your main database migration has been run

### Error: "Foreign key constraint fails"
- Ensure all referenced tables exist
- Check that the `users` table has an `id` column

## ✅ Success Indicators

After successful execution, you should see:

1. **Output Panel** shows:
   ```
   Query OK, 0 rows affected (0.xx sec)
   ```
   (This appears for each table created)

2. **No Error Messages** in red in the output panel

3. **Tables Visible** in the SCHEMAS panel under your database:
   - Expand your database
   - Expand "Tables"
   - You should see all 13 `teams_*` tables

## 📝 Quick Command Summary

```sql
-- 1. Select your database
USE your_database_name;

-- 2. Verify database selection
SELECT DATABASE();

-- 3. Check existing tables (before)
SHOW TABLES LIKE 'teams_%';

-- 4. Run the entire create_teams_tables.sql script here
-- (Copy and paste the entire file content)

-- 5. Verify tables created (after)
SHOW TABLES LIKE 'teams_%';

-- 6. Check table structure (example)
DESCRIBE teams_chats;
```

## 🎯 Next Steps

After successfully creating the tables:

1. ✅ Verify all 13 tables are created
2. ✅ Test the backend server connection
3. ✅ Install backend packages: `npm install socket.io uuid`
4. ✅ Install frontend packages: `npm install socket.io-client`
5. ✅ Start your backend server
6. ✅ Access Teams module from the frontend navigation

## 📞 Need Help?

If you encounter any issues:
1. Check the error message in MySQL Workbench output panel
2. Verify your database connection settings in `.env`
3. Ensure the `users` table exists in your database
4. Check MySQL user permissions for CREATE TABLE operations

---

**Happy Coding! 🚀**

