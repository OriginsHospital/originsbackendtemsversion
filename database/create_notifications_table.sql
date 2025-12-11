-- Create notifications_master table for Ortus Notifications Integration
CREATE TABLE IF NOT EXISTS notifications_master (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL COMMENT 'User who should receive this notification',
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'info' COMMENT 'Notification type: info, warning, success, error',
  isRead BOOLEAN NOT NULL DEFAULT 0,
  route VARCHAR(500) NULL COMMENT 'Route to navigate when notification is clicked',
  relatedId INT NULL COMMENT 'ID of related entity (e.g., userId for new user registration)',
  relatedType VARCHAR(100) NULL COMMENT 'Type of related entity (e.g., user_registration)',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_userId (userId),
  INDEX idx_isRead (isRead),
  INDEX idx_createdAt (createdAt)
) COMMENT 'Table to store notifications for users';

