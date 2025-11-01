# 🔐 Environment Variables Guide

## 📋 For Vercel Deployment

### **Required Environment Variables:**

Add these in **Vercel Project Settings > Environment Variables**:

#### **1. PayPal Client ID (REQUIRED)**
```
VITE_PAYPAL_CLIENT_ID=AfIKN_uTLh6n04vCgjvlvmCkl7KpgJolXt0XsmLMDgLSDAv1ZfCFgPbJBNWsR2Pc1dECgghywJyCJtzt
```
- **Where to get:** https://developer.paypal.com/dashboard/applications
- **Status:** Already configured with fallback
- **Priority:** ⚠️ **HIGH** - PayPal won't work without this

---

#### **2. Firebase Configuration (Optional - has fallbacks)**

These are optional since the code has fallback values, but recommended for production:

```
VITE_FIREBASE_API_KEY=AIzaSyDNo2IxShyuJpOpQVQb5oO4nTH05nfrFlc
VITE_FIREBASE_AUTH_DOMAIN=auratech-f8365.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=auratech-f8365
VITE_FIREBASE_STORAGE_BUCKET=auratech-f8365.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=370977821738
VITE_FIREBASE_APP_ID=1:370977821738:web:6e2780aa894a6c22ab9f53
VITE_FIREBASE_MEASUREMENT_ID=G-8PH13H31P9
```

- **Status:** Configured with fallbacks
- **Priority:** ✅ **LOW** - Will work without these

---

## 🚀 How to Add Environment Variables in Vercel

### **Step 1: Go to Project Settings**
1. Open your Vercel dashboard
2. Select your project
3. Go to **Settings** > **Environment Variables**

### **Step 2: Add Each Variable**
1. Click **"Add New"**
2. Enter the variable name (e.g., `VITE_PAYPAL_CLIENT_ID`)
3. Enter the value (e.g., `AfIKN_uTLh6n04vCgjvlvmCkl7KpgJolXt0XsmLMDgLSDAv1ZfCFgPbJBNWsR2Pc1dECgghywJyCJtzt`)
4. Select environments:
   - ✅ **Production** (required)
   - ✅ **Preview** (optional)
   - ✅ **Development** (optional)
5. Click **"Save"**

### **Step 3: Redeploy**
After adding environment variables:
1. Go to **Deployments**
2. Click the **"..."** menu on your latest deployment
3. Click **"Redeploy"**

---

## ✅ Verification

### **After Adding Environment Variables:**

1. **Check PayPal:**
   - Go to checkout page
   - Should see: "✅ Production environment - Full PayPal functionality enabled"
   - PayPal button should appear

2. **Check Console:**
   - Open browser console (F12)
   - Should see: "✅ PayPal SDK loaded successfully"
   - No errors about missing client ID

3. **Check Build Logs:**
   - Go to Vercel deployment logs
   - Should see successful build
   - No environment variable errors

---

## 🔍 Current Configuration Status

### **PayPal:**
- ✅ Client ID configured
- ✅ Fallback value available
- ⚠️ **Set environment variable for production**

### **Firebase:**
- ✅ All configs have fallbacks
- ✅ Will work without environment variables
- ✅ Optional to set for better management

---

## 💡 Notes

1. **VITE_ Prefix:**
   - All environment variables must start with `VITE_` to be accessible in the client-side code
   - This is a Vite requirement

2. **Build Time vs Runtime:**
   - Environment variables are embedded at build time
   - You need to redeploy after adding/changing variables

3. **Security:**
   - Never commit environment variables to git
   - Use Vercel's environment variables feature
   - The `.env.local` file is already in `.gitignore`

4. **Fallback Values:**
   - Code has fallback values for all configurations
   - PayPal will work even without environment variable (uses fallback)
   - But it's best practice to use environment variables

---

## 🎯 Quick Setup Checklist

- [ ] Add `VITE_PAYPAL_CLIENT_ID` to Vercel environment variables
- [ ] (Optional) Add Firebase environment variables
- [ ] Redeploy your project
- [ ] Test PayPal on checkout page
- [ ] Verify no console errors
- [ ] Test complete checkout flow

---

## 📞 Need Help?

If you encounter issues:
1. Check Vercel build logs
2. Check browser console for errors
3. Verify environment variables are set correctly
4. Ensure you redeployed after adding variables

