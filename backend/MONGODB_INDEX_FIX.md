# MongoDB Index Error Fix

## Problem
Getting error during registration:
```
E11000 duplicate key error collection: test.users index: username_1 dup key: { username: null }
```

## Root Cause
- MongoDB collection has a `username_1` index
- User model doesn't have a `username` field
- Multiple users trying to register get `null` for username
- Unique index prevents multiple `null` values

## Solution

### Step 1: Fix the MongoDB indexes
Run this script to remove the problematic index:

```bash
cd backend
node fix-user-indexes.js
```

This will:
- Connect to MongoDB
- List all current indexes
- Drop the `username_1` index if it exists
- Ensure the correct `email` index exists
- Show the final index state

### Step 2: Test Registration
After fixing indexes, test user registration:

```bash
cd backend
node test-login.js
```

## Manual Fix (Alternative)

If you prefer to fix it manually using MongoDB shell:

```bash
# Connect to MongoDB
mongo "your-mongodb-connection-string"

# Switch to your database
use test

# List current indexes
db.users.getIndexes()

# Drop the problematic index
db.users.dropIndex("username_1")

# Verify indexes
db.users.getIndexes()
```

## Expected Indexes After Fix

The users collection should only have these indexes:
- `_id_` (default MongoDB index)
- `email_1` (unique index for email field)

## Files Created
- `fix-user-indexes.js` - Script to automatically fix the index issue

## Why This Happened
This typically occurs when:
1. The User schema previously had a username field
2. Indexes were created manually during development
3. Schema evolved but indexes weren't updated

## Prevention
- Always manage indexes through the Mongoose schema
- Use `mongoose.connection.db.collection.dropIndex()` when removing fields
- Consider using MongoDB migrations for schema changes
