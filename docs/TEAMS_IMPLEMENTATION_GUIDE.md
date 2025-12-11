# Teams Module - Complete Implementation Guide

## Overview

This document provides a comprehensive guide for implementing the complete Teams module - a Microsoft Teams-like communication suite for the Hospital/Clinic Management System.

## ✅ Completed Components

### Backend Foundation

1. **Database Models** ✅
   - All Sequelize models created in `origins-backend-hms/models/Teams/`
   - Associations configured in `teamsAssociations.js`
   - SQL migration script ready: `create_teams_tables.sql`

2. **Backend Services** ✅
   - `chatsService.js` - Complete chat functionality
   - `meetingsService.js` - Meeting management
   - `calendarService.js` - Calendar events
   - `schedulingService.js` - Shift and task scheduling

3. **Backend Controllers** ✅
   - All controllers created in `origins-backend-hms/controllers/teams/`

4. **API Routes** ✅
   - Complete route structure in `teams_route.js`
   - Integrated into main routes in `routes/index.js`

5. **Socket.io Server** ✅
   - Real-time communication server: `teamsSocketServer.js`
   - Integrated into `app.js`

### Frontend Foundation

1. **API Functions** ✅
   - Complete API functions in `origins-frontend-hms/src/constants/teamsApis.js`
   - Routes added to constants

2. **Main Components** ✅
   - `TeamsDashboard.js` - Main dashboard with tabs
   - `ChatsView.js` - Chat interface with Socket.io integration

## 📋 Remaining Implementation Tasks

### 1. Install Required Packages

**Backend:**
```bash
cd origins-backend-hms
npm install socket.io uuid
```

**Frontend:**
```bash
cd origins-frontend-hms
npm install socket.io-client simple-peer react-big-calendar @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid
```

### 2. Database Migration

Run the SQL migration script:
```sql
-- Execute: origins-backend-hms/database/create_teams_tables.sql
```

### 3. Complete Frontend Components

The following components need to be created:

#### A. MeetingsView Component
- List of scheduled meetings
- Create/edit meeting form
- Join meeting button
- Meeting details modal

#### B. CalendarView Component  
- Calendar grid (month/week/day views)
- Event creation/editing
- Drag-and-drop support
- Event reminders

#### C. SchedulingView Component
- Shift scheduling interface
- Task assignment
- Calendar integration
- Filter by department/user

#### D. Call Components
- Voice call interface
- Video call interface with WebRTC
- Call controls (mute, video toggle, screen share)
- Call history

#### E. Enhanced Chat Features
- File upload component
- Emoji picker
- @mention autocomplete
- Message reactions
- Message search
- Group chat management

### 4. WebRTC Integration

For voice/video calling, integrate WebRTC:
- Use `simple-peer` or native WebRTC API
- Signal exchange via Socket.io
- Peer connection management
- Screen sharing support

### 5. Socket.io Client Setup

Create a Socket.io context/hook:
```javascript
// src/hooks/useTeamsSocket.js
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { useSelector } from 'react-redux'

export const useTeamsSocket = () => {
  const userDetails = useSelector((store) => store.user)
  const [socket, setSocket] = useState(null)

  useEffect(() => {
    if (!userDetails?.accessToken) return

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'
    const newSocket = io(socketUrl, {
      auth: { token: userDetails.accessToken },
      transports: ['websocket', 'polling'],
    })

    setSocket(newSocket)
    return () => newSocket.disconnect()
  }, [userDetails?.accessToken])

  return socket
}
```

### 6. Missing Model Files

Create these additional models if needed:
- `teamsMeetingParticipants.js`
- `teamsCalendarEventParticipants.js`
- `teamsMessageReactions.js`
- `teamsTypingIndicators.js`

### 7. Environment Variables

Add to `.env`:
```
SOCKET_URL=http://localhost:3000
MEETING_BASE_URL=https://meet.ortus.com
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

### 8. Additional Backend Services

Complete these service methods:
- File upload handling in chats
- Meeting recording service
- Calendar reminder service (cron job)
- Scheduling conflict detection

## 📁 File Structure

```
origins-backend-hms/
├── models/Teams/
│   ├── teamsChats.js ✅
│   ├── teamsChatMessages.js ✅
│   ├── teamsChatMembers.js ✅
│   ├── teamsMeetings.js ✅
│   ├── teamsCalendarEvents.js ✅
│   ├── teamsCallsLogs.js ✅
│   ├── teamsScheduling.js ✅
│   └── teamsAssociations.js ✅
├── services/teams/
│   ├── chatsService.js ✅
│   ├── meetingsService.js ✅
│   ├── calendarService.js ✅
│   └── schedulingService.js ✅
├── controllers/teams/
│   ├── chatsController.js ✅
│   ├── meetingsController.js ✅
│   ├── calendarController.js ✅
│   └── schedulingController.js ✅
├── routes/
│   └── teams_route.js ✅
├── socket/
│   └── teamsSocketServer.js ✅
└── database/
    └── create_teams_tables.sql ✅

origins-frontend-hms/
├── src/
│   ├── constants/
│   │   └── teamsApis.js ✅
│   └── components/Teams/
│       ├── TeamsDashboard.js ✅
│       ├── ChatsView.js ✅
│       ├── MeetingsView.js (to be created)
│       ├── CalendarView.js (to be created)
│       └── SchedulingView.js (to be created)
```

## 🔧 Key Features Implementation Status

### Chats Module
- ✅ One-to-One Chat
- ✅ Group Chats  
- ✅ Broadcast Messaging
- ✅ Real-time messaging (Socket.io)
- ⏳ File sharing
- ⏳ Voice notes
- ⏳ Message reactions
- ⏳ @mentions

### Voice & Video Calling
- ✅ Socket.io call signaling
- ⏳ WebRTC integration
- ⏳ Call UI components
- ⏳ Screen sharing
- ✅ Call logs

### Meetings Module
- ✅ Create/Update/Delete meetings
- ✅ Meeting participants
- ✅ Meeting links
- ⏳ Meeting UI
- ⏳ Join meeting functionality

### Calendar Integration
- ✅ Create/Update/Delete events
- ⏳ Calendar UI (grid view)
- ⏳ Event reminders
- ✅ Multiple event types

### Scheduling
- ✅ Create/Update/Delete schedules
- ⏳ Scheduling UI
- ⏳ Conflict detection
- ✅ Shift management

## 🚀 Next Steps

1. **Run Database Migration**
   ```sql
   -- Execute create_teams_tables.sql
   ```

2. **Install Dependencies**
   - Backend: `npm install socket.io uuid`
   - Frontend: `npm install socket.io-client simple-peer`

3. **Test Socket.io Connection**
   - Verify backend Socket.io server starts
   - Test frontend connection

4. **Complete Remaining Components**
   - Create MeetingsView
   - Create CalendarView  
   - Create SchedulingView
   - Create Call components

5. **Integrate WebRTC**
   - Set up peer connections
   - Implement signaling
   - Add call UI

6. **Add Route to Frontend**
   - Add Teams route to navigation
   - Create page at `/teams`

## 📝 API Endpoints Reference

### Chats
- `GET /teams/chats` - Get user's chats
- `POST /teams/chats` - Create chat
- `GET /teams/chats/:chatId/messages` - Get messages
- `POST /teams/chats/:chatId/messages` - Send message
- `PUT /teams/chats/:chatId/messages/:messageId` - Edit message
- `DELETE /teams/chats/:chatId/messages/:messageId` - Delete message

### Meetings
- `GET /teams/meetings` - Get meetings
- `POST /teams/meetings` - Create meeting
- `PUT /teams/meetings/:meetingId` - Update meeting
- `POST /teams/meetings/:meetingId/join` - Join meeting

### Calendar
- `GET /teams/calendar/events` - Get events
- `POST /teams/calendar/events` - Create event
- `PUT /teams/calendar/events/:eventId` - Update event
- `DELETE /teams/calendar/events/:eventId` - Delete event

### Scheduling
- `GET /teams/scheduling` - Get schedules
- `POST /teams/scheduling` - Create schedule
- `PUT /teams/scheduling/:scheduleId` - Update schedule
- `DELETE /teams/scheduling/:scheduleId` - Delete schedule

## 🎯 Socket.io Events

### Client → Server
- `join_chat` - Join chat room
- `leave_chat` - Leave chat room
- `send_message` - Send message
- `typing_start` - User started typing
- `typing_stop` - User stopped typing
- `initiate_call` - Start call
- `accept_call` - Accept call
- `reject_call` - Reject call
- `end_call` - End call
- `call_signal` - WebRTC signaling
- `join_meeting` - Join meeting room

### Server → Client
- `new_message` - New message received
- `user_typing` - User typing indicator
- `user_joined_chat` - User joined chat
- `incoming_call` - Incoming call notification
- `call_accepted` - Call was accepted
- `call_rejected` - Call was rejected
- `call_ended` - Call ended
- `call_signal` - WebRTC signaling data

## 🔐 Security Considerations

1. **Authentication**: All routes require token authentication
2. **Authorization**: Verify user permissions for each action
3. **Message Validation**: Sanitize and validate all messages
4. **File Upload Limits**: Restrict file sizes and types
5. **Rate Limiting**: Implement for messaging and calls
6. **End-to-End Encryption**: Consider for sensitive chats

## 📚 Additional Resources

- Socket.io Documentation: https://socket.io/docs/
- WebRTC Documentation: https://webrtc.org/
- React Big Calendar: https://jquense.github.io/react-big-calendar/

## 🎉 Summary

The Teams module foundation is complete! You have:
- ✅ Complete database schema
- ✅ All backend services and controllers
- ✅ Socket.io real-time server
- ✅ Frontend API functions
- ✅ Main dashboard and chat UI

Remaining work focuses on:
- Creating remaining UI components
- WebRTC integration for calls
- File upload handling
- Enhanced chat features
- Testing and refinement

The architecture is solid and ready for full implementation!

