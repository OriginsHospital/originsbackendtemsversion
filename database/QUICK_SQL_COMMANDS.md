# Quick SQL Commands for MySQL Workbench - Teams Module

## 🚀 Quick Start (3 Steps)

### Step 1: Connect to Database
1. Open MySQL Workbench
2. Connect to your MySQL server
3. Select your database in the SCHEMAS panel

### Step 2: Select Database
```sql
-- Replace 'your_database_name' with your actual database name from .env file
USE your_database_name;

-- Verify you're using the correct database
SELECT DATABASE();
```

### Step 3: Run the Migration Script

**Option A: Execute the entire file**
1. Open file: `origins-backend-hms/database/create_teams_tables.sql`
2. Copy all contents (Ctrl+A, Ctrl+C)
3. Paste in MySQL Workbench query tab (Ctrl+V)
4. Click **⚡ Execute** button (or press Ctrl+Shift+Enter)

**Option B: Run commands manually**
Execute the entire content of `create_teams_tables.sql` file in MySQL Workbench.

---

## ✅ Verification Commands

### Check if tables were created:
```sql
SHOW TABLES LIKE 'teams_%';
```

**Expected Output:** You should see 13 tables:
- teams_users
- teams_chats
- teams_chat_members
- teams_chat_messages
- teams_groups
- teams_group_members
- teams_meetings
- teams_meeting_participants
- teams_calls_logs
- teams_calendar_events
- teams_calendar_event_participants
- teams_scheduling
- teams_message_reactions
- teams_typing_indicators

### Verify table structure:
```sql
-- Check structure of teams_chats table
DESCRIBE teams_chats;

-- Check all Teams tables with row counts
SELECT 
    TABLE_NAME,
    TABLE_ROWS,
    CREATE_TIME
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME LIKE 'teams_%'
ORDER BY TABLE_NAME;
```

---

## ⚠️ Troubleshooting

### If you get "Table already exists" error:
The script uses `CREATE TABLE IF NOT EXISTS`, so existing tables will be skipped. This is safe.

### If you get "users table doesn't exist" error:
Make sure your main database migration has been run first. The Teams tables reference the `users` table.

### If you need to start fresh (⚠️ DELETES ALL DATA):
```sql
-- Drop all Teams tables (WARNING: Deletes all Teams data!)
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

---

## 📋 Complete Checklist

- [ ] Connected to MySQL Workbench
- [ ] Selected correct database (`USE database_name;`)
- [ ] Opened/Copied `create_teams_tables.sql` file
- [ ] Executed the SQL script (⚡ Execute button)
- [ ] Verified 13 tables created (`SHOW TABLES LIKE 'teams_%';`)
- [ ] No errors in output panel
- [ ] Ready to use Teams module!

---

**That's it! Your Teams module database tables are now ready. 🎉**

