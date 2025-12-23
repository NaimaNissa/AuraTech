# Firebase Security Rules for Public Product Access

## Problem
Products are not loading for non-authenticated users. This is likely due to Firebase Firestore security rules blocking public read access.

## Solution
Update your Firebase Firestore security rules to allow public read access to the `products` and `categories` collections.

## Required Security Rules

Go to Firebase Console → Firestore Database → Rules and update with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow public read access to products (for non-authenticated users)
    match /products/{productId} {
      allow read: if true; // Anyone can read products
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    // Allow public read access to categories
    match /categories/{categoryId} {
      allow read: if true; // Anyone can read categories
      allow write: if request.auth != null; // Only authenticated users can write
    }
    
    // Keep other collections protected as needed
    match /orders/{orderId} {
      allow read, write: if request.auth != null;
    }
    
    match /Feedback/{reviewId} {
      allow read: if true; // Anyone can read reviews
      allow create: if request.auth != null; // Only authenticated users can create reviews
      allow update, delete: if request.auth != null; // Only authenticated users can update/delete
    }
    
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default: deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Steps to Apply

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `auratech-f8365`
3. Navigate to **Firestore Database** → **Rules** tab
4. Replace the existing rules with the rules above
5. Click **Publish**

## Important Notes

- The `products` and `categories` collections are set to allow public read access (`allow read: if true`)
- Only authenticated users can write to these collections
- Reviews (Feedback) can be read by anyone but only created/updated by authenticated users
- Orders and user data remain protected

## Testing

After updating the rules:
1. Clear browser cache
2. Try accessing `/products` without signing in
3. Products should now load for all users
4. Check browser console for any remaining errors




