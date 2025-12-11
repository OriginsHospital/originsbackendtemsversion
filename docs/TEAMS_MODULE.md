# Teams Module Documentation

## Overview

The Teams Module is a Microsoft Teams-like communication suite integrated into the Hospital/Clinic Management System. It provides comprehensive communication tools for internal staff including doctors, nurses, receptionists, administrators, pharmacy, lab staff, and more.

## Architecture

### Module Structure

```
Teams Module
├── Chats
│   ├── One-to-One Chat
│   ├── Group Chats
│   └── Broadcast Messaging
├── Voice & Video Calling
│   ├── One-to-One Calls
│   ├── Group Calls
│   └── Video Meetings
├── Meetings
│   ├── Scheduled Meetings
│   ├── Instant Meetings
│   └── Recurring Meetings
├── Calendar
│   ├── Event Management
│   ├── Reminders
│   └── Sync with Meetings
└── Scheduling
    ├── Shift Scheduling
    ├── Task Assignment
    └── Rotation Management
```

## Database Schema

### Core Tables

1. **teams_chats** - Stores chat conversations (direct, group, broadcast)
2. **teams_chat_messages** - Individual messages in chats
3. **teams_chat_members** - Participants in chats
4. **teams_meetings** - Scheduled and instant meetings
5. **teams_meeting_participants** - Meeting attendees
6. **teams_calls_logs** - Voice and video call logs
7. **teams_calendar_events** - Calendar events and tasks
8. **teams_calendar_event_participants** - Event participants
9. **teams_scheduling** - Shift and task scheduling
10. **teams_groups** - Organized team groups
11. **teams_group_members** - Group members
12. **teams_message_reactions** - Emoji reactions to messages
13. **teams_typing_indicators** - Real-time typing status

### Key Features

#### 1. Chats Module

**One-to-One Chat:**
- Direct messaging between any two users
- Online/offline indicators
- Read receipts (seen/delivered status)
- Typing indicators
- Message reactions

**Group Chats:**
- Create groups (e.g., "Gynae Team", "ICU Team", "Pharmacy Team")
- Add/remove members with permissions
- Assign group admins
- Group announcements
- Pin important messages

**Broadcast Messaging:**
- Send updates to multiple users
- No replies allowed
- System-level announcements

**Message Features:**
- Text messages
- File sharing (PDF, reports, prescriptions)
- Images and videos
- Voice notes
- Emoji reactions
- @mentions
- Message editing & deleting
- Search functionality
- Message threads/replies

#### 2. Voice & Video Calling

**Voice Calls:**
- One-to-one voice calls
- Call accept/reject/missed logs
- In-call timer
- Call recording (optional)

**Group Voice Calls:**
- Multiple participants
- Mute/unmute controls
- Participant management

**Video Meetings:**
- Instant video calls
- Screen sharing
- Meeting lock
- Mute participants
- Chat inside meeting
- Raise hand feature
- WebRTC integration

#### 3. Meetings Module

**Features:**
- Schedule meetings between teams
- Add participants
- Meeting agenda
- Meeting reminders
- Auto notifications
- Join button for voice/video
- Meeting history
- Recurring meetings

#### 4. Calendar Integration

**Features:**
- Today's meetings view
- Monthly/weekly/day view
- Meeting reminders
- Personal notes
- Sync with Scheduling module
- Color coding
- Event types (meeting, task, reminder, shift, appointment)

#### 5. Scheduling

**Features:**
- Team task scheduling
- Shift scheduling for staff
- Automatic reminders
- Assign tasks to departments
- Priority-based scheduling
- Recurring schedules

## Real-Time Communication

### WebSocket Integration

The module uses Socket.io for real-time communication:

- **Instant Messaging**: Real-time message delivery
- **Typing Indicators**: Show when users are typing
- **Online Status**: Real-time online/offline status
- **Call Notifications**: Instant call notifications
- **Meeting Updates**: Real-time meeting status updates

### WebRTC for Calls

- Peer-to-peer connection for voice/video calls
- Screen sharing capabilities
- Recording functionality
- Group call management

## API Endpoints Structure

```
/teams
├── /chats
│   ├── GET    /                          - Get user's chats
│   ├── POST   /                          - Create new chat
│   ├── GET    /:chatId                   - Get chat details
│   ├── POST   /:chatId/messages          - Send message
│   ├── GET    /:chatId/messages          - Get messages
│   ├── PUT    /:chatId/messages/:msgId   - Edit message
│   ├── DELETE /:chatId/messages/:msgId   - Delete message
│   └── POST   /:chatId/members           - Add members
├── /meetings
│   ├── GET    /                          - Get meetings
│   ├── POST   /                          - Create meeting
│   ├── GET    /:meetingId                - Get meeting details
│   ├── PUT    /:meetingId                - Update meeting
│   ├── DELETE /:meetingId                - Cancel meeting
│   └── POST   /:meetingId/join           - Join meeting
├── /calls
│   ├── POST   /initiate                  - Initiate call
│   ├── POST   /:callId/accept            - Accept call
│   ├── POST   /:callId/reject            - Reject call
│   └── POST   /:callId/end               - End call
├── /calendar
│   ├── GET    /                          - Get calendar events
│   ├── POST   /                          - Create event
│   ├── PUT    /:eventId                  - Update event
│   └── DELETE /:eventId                  - Delete event
└── /scheduling
    ├── GET    /                          - Get schedules
    ├── POST   /                          - Create schedule
    ├── PUT    /:scheduleId               - Update schedule
    └── DELETE /:scheduleId               - Delete schedule
```

## Security & Permissions

### Role-Based Access

- **Admin**: Full access to all features
- **Doctor**: Can create groups, schedule meetings, access all chats
- **Nurse**: Can participate in assigned groups and meetings
- **Staff**: Basic chat and meeting participation
- **Department-specific**: Access limited to department groups

### Data Privacy

- End-to-end encryption for sensitive conversations
- File upload restrictions
- Message retention policies
- Audit logs for compliance

## Frontend Components

### Main Dashboard
- Unified view of Chats, Meetings, Calendar
- Real-time notifications
- Quick access to recent conversations

### Chat Interface
- Message list
- Chat window
- File upload area
- Emoji picker
- @mention autocomplete

### Meeting Interface
- Meeting list
- Join/Start meeting buttons
- Meeting controls (mute, video, screen share)
- Participant list

### Calendar View
- Monthly grid
- Weekly timeline
- Daily agenda
- Event creation form

## Implementation Status

✅ Database models created
✅ SQL migration script ready
⏳ Backend services (in progress)
⏳ WebSocket server setup (pending)
⏳ Frontend components (pending)
⏳ WebRTC integration (pending)

## Next Steps

1. Run database migration
2. Create backend services for each module
3. Set up Socket.io server
4. Create API endpoints
5. Build frontend components
6. Integrate WebRTC for calls
7. Add file upload functionality
8. Implement notifications system

## Technical Stack

- **Backend**: Node.js, Express, Sequelize ORM
- **Real-time**: Socket.io
- **Calls**: WebRTC
- **File Storage**: AWS S3
- **Frontend**: React, Next.js, Material-UI
- **Database**: MySQL

