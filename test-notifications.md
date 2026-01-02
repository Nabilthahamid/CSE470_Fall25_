# How to Test Notifications

## Quick Test Steps:

1. **Start your development server** (if not already running)
   ```bash
   npm run dev
   ```

2. **Login as Admin**
   - Navigate to `/auth/login`
   - Login with an admin account

3. **Check Admin Dashboard**
   - Navigate to `/admin`
   - Look for the "Notifications" section (yellow box)
   - If you see notifications, they are working!

4. **Create a Test Notification** (if none exist):
   - You need at least one product with stock <= 3
   - The system automatically creates low stock notifications
   - Or manually test by checking the database

5. **Test Mark as Read**:
   - Click "Mark Read" on any notification
   - It should disappear or become read

6. **Test Mark All Read**:
   - Click "Mark All Read" button
   - All notifications should become read

## What to Look For:

✅ **Working** - You should see:
- A yellow notification box on the admin dashboard (if unreadCount > 0)
- Notification title and message
- Product name (if related to a product)
- Timestamp
- "Mark Read" and "Mark All Read" buttons

❌ **Not Working** - You would see:
- No notification section (even if notifications exist in database)
- Error messages in browser console
- Errors in server logs

## Database Check (Optional):

If you have database access, you can check:
```sql
-- Check if notifications table exists and has data
SELECT * FROM notifications ORDER BY created_at DESC LIMIT 10;

-- Check unread notifications
SELECT COUNT(*) FROM notifications WHERE is_read = false;
```

