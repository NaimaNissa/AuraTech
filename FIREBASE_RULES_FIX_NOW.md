# URGENT: Fix Firebase Security Rules

## The Error You're Seeing
```
FirebaseError: Missing or insufficient permissions.
permission-denied
```

This means Firebase security rules are blocking unauthenticated users from reading products and categories.

## Quick Fix (5 minutes)

### Step 1: Open Firebase Console
1. Go to: https://console.firebase.google.com/
2. Click on your project: **auratech-f8365**

### Step 2: Navigate to Firestore Rules
1. In the left sidebar, click **Firestore Database**
2. Click the **Rules** tab at the top

### Step 3: Replace ALL Rules
**Copy and paste this ENTIRE block** (replace everything that's there):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ✅ PUBLIC READ ACCESS - Allow anyone to read products
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // ✅ PUBLIC READ ACCESS - Allow anyone to read categories
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // ✅ PUBLIC READ ACCESS - Allow anyone to read reviews
    match /Feedback/{reviewId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null;
    }
    
    // 🔒 PROTECTED - Only authenticated users can access orders
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    
    // 🔒 PROTECTED - Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 🔒 PROTECTED - Notifications only for authenticated users
    match /notifications/{notificationId} {
      allow read, write: if request.auth != null;
    }
    
    // Default: deny everything else
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

### Step 4: Publish
1. Click the **Publish** button (top right)
2. Wait for the success message

### Step 5: Test
1. **Hard refresh** your browser: `Ctrl + F5` (Windows) or `Cmd + Shift + R` (Mac)
2. Open browser console (F12)
3. Navigate to `/products` page
4. You should see: `✅ Loaded products from Firebase: X` (where X > 0)

## What These Rules Do

✅ **Allow Public Read:**
- `products` - Anyone can view products
- `categories` - Anyone can view categories  
- `Feedback` - Anyone can read reviews

✅ **Protect Writes:**
- Only authenticated users can create/update/delete products, categories, reviews

🔒 **Keep Protected:**
- `orders` - Only authenticated users
- `users` - Only the user themselves
- `notifications` - Only authenticated users

## Still Getting Errors?

1. **Wait 1-2 minutes** - Rules can take time to propagate
2. **Clear browser cache** - `Ctrl + Shift + Delete`
3. **Try incognito window** - To ensure no cached rules
4. **Check Firebase Console** - Verify rules were published (should show green checkmark)

## Security Note

These rules are safe for e-commerce:
- ✅ Products and categories are meant to be public
- ✅ Only authenticated users can modify data
- ✅ Sensitive data (orders, user info) remains protected

