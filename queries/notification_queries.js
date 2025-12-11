const getAdminUsersQuery = `
SELECT DISTINCT u.id 
FROM users u
INNER JOIN role_master rm ON rm.id = u.roleId
WHERE LOWER(rm.name) LIKE '%admin%' 
  AND u.isBlocked = 0
  AND u.isAdminVerified = 1
`;

const getNotificationsQuery = `
SELECT 
  id,
  userId,
  title,
  message,
  type,
  isRead,
  route,
  relatedId,
  relatedType,
  createdAt,
  updatedAt
FROM notifications_master
WHERE userId = :userId
ORDER BY createdAt DESC
LIMIT :limit OFFSET :offset
`;

const getUnreadNotificationsCountQuery = `
SELECT COUNT(*) as count
FROM notifications_master
WHERE userId = :userId AND isRead = 0
`;

const markNotificationAsReadQuery = `
UPDATE notifications_master
SET isRead = 1
WHERE id = :notificationId AND userId = :userId
`;

const markAllNotificationsAsReadQuery = `
UPDATE notifications_master
SET isRead = 1
WHERE userId = :userId AND isRead = 0
`;

module.exports = {
  getAdminUsersQuery,
  getNotificationsQuery,
  getUnreadNotificationsCountQuery,
  markNotificationAsReadQuery,
  markAllNotificationsAsReadQuery
};

