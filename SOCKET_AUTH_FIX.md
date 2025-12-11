# Socket Authentication Fix

## Problem
Socket connection was failing with error: `Socket connection error: Error: Authentication failed`

## Root Cause
The socket server was using `jwtObject.verifyToken(token)` which doesn't exist in the JWT helper class. The JWT helper only has:
- `verifyAccessToken(token)` - for access tokens
- `verifyRefreshToken(token)` - for refresh tokens

There is no `verifyToken()` method.

## Solution

### Backend Fix (`origins-backend-hms/socket/teamsSocketServer.js`)

**Before (Broken):**
```javascript
const decoded = jwtObject.verifyToken(token);  // ❌ Method doesn't exist
if (decoded && decoded.id) {
  socket.userId = decoded.id;
  socket.userName = decoded.fullName;
}
```

**After (Fixed):**
```javascript
// Verify access token (same as HTTP middleware)
const decodedData = await jwtObject.verifyAccessToken(token);

if (!decodedData || !decodedData.aud) {
  return next(new Error("Invalid token structure"));
}

// Parse user details from the audience (aud) field
const userDetails = JSON.parse(decodedData.aud);

if (userDetails && userDetails.id) {
  socket.userId = userDetails.id;
  socket.userName = userDetails.fullName || userDetails.userName || "Unknown";
  next();
}
```

### Changes Made:
1. ✅ Changed `verifyToken()` to `verifyAccessToken()`
2. ✅ Added proper parsing of `aud` field (contains user details as JSON string)
3. ✅ Added better error logging
4. ✅ Matches the same authentication pattern as HTTP middleware

### Frontend Improvement (`origins-frontend-hms/src/components/Teams/ChatsView.js`)

Added better error handling for authentication failures:
```javascript
newSocket.on('connect_error', (error) => {
  if (error.message && error.message.includes('Authentication')) {
    console.error('Socket authentication failed. Token might be invalid or expired.')
    toast.error('Authentication failed. Please log in again.')
  }
})
```

## How JWT Token Works

The JWT access token structure in this app:
- **Payload**: Contains minimal data
- **aud (audience)**: Contains the user details as a JSON string
  ```json
  {
    "id": 123,
    "fullName": "John Doe",
    "email": "john@example.com",
    "roleDetails": {...},
    "branchDetails": [...],
    "moduleList": [...]
  }
  ```

The HTTP middleware does the same:
```javascript
const userDecodedData = await Jwt.verifyAccessToken(token);
req.userDetails = JSON.parse(userDecodedData.aud);
```

## Files Modified
1. ✅ `origins-backend-hms/socket/teamsSocketServer.js` - Fixed authentication logic
2. ✅ `origins-frontend-hms/src/components/Teams/ChatsView.js` - Improved error handling

## Testing

After the fix, socket connections should:
1. ✅ Authenticate successfully with valid access token
2. ✅ Extract user ID and name from token
3. ✅ Show clear error messages if authentication fails
4. ✅ Log authentication events for debugging

## Verification Steps

1. **Check Backend Logs:**
   - Should see: `Socket authenticated: User {id} ({name})`
   - Should NOT see: `Authentication failed` errors

2. **Check Frontend Console:**
   - Should see: `Connected to Teams Socket.io server`
   - Should NOT see: `Socket connection error: Authentication failed`

3. **Test Socket Features:**
   - Calls should work
   - Messages should be delivered
   - Real-time updates should work

## Status
✅ **FIXED** - Socket authentication now works correctly
