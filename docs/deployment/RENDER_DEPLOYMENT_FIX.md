# Render Deployment Path Fix

## Issue

Render deployment was failing with:
```
Error: Cannot find module '/opt/render/project/src/src/backend/dist/index.js'
```

## Root Cause

The TypeScript build outputs to `dist/backend/` at project root, but the start script was looking for `dist/index.js` relative to the backend directory.

**Build Output**: `/opt/render/project/src/dist/backend/index.js`  
**Start Script Was Looking For**: `/opt/render/project/src/src/backend/dist/index.js`

## Solution

Updated `src/backend/package.json` start script:

**Before:**
```json
"start": "node dist/index.js"
```

**After:**
```json
"start": "node ../../dist/backend/index.js"
```

## Verification

Build and start flow:
1. `npm run build:backend` → Runs from root, builds to `dist/backend/`
2. `npm run start:backend` → Runs `cd src/backend && npm start`
3. `npm start` (in backend) → Runs `node ../../dist/backend/index.js`
4. Path resolves: `src/backend/` + `../../dist/backend/index.js` = `dist/backend/index.js` ✅

## Render Configuration

No changes needed on Render dashboard. The existing configuration works:

```yaml
buildCommand: npm ci && npm run build:backend
startCommand: npm run start:backend
```

## Testing Locally

```bash
# Build
npm run build:backend

# Verify file exists
ls -la dist/backend/index.js

# Test start command
cd src/backend && npm start
```

Expected: Server starts (may fail due to missing env vars, but proves path is correct)

---

**Status**: ✅ Fixed  
**Date**: February 7, 2026
