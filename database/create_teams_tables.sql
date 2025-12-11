-- Teams Module Database Tables
-- Microsoft Teams-like communication suite for Hospital/Clinic System

-- Teams Users Association (links users to teams)
CREATE TABLE IF NOT EXISTS teams_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  teamId INT NULL COMMENT 'For future team-based organization',
  role VARCHAR(50) DEFAULT 'member' COMMENT 'admin, member, guest',
  status ENUM('active', 'inactive', 'blocked') DEFAULT 'active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_status (status)
) COMMENT 'Association table for users in teams module';

-- Teams Chats (One-to-One and Group Chats)
CREATE TABLE IF NOT EXISTS teams_chats (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chatType ENUM('direct', 'group', 'broadcast') NOT NULL,
  name VARCHAR(255) NULL COMMENT 'Group name or null for direct chats',
  description TEXT NULL COMMENT 'Group description',
  createdBy INT NOT NULL,
  avatarUrl VARCHAR(500) NULL COMMENT 'Group avatar URL',
  isArchived BOOLEAN DEFAULT 0,
  lastMessageAt DATETIME NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_chatType (chatType),
  INDEX idx_createdBy (createdBy),
  INDEX idx_lastMessageAt (lastMessageAt)
) COMMENT 'Chats table for direct, group, and broadcast chats';

-- Teams Chat Members (Participants in chats)
CREATE TABLE IF NOT EXISTS teams_chat_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chatId INT NOT NULL,
  userId INT NOT NULL,
  role ENUM('admin', 'member', 'viewer') DEFAULT 'member',
  joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  leftAt DATETIME NULL,
  lastReadAt DATETIME NULL COMMENT 'Last time user read messages',
  isMuted BOOLEAN DEFAULT 0,
  isPinned BOOLEAN DEFAULT 0,
  UNIQUE KEY unique_chat_user (chatId, userId),
  FOREIGN KEY (chatId) REFERENCES teams_chats(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_lastReadAt (lastReadAt)
) COMMENT 'Members of chats (both direct and group)';

-- Teams Chat Messages
CREATE TABLE IF NOT EXISTS teams_chat_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chatId INT NOT NULL,
  senderId INT NOT NULL,
  messageType ENUM('text', 'image', 'video', 'file', 'voice', 'system') DEFAULT 'text',
  message TEXT NOT NULL,
  fileName VARCHAR(500) NULL COMMENT 'For file/image/video/voice messages',
  fileUrl VARCHAR(500) NULL,
  fileSize BIGINT NULL,
  replyToMessageId INT NULL COMMENT 'For reply to specific message',
  isEdited BOOLEAN DEFAULT 0,
  isDeleted BOOLEAN DEFAULT 0,
  isPinned BOOLEAN DEFAULT 0,
  mentions JSON NULL COMMENT 'Array of mentioned user IDs',
  readBy JSON NULL COMMENT 'Array of user IDs who read the message',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (chatId) REFERENCES teams_chats(id) ON DELETE CASCADE,
  FOREIGN KEY (senderId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (replyToMessageId) REFERENCES teams_chat_messages(id) ON DELETE SET NULL,
  INDEX idx_chatId (chatId),
  INDEX idx_senderId (senderId),
  INDEX idx_createdAt (createdAt),
  INDEX idx_isDeleted (isDeleted)
) COMMENT 'Messages in chats';

-- Teams Groups (For organized group chats)
CREATE TABLE IF NOT EXISTS teams_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  avatarUrl VARCHAR(500) NULL,
  createdBy INT NOT NULL,
  isPublic BOOLEAN DEFAULT 0,
  maxMembers INT DEFAULT 1000,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_createdBy (createdBy)
) COMMENT 'Organized groups for team communication';

-- Teams Group Members
CREATE TABLE IF NOT EXISTS teams_group_members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  groupId INT NOT NULL,
  userId INT NOT NULL,
  role ENUM('admin', 'moderator', 'member') DEFAULT 'member',
  joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_group_user (groupId, userId),
  FOREIGN KEY (groupId) REFERENCES teams_groups(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId)
) COMMENT 'Members of organized groups';

-- Teams Meetings
CREATE TABLE IF NOT EXISTS teams_meetings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  organizerId INT NOT NULL,
  meetingType ENUM('instant', 'scheduled', 'recurring') DEFAULT 'scheduled',
  startTime DATETIME NOT NULL,
  endTime DATETIME NULL,
  duration INT NULL COMMENT 'Duration in minutes',
  meetingLink VARCHAR(500) NULL COMMENT 'WebRTC/Video call link',
  meetingId VARCHAR(100) NULL COMMENT 'Unique meeting ID',
  status ENUM('scheduled', 'ongoing', 'completed', 'cancelled') DEFAULT 'scheduled',
  isRecording BOOLEAN DEFAULT 0,
  password VARCHAR(50) NULL COMMENT 'Meeting password',
  agenda TEXT NULL,
  location VARCHAR(255) NULL,
  maxParticipants INT DEFAULT 100,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organizerId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_organizerId (organizerId),
  INDEX idx_startTime (startTime),
  INDEX idx_status (status)
) COMMENT 'Scheduled and instant meetings';

-- Teams Meeting Participants
CREATE TABLE IF NOT EXISTS teams_meeting_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  meetingId INT NOT NULL,
  userId INT NOT NULL,
  role ENUM('organizer', 'presenter', 'attendee') DEFAULT 'attendee',
  status ENUM('invited', 'accepted', 'declined', 'tentative', 'joined', 'left') DEFAULT 'invited',
  joinedAt DATETIME NULL,
  leftAt DATETIME NULL,
  duration INT NULL COMMENT 'Time spent in meeting in minutes',
  UNIQUE KEY unique_meeting_user (meetingId, userId),
  FOREIGN KEY (meetingId) REFERENCES teams_meetings(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_status (status)
) COMMENT 'Participants in meetings';

-- Teams Calls Logs (Voice/Video calls)
CREATE TABLE IF NOT EXISTS teams_calls_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  callType ENUM('voice', 'video') NOT NULL,
  callerId INT NOT NULL,
  receiverId INT NULL COMMENT 'For one-to-one calls',
  chatId INT NULL COMMENT 'For group calls',
  callStatus ENUM('initiated', 'ringing', 'answered', 'missed', 'rejected', 'ended', 'busy', 'failed') DEFAULT 'initiated',
  startTime DATETIME DEFAULT CURRENT_TIMESTAMP,
  endTime DATETIME NULL,
  duration INT NULL COMMENT 'Duration in seconds',
  recordingUrl VARCHAR(500) NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (callerId) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (receiverId) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (chatId) REFERENCES teams_chats(id) ON DELETE SET NULL,
  INDEX idx_callerId (callerId),
  INDEX idx_receiverId (receiverId),
  INDEX idx_callStatus (callStatus),
  INDEX idx_startTime (startTime)
) COMMENT 'Logs of voice and video calls';

-- Teams Calendar Events
CREATE TABLE IF NOT EXISTS teams_calendar_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  eventType ENUM('meeting', 'task', 'reminder', 'shift', 'appointment') NOT NULL,
  userId INT NOT NULL COMMENT 'Owner/creator of the event',
  startTime DATETIME NOT NULL,
  endTime DATETIME NULL,
  isAllDay BOOLEAN DEFAULT 0,
  location VARCHAR(255) NULL,
  isRecurring BOOLEAN DEFAULT 0,
  recurrencePattern VARCHAR(100) NULL COMMENT 'e.g., "daily", "weekly", "monthly"',
  reminderMinutes INT NULL COMMENT 'Minutes before event to send reminder',
  status ENUM('scheduled', 'in-progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  color VARCHAR(20) NULL COMMENT 'Color code for calendar display',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_startTime (startTime),
  INDEX idx_eventType (eventType),
  INDEX idx_status (status)
) COMMENT 'Calendar events for meetings, tasks, reminders, shifts';

-- Teams Calendar Event Participants
CREATE TABLE IF NOT EXISTS teams_calendar_event_participants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  eventId INT NOT NULL,
  userId INT NOT NULL,
  status ENUM('invited', 'accepted', 'declined', 'tentative') DEFAULT 'invited',
  UNIQUE KEY unique_event_user (eventId, userId),
  FOREIGN KEY (eventId) REFERENCES teams_calendar_events(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId)
) COMMENT 'Participants in calendar events';

-- Teams Scheduling (Shift and Task Scheduling)
CREATE TABLE IF NOT EXISTS teams_scheduling (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  scheduleType ENUM('shift', 'task', 'rotation') NOT NULL,
  assignedTo INT NULL COMMENT 'User assigned to this schedule',
  departmentId INT NULL COMMENT 'Department for the schedule',
  startTime DATETIME NOT NULL,
  endTime DATETIME NOT NULL,
  isRecurring BOOLEAN DEFAULT 0,
  recurrencePattern VARCHAR(100) NULL,
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  status ENUM('scheduled', 'in-progress', 'completed', 'cancelled') DEFAULT 'scheduled',
  reminderSent BOOLEAN DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_assignedTo (assignedTo),
  INDEX idx_startTime (startTime),
  INDEX idx_scheduleType (scheduleType)
) COMMENT 'Shift and task scheduling';

-- Teams Message Reactions (Emoji reactions to messages)
CREATE TABLE IF NOT EXISTS teams_message_reactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  messageId INT NOT NULL,
  userId INT NOT NULL,
  reaction VARCHAR(10) NOT NULL COMMENT 'Emoji or reaction type',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_message_user_reaction (messageId, userId, reaction),
  FOREIGN KEY (messageId) REFERENCES teams_chat_messages(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_messageId (messageId)
) COMMENT 'Emoji reactions to messages';

-- Teams Typing Indicators (Temporary table for real-time typing status)
CREATE TABLE IF NOT EXISTS teams_typing_indicators (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chatId INT NOT NULL,
  userId INT NOT NULL,
  isTyping BOOLEAN DEFAULT 1,
  lastTypingAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chatId) REFERENCES teams_chats(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_chatId_userId (chatId, userId),
  INDEX idx_lastTypingAt (lastTypingAt)
) COMMENT 'Temporary table for typing indicators (can be cleaned periodically)';

