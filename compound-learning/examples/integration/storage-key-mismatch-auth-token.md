---
title: Storage Key Mismatch Causes Auth Token Not Found
category: integration
tags: [auth, localstorage, token, 401, unauthorized]
date: 2026-01-23
---

# Storage Key Mismatch Causes Auth Token Not Found

## Symptom

- Specific API calls fail with 401 Unauthorized while others succeed
- Error: "Could not validate credentials"
- Some authenticated requests work, but others (e.g., file uploads) fail
- Token is definitely valid—other endpoints work in the same session

```
POST https://api.example.com/upload 401 (Unauthorized)
Failed to upload: Error: Could not validate credentials
```

## Root Cause

Different parts of the codebase use different storage keys for the auth token:

**Auth module stores token as:**
```typescript
localStorage.setItem('auth.token', token);  // Correct key
```

**File upload retrieves token as:**
```typescript
const token = localStorage.getItem('auth_token');  // WRONG KEY!
```

This happens when code bypasses the standard HTTP client (e.g., to send `multipart/form-data`) and manually retrieves the token using a hardcoded key that doesn't match.

## Solution

Use the same storage key constant everywhere:

```typescript
// constants/storage.ts
export const STORAGE_KEYS = {
  TOKEN: 'auth.token',
  REFRESH_TOKEN: 'auth.refresh_token',
  USER: 'auth.user',
} as const;

// Everywhere that needs the token
import { STORAGE_KEYS } from '@/constants/storage';
const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
```

Even better—create a storage utility:
```typescript
export const authStorage = {
  getToken: () => localStorage.getItem(STORAGE_KEYS.TOKEN),
  setToken: (token: string) => localStorage.setItem(STORAGE_KEYS.TOKEN, token),
  clearToken: () => localStorage.removeItem(STORAGE_KEYS.TOKEN),
};
```

## Prevention

1. **Single source of truth**: Define storage keys in one constants file
2. **Avoid direct localStorage access**: Use wrapper utilities
3. **Code review checklist**: Search for raw `localStorage.getItem` calls
4. **Lint rule**: Warn on hardcoded storage key strings
   ```bash
   grep -r "getItem.*['\"]auth" src/ && echo "Use STORAGE_KEYS constant" && exit 1
   ```

## Related

- This commonly happens when file uploads use raw `fetch()` instead of the configured HTTP client
- HTTP clients typically have interceptors that add auth headers automatically
- When bypassing the client, you must manually handle auth—and that's where mismatches creep in
