# Admin System Implementation Guide

## Overview

The admin system has been successfully implemented with user approval functionality. This system allows administrators to manage user accounts, approve new registrations, and maintain system security.

## Features Implemented

### Backend Features

1. **User Model Updates**
   - Added `role` field (user/admin)
   - Added `isApproved` field (boolean)
   - Added `approvedAt` and `approvedBy` fields for tracking

2. **Admin Authentication Middleware**
   - `isAdmin` - Checks if user has admin role
   - `isApproved` - Checks if user is approved (admins are always approved)

3. **Admin Controller**
   - User management (view, approve, reject, delete)
   - Role management (promote/demote users)
   - Dashboard statistics
   - User search and filtering

4. **Admin Routes**
   - `/api/admin/dashboard` - Admin dashboard stats
   - `/api/admin/users` - User management
   - `/api/admin/users/:id/approve` - Approve user
   - `/api/admin/users/:id/reject` - Reject user
   - `/api/admin/users/:id/role` - Update user role
   - `/api/admin/users/:id` - Delete user

5. **User Registration Flow**
   - New users are created with `isApproved: false`
   - Users cannot access protected routes until approved
   - Login is blocked for unapproved users

### Frontend Features

1. **Admin Dashboard**
   - Statistics overview (total users, approved, pending, etc.)
   - Recent users list
   - Quick access to user management

2. **User Management**
   - View all users with pagination
   - Search and filter users
   - Approve/reject pending users
   - Change user roles
   - Delete user accounts

3. **Admin Layout**
   - Dedicated admin sidebar
   - Admin-specific navigation
   - Responsive design

4. **User Experience**
   - Pending approval page for unapproved users
   - Admin panel link in main sidebar for admins
   - Clear status indicators

## Setup Instructions

### 1. Set Up Environment Variables

First, create the environment file:

```bash
cd backend
npm run setup-env
```

This will create a `.env` file with default values. You need to update the `MONGODB_URI` with your actual MongoDB connection string.

### 2. Create First Admin User

After setting up the environment variables, create the first admin user:

```bash
npm run create-admin
```

This will create an admin user with:
- Email: `admin@profitsummary.com`
- Password: `Admin123!`
- Role: `admin`
- Status: `approved`

### 3. Environment Variables

The setup script creates a `.env` file with these variables:

```env
NODE_ENV=development
PORT=5002
MONGODB_URI=mongodb://localhost:27017/profitsummary
JWT_SECRET=auto_generated_secret
```

**Important**: Update `MONGODB_URI` with your actual MongoDB connection string.

### 4. Start the Application

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## Usage Guide

### For Administrators

1. **Login as Admin**
   - Use the admin credentials created by the script
   - Access admin panel via sidebar or navigate to `/admin`

2. **Dashboard Overview**
   - View system statistics
   - See recent user registrations
   - Monitor system health

3. **User Management**
   - Navigate to "User Management" in admin panel
   - View all users with search and filter options
   - Approve pending users
   - Reject unwanted registrations
   - Change user roles
   - Delete user accounts

4. **User Approval Process**
   - New users appear in the pending list
   - Click "Approve" to activate their account
   - Click "Reject" to delete their account permanently
   - Users receive immediate access after approval

### For Regular Users

1. **Registration**
   - Users can register normally
   - Account is created but not approved
   - User sees pending approval message

2. **Login After Registration**
   - Users can login but see pending approval page
   - Cannot access main application features
   - Can check approval status

3. **After Approval**
   - Users receive full access to all features
   - Can create businesses, transactions, etc.
   - Normal application functionality

## Security Features

1. **Role-Based Access Control**
   - Admin routes are protected
   - Non-admin users cannot access admin panel
   - Regular users need approval to access features

2. **Approval Workflow**
   - All new users require admin approval
   - Admins can approve/reject users
   - Rejected users are permanently deleted

3. **Admin Protection**
   - Cannot delete the last admin user
   - Cannot demote the last admin user
   - Admin actions are logged

## API Endpoints

### Admin Endpoints (Protected)

```
GET    /api/admin/dashboard          - Get dashboard statistics
GET    /api/admin/users              - Get all users (with pagination/filters)
GET    /api/admin/users/:id          - Get specific user details
PUT    /api/admin/users/:id/approve  - Approve user account
PUT    /api/admin/users/:id/reject   - Reject user account
PUT    /api/admin/users/:id/role     - Update user role
DELETE /api/admin/users/:id          - Delete user account
```

### Query Parameters for User List

```
?page=1                    - Page number
?limit=10                  - Items per page
?role=user|admin          - Filter by role
?isApproved=true|false    - Filter by approval status
?search=term              - Search by name or email
```

## Database Schema Updates

The User model now includes:

```javascript
{
  // ... existing fields
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}
```

## Troubleshooting

### Common Issues

1. **Cannot Access Admin Panel**
   - Ensure user has admin role
   - Check if user is approved
   - Verify JWT token is valid

2. **Users Cannot Login After Registration**
   - Check if user is approved
   - Verify admin has approved the account
   - Check user role and status

3. **Admin Script Fails**
   - Ensure MongoDB is running
   - Check connection string in .env
   - Verify database permissions

### Error Messages

- "Access denied. Admin privileges required." - User is not an admin
- "Your account is pending approval." - User needs admin approval
- "Cannot delete the last admin user." - System protection in place

## Future Enhancements

Potential improvements for the admin system:

1. **Email Notifications**
   - Notify users when approved/rejected
   - Send admin alerts for new registrations

2. **Audit Logging**
   - Track all admin actions
   - User activity monitoring

3. **Bulk Operations**
   - Approve/reject multiple users
   - Bulk role changes

4. **Advanced Filtering**
   - Date range filters
   - More detailed user search

5. **User Communication**
   - Admin messages to users
   - Rejection reason system

## Support

For issues or questions about the admin system:

1. Check the console logs for errors
2. Verify database connections
3. Ensure all environment variables are set
4. Check user roles and permissions

The admin system is now fully functional and ready for production use!
