# Address Verification Setup Guide

This application includes address verification functionality that uses Google Maps Geocoding API to verify that shipping addresses are real and valid.

## Features

- ✅ Real-time address verification using Google Maps API
- ✅ Address suggestions when verification finds a better match
- ✅ Visual feedback with color-coded status indicators
- ✅ Prevents checkout with unverified addresses (with user confirmation)
- ✅ Fallback to basic validation if API key is not configured

## Setup Instructions

### Step 1: Get a Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Library**
4. Search for "Geocoding API" and click on it
5. Click **Enable** to enable the API for your project
6. Go to **APIs & Services** > **Credentials**
7. Click **Create Credentials** > **API Key**
8. Copy your API key

### Step 2: Configure API Key Restrictions (Recommended)

For security, restrict your API key:

1. Click on your API key in the Credentials page
2. Under **API restrictions**, select **Restrict key**
3. Choose **Geocoding API** from the list
4. Under **Application restrictions**, you can:
   - Restrict to specific HTTP referrers (for web apps)
   - Restrict to specific IP addresses (for server-side)
5. Click **Save**

### Step 3: Add API Key to Your Project

Create a `.env` file in the root of your project (if it doesn't exist) and add:

```env
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Important:** 
- Never commit your `.env` file to version control
- Add `.env` to your `.gitignore` file
- The `VITE_` prefix is required for Vite to expose the variable to the frontend

### Step 4: Restart Your Development Server

After adding the API key, restart your development server:

```bash
npm run dev
```

## How It Works

### For Users

1. **Fill in Address Fields**: User enters their shipping address (street, city, state, ZIP code, country)

2. **Click "Verify Address"**: User clicks the "Verify Address" button next to the address field

3. **Verification Results**:
   - ✅ **Valid Address**: Shows green confirmation with verified address
   - ⚠️ **Suggested Address**: Shows yellow warning with suggested corrected address
   - ❌ **Invalid Address**: Shows error message if address cannot be found

4. **Accept Suggestions**: If a better address is suggested, user can click "Use This Address" to automatically update their form

5. **Checkout Protection**: If address is not verified, user will see a warning and confirmation prompt before proceeding

### For Developers

The address verification service (`src/lib/addressVerificationService.js`) provides:

- `verifyAddress(addressData)`: Main function to verify an address
- Returns verification result with:
  - `isValid`: Boolean indicating if address is valid
  - `formattedAddress`: Google's formatted version of the address
  - `verifiedAddress`: Structured address components
  - `suggestions`: Array of suggested addresses if input doesn't match exactly
  - `confidence`: Confidence level (high/medium/low)
  - `message`: User-friendly message

### Fallback Behavior

If the Google Maps API key is not configured:
- The system falls back to basic validation (format checking)
- Users can still proceed with checkout
- A warning is logged in the console

## API Costs

Google Maps Geocoding API pricing (as of 2024):
- **Free tier**: $200 credit per month (covers ~40,000 requests)
- **After free tier**: $5.00 per 1,000 requests

**Note**: Address verification only runs when user clicks "Verify Address", not automatically on every keystroke, to minimize API calls.

## Troubleshooting

### Address Verification Not Working

1. **Check API Key**: Ensure `VITE_GOOGLE_MAPS_API_KEY` is set in your `.env` file
2. **Check API Status**: Verify Geocoding API is enabled in Google Cloud Console
3. **Check Restrictions**: Ensure API key restrictions allow your domain/IP
4. **Check Console**: Look for error messages in browser console

### Common Errors

- **"ZERO_RESULTS"**: Address not found - user should check their input
- **"REQUEST_DENIED"**: API key issue - check key configuration
- **"OVER_QUERY_LIMIT"**: API quota exceeded - check billing/quotas

## Security Notes

- API key is exposed to frontend (required for client-side verification)
- Use API key restrictions to limit usage
- Monitor API usage in Google Cloud Console
- Consider implementing rate limiting on your backend if needed

## Future Enhancements

Potential improvements:
- Auto-verify on form blur
- Address autocomplete suggestions
- Batch verification for multiple addresses
- Backend verification for sensitive operations
- Integration with shipping carrier APIs for delivery validation

