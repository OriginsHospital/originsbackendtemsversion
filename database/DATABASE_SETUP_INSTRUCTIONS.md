# Database Setup Instructions

## 🎯 Which Database to Use

**Both SQL files must be executed in the SAME database.**

The database name is configured in your `.env` file:
- **Development**: Use the database name from `MYSQL_DBNAME`
- **Production**: Use the database name from `MYSQL_DBNAME_PROD`

## 📋 Execution Order (IMPORTANT!)

### Step 1: Run `create_queries.sql` FIRST
This file creates the base tables including:
- `users` table (required by Teams module)
- `role_master`, `module_master`
- `patient_master`, `branch_master`
- All other core system tables

### Step 2: Run `create_teams_tables.sql` SECOND
This file creates the Teams module tables that depend on the `users` table.

## 🔧 How to Execute in MySQL Workbench

### Method 1: Using MySQL Workbench (Recommended)

1. **Connect to MySQL Server**
   - Open MySQL Workbench
   - Connect using credentials from your `.env` file

2. **Select Your Database**
   ```sql
   -- Check your current database
   SELECT DATABASE();
   
   -- If wrong, select the correct one
   USE your_database_name;
   ```
   Replace `your_database_name` with the value from `MYSQL_DBNAME` or `MYSQL_DBNAME_PROD` in your `.env` file.

3. **Execute `create_queries.sql`**
   - Open the file: `origins-backend-hms/database/create_queries.sql`
   - Copy all contents (Ctrl+A, Ctrl+C)
   - Paste into MySQL Workbench query tab
   - Click **Execute** (⚡ button) or press `Ctrl+Shift+Enter`
   - Wait for completion

4. **Verify Base Tables Created**
   ```sql
   -- Check if users table exists
   SHOW TABLES LIKE 'users';
   
   -- Check all tables
   SHOW TABLES;
   ```

5. **Execute `create_teams_tables.sql`**
   - Open the file: `origins-backend-hms/database/create_teams_tables.sql`
   - Copy all contents
   - Paste into MySQL Workbench query tab
   - Click **Execute**
   - Wait for completion

6. **Verify Teams Tables Created**
   ```sql
   -- Check Teams tables
   SHOW TABLES LIKE 'teams_%';
   
   -- Should show 13 tables:
   -- teams_users, teams_chats, teams_chat_members, 
   -- teams_chat_messages, teams_groups, teams_group_members,
   -- teams_meetings, teams_meeting_participants, teams_calls_logs,
   -- teams_calendar_events, teams_calendar_event_participants,
   -- teams_scheduling, teams_message_reactions, teams_typing_indicators
   ```

### Method 2: Using Command Line

```bash
# Connect to MySQL
mysql -u your_username -p

# Select database
USE your_database_name;

# Execute first file
source /path/to/origins-backend-hms/database/create_queries.sql;

# Verify users table exists
SHOW TABLES LIKE 'users';

# Execute second file
source /path/to/origins-backend-hms/database/create_teams_tables.sql;

# Verify Teams tables
SHOW TABLES LIKE 'teams_%';
```

## ⚠️ Important Notes

1. **Same Database**: Both files must run in the **same database** because:
   - Teams tables reference `users(id)` from the base schema
   - Foreign key constraints require all tables in the same database

2. **Order Matters**: 
   - `create_queries.sql` must run **before** `create_teams_tables.sql`
   - Teams tables have foreign keys to `users` table

3. **Database Name**: 
   - Check your `.env` file for the exact database name
   - Common names: `origins_hms`, `hms_db`, `defaultdb`, etc.
   - The name depends on your configuration

4. **If Tables Already Exist**:
   - `create_teams_tables.sql` uses `CREATE TABLE IF NOT EXISTS` (safe)
   - `create_queries.sql` may need manual cleanup if re-running

## ✅ Verification Checklist

After execution, verify:

- [ ] `users` table exists
- [ ] `role_master` table exists
- [ ] `module_master` table exists
- [ ] `branch_master` table exists
- [ ] All 13 Teams tables exist (check with `SHOW TABLES LIKE 'teams_%'`)
- [ ] No error messages in MySQL Workbench output
- [ ] Foreign key constraints are valid

## 🐛 Troubleshooting

### Error: "Table 'users' doesn't exist"
- **Solution**: Run `create_queries.sql` first before `create_teams_tables.sql`

### Error: "Unknown database"
- **Solution**: Create the database first:
  ```sql
  CREATE DATABASE your_database_name;
  USE your_database_name;
  ```

### Error: "Access denied"
- **Solution**: Check MySQL user permissions (needs CREATE TABLE permission)

### Error: "Foreign key constraint fails"
- **Solution**: Ensure `users` table exists and has `id` column

---

**Summary**: Use the database name from your `.env` file (`MYSQL_DBNAME` or `MYSQL_DBNAME_PROD`), run `create_queries.sql` first, then `create_teams_tables.sql` in the same database.

