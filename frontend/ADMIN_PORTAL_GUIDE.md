# Admin Portal User Guide

This document provides instructions for accessing and using the Admin Portal for the Amadeus Travel Platform.

## Accessing the Admin Portal

### Method 1: Direct Admin Login
1. Navigate to `/admin/login` in your browser
2. Enter the following credentials:
   - Email: `admin@example.com`
   - Password: `Admin@123`
3. Click "Sign In"

### Method 2: From the Main Navigation
1. Log in to the main website with admin credentials
2. Click on the "Admin Portal" button in the navigation bar
3. You'll be redirected to the admin dashboard

## Admin Portal Features

### Tour Package Management

#### Viewing Tour Packages
1. Go to `/admin/tour-packages` to see all tour packages
2. You'll see both published and unpublished packages
3. Use the search and filter options to find specific packages

#### Creating Tour Packages
1. Navigate to `/admin/tour-packages/create`
2. Fill in all required fields:
   - Title
   - Description
   - Price
   - Duration
   - Destinations
   - Featured Image URL
3. Set "Published" to make it immediately visible on the public site
4. Click "Create Tour Package"

#### Editing Tour Packages
1. From the tour packages list, click "Edit" on any package
2. Modify any details as needed
3. Click "Update Tour Package" to save changes

#### Publishing/Unpublishing Tour Packages
1. From the tour packages list, use the toggle switch to change publication status
2. Or edit the package and change the "Published" field

#### Previewing Tour Packages
1. From the tour packages list, click "Preview" on any package
2. You'll see how the package appears to public users

## User Permissions

The platform supports the following admin roles:

- **Super Admin**: Full access to all admin features, including user management
- **Admin**: Access to most admin features excluding user management
- **Website Editor**: Access to content management (tour packages, etc.)

## Troubleshooting

If you encounter any issues:

1. Make sure your browser has cookies enabled
2. Try clearing your browser cache and cookies
3. Check that the backend server is running
4. If you can't log in, use the password reset script in the backend directory
5. For persistent issues, check the browser console for error messages

## Security Precautions

- Always log out when finished using the admin portal
- Don't share your admin credentials
- Use a strong, unique password
- The system will automatically log you out after a period of inactivity
