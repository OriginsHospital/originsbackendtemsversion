# Quick Database Reference

## 🎯 Which Database to Use

Based on your database list, use:

- **Development Environment**: `defaultdb`
- **Production Environment**: `defaultdb_prod`

## 📋 Execution Steps

### For Development (`defaultdb`):

```sql
-- 1. Select the database
USE defaultdb;

-- 2. Verify you're in the right database
SELECT DATABASE();

-- 3. Run create_queries.sql (copy entire file content and execute)
-- This creates: users, role_master, module_master, patient_master, etc.

-- 4. Verify users table exists
SHOW TABLES LIKE 'users';

-- 5. Run create_teams_tables.sql (copy entire file content and execute)
-- This creates: teams_users, teams_chats, teams_meetings, etc.

-- 6. Verify Teams tables
SHOW TABLES LIKE 'teams_%';
```

### For Production (`defaultdb_prod`):

```sql
-- 1. Select the database
USE defaultdb_prod;

-- 2. Verify you're in the right database
SELECT DATABASE();

-- 3. Run create_queries.sql
-- 4. Run create_teams_tables.sql
-- (Same steps as development)
```

## ⚠️ Important Notes

1. **Both SQL files must run in the SAME database**
2. **Order matters**: `create_queries.sql` FIRST, then `create_teams_tables.sql`
3. **Ignore system databases**: `information_schema`, `mysql`, `performance_schema`, `sys` are MySQL system databases
4. **Stock Management**: `stockmanagement` and `stockmanagement_prod` are separate databases for inventory

## ✅ Quick Verification

After running both files, check:

```sql
-- Check base tables
SHOW TABLES;

-- Check Teams tables specifically
SHOW TABLES LIKE 'teams_%';

-- Should show 13 Teams tables:
-- teams_users, teams_chats, teams_chat_members, teams_chat_messages,
-- teams_groups, teams_group_members, teams_meetings, 
-- teams_meeting_participants, teams_calls_logs, teams_calendar_events,
-- teams_calendar_event_participants, teams_scheduling, 
-- teams_message_reactions, teams_typing_indicators
```

---

**TL;DR**: Use `defaultdb` for development or `defaultdb_prod` for production. Run `create_queries.sql` first, then `create_teams_tables.sql` in the same database.

