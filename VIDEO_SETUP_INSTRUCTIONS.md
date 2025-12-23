# Video Setup Instructions for vid12

## Current Issue
The video file `vid12` is not being found. Here's how to fix it:

## Step 1: Check File Location
Your video file should be in the `public` folder:
```
Auratech/
  └── public/
      └── vid12.mp4  (or .webm, .mov, .avi)
```

## Step 2: Verify File Name
The file must be named exactly one of these:
- `vid12.mp4` ✅ (Recommended - most compatible)
- `vid12.webm`
- `vid12.mov`
- `vid12.avi`
- `vid12.MP4` (uppercase extension)
- `vid12.WEBM`
- `vid12.MOV`

## Step 3: Check File Extension
Make sure the file has the correct extension. Common issues:
- ❌ `vid12` (no extension)
- ❌ `vid12.video`
- ❌ `vid12.mp4.mp4` (double extension)
- ✅ `vid12.mp4` (correct)

## Step 4: Restart Development Server
After adding the video file:
1. Stop your development server (Ctrl+C)
2. Start it again: `npm run dev` or `vite`
3. Hard refresh browser: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

## Step 5: Check Browser Console
Open browser console (F12) and look for:
- ✅ `🔄 Video loading started...` - Video is being loaded
- ✅ `✅ Video loaded successfully` - Video loaded
- ✅ `✅ Video metadata loaded, duration: X` - Video ready
- ❌ `❌ Video loading error:` - There's an error (check the error message)

## Common Issues & Solutions

### Issue 1: File Not Found (404 Error)
**Solution:** Make sure the file is in the `public` folder, not `src` or root folder.

### Issue 2: Video Format Not Supported
**Solution:** Convert to MP4 format (H.264 codec) - most compatible format.

### Issue 3: File Too Large
**Solution:** Compress the video. Recommended size: under 10MB for web.

### Issue 4: CORS Error
**Solution:** Files in `public` folder should work without CORS issues. If you see CORS errors, the file might be in the wrong location.

## Testing
1. Open browser console (F12)
2. Navigate to the About section
3. Check console for video loading messages
4. If you see errors, share them and I can help fix

## Quick Test
Try accessing the video directly in browser:
- `http://localhost:5173/vid12.mp4` (or your dev server URL)
- If this works, the video file is correct
- If this gives 404, the file is not in the public folder

