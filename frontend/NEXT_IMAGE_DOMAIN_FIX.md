# Next.js Image Domain Configuration Fix

## Issue
The frontend was throwing an error when trying to load images from "encrypted-tbn3.gstatic.com":
```
Error: Invalid src prop (https://encrypted-tbn3.gstatic.com/images...) on `next/image`, hostname "encrypted-tbn3.gstatic.com" is not configured under images in your `next.config.js`
```

## Root Cause
The hostname "encrypted-tbn3.gstatic.com" was not included in the allowed image domains in the Next.js configuration.

## Solution
Added the missing domain to the `remotePatterns` array in `next.config.ts`:

```typescript
{
  protocol: 'https',
  hostname: 'encrypted-tbn3.gstatic.com',
  port: '',
  pathname: '/**',
},
```

## Files Modified
- `/frontend/next.config.ts` - Added encrypted-tbn3.gstatic.com to allowed image domains

## Current Allowed Domains
The Next.js configuration now allows images from:
- `images.unsplash.com`
- `via.placeholder.com`
- `**.amazonaws.com`
- `localhost`
- `encrypted-tbn3.gstatic.com`

## Status
✅ **FIXED** - The Next.js development server has been restarted and the image domain configuration is now complete.

## Next Steps
- No further action required for this issue
- The admin portal should now be able to load images from all configured domains without errors
