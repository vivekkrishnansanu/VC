# Testing Guide

## Quick Start

1. **Start the development server** (if not already running):
   ```bash
   npm run dev
   ```

2. **Open your browser**: http://localhost:3000

## Test Scenarios

### 1. Login Flow

**Test as Implementation Lead:**
- Go to: http://localhost:3000/login
- Enter:
  - Name: `Implementation Lead`
  - Email: `lead@company.com` (or any email with `@company.com` or `implementation`)
- Click "Continue"
- Should redirect to: `/implementation-lead/dashboard`

**Test as Customer:**
- Go to: http://localhost:3000/login
- Enter:
  - Name: `John Customer`
  - Email: `customer@example.com` (any email without `@company.com`)
- Click "Continue"
- Should redirect to: `/customer/dashboard`

### 2. Implementation Lead Dashboard

**URL:** http://localhost:3000/implementation-lead/dashboard

**What to test:**
- ✅ View all accounts
- ✅ See account statistics (Total Accounts, Total Locations, Pending Approvals)
- ✅ See onboarding progress per account
- ✅ Click "Create Account" button
- ✅ View account details (if account detail page exists)

### 3. Create Account Flow

**URL:** http://localhost:3000/implementation-lead/accounts/create

**What to test:**
- ✅ Fill in Account Details:
  - Account Name
  - Total Locations
  - Product Type (CS VoiceStack or VoiceStack)
  - If CS VoiceStack: AccountId field appears
- ✅ Add Primary POC (name, phone, email)
- ✅ Add additional contacts
- ✅ Submit form
- ✅ Verify account appears in dashboard

### 4. Customer Dashboard

**URL:** http://localhost:3000/customer/dashboard

**What to test:**
- ✅ View assigned locations
- ✅ See location status badges
- ✅ Click "Start Onboarding" or "Continue Onboarding" for a location
- ✅ Verify navigation to onboarding wizard

### 5. Onboarding Wizard (6 Steps)

**URL:** http://localhost:3000/customer/onboarding/[locationId]

**Example:** http://localhost:3000/customer/onboarding/location-1

#### Step 1: Basic Details
- ✅ Fill POC information (name, email, phone)
- ✅ Select preferred contact medium
- ✅ Enter practice management software
- ✅ Test "Copy from Previous Location" button
- ✅ Click "Next" to proceed

#### Step 2: Phone System
- ✅ Select phone system type (Traditional or VoIP)
- ✅ If Traditional: Enter details
- ✅ If VoIP: Select provider from dropdown
- ✅ Answer call forwarding question (should auto-fill if known)
- ✅ Answer FAX questions
- ✅ Test helper dialogs (info icons)
- ✅ Click "Next" to proceed

#### Step 3: Devices
- ✅ Enter total number of devices
- ✅ Select assignment strategy
- ✅ Test assignment strategy helper dialog
- ✅ Add devices:
  - Select brand (Yealink, Polycom, Other)
  - Select model
  - Choose ownership (Owned/Leased)
  - Choose assignment type
  - If assigned to user: Enter user details
  - Enter MAC address (test helper dialog)
  - Enter serial number
  - Select extension
- ✅ Test unsupported device detection (should highlight in red)
- ✅ Remove devices
- ✅ Click "Next" to proceed

#### Step 4: Working Hours
- ✅ Set working hours for each day
- ✅ Test "Copy Schedule" button
- ✅ Mark days as closed
- ✅ Click "Next" to proceed

#### Step 5: Call Flow
- ✅ Enter greeting message
- ✅ Toggle IVR on/off
- ✅ If IVR enabled:
  - Add IVR options
  - Configure each option (script, targets, retry attempts, wait time)
  - Set invalid selection script
  - Set after retries target
  - Set voicemail script
- ✅ If IVR disabled:
  - Set direct routing (users or extensions)
  - Set voicemail script
- ✅ Configure shared voicemail users
- ✅ Click "Next" to proceed

#### Step 6: Review & Submit
- ✅ Review all entered information
- ✅ Check validation status
- ✅ See any errors or warnings
- ✅ Test "Submit" button
- ✅ Confirm submission dialog
- ✅ Verify submission success

### 6. API Endpoints (Optional - for developers)

Test via browser console or Postman:

**Onboarding Session:**
- `GET /api/onboarding/session?locationId=location-1`
- `PATCH /api/onboarding/session` (with body)

**Device Validation:**
- `GET /api/devices/validate?brand=YEALINK`
- `POST /api/devices/validate` (with brand/model)

**Approvals:**
- `GET /api/approvals`
- `POST /api/approvals`
- `PATCH /api/approvals/[id]`

**Provisioning:**
- `GET /api/provisioning/[locationId]`

## Mock Data Available

The application uses mock data. Here are some test IDs:

**Locations:**
- `location-1` - Acme Medical - Main Office
- `location-2` - Acme Medical - Branch Office
- `location-3` - TechCorp - Headquarters

**Customer User:**
- `user-3` - Has access to locations

**Accounts:**
- `account-1` - Acme Medical Group
- `account-2` - TechCorp Solutions

## Common Issues & Solutions

### Issue: "Cannot read properties of undefined"
- **Solution:** Make sure you're logged in first
- **Solution:** Check browser console for specific error

### Issue: Dashboard shows "Loading..."
- **Solution:** Check if mock data is loading correctly
- **Solution:** Refresh the page

### Issue: Onboarding step not saving
- **Solution:** Check browser console for API errors
- **Solution:** Verify locationId is valid

### Issue: Form validation errors
- **Solution:** Fill all required fields (marked with *)
- **Solution:** Check field formats (email, phone, etc.)

## Browser Console Testing

Open browser DevTools (F12) and check:

1. **Network Tab:**
   - Verify API calls are being made
   - Check for 404 or 500 errors
   - Verify request/response payloads

2. **Console Tab:**
   - Check for JavaScript errors
   - Look for React warnings
   - Verify data loading

3. **Application Tab:**
   - Check localStorage for auth state
   - Verify user data is stored

## Expected Behavior

✅ **Authentication:**
- Login should work with any name/email
- User should be redirected based on email domain
- Session should persist on page refresh

✅ **Navigation:**
- All links should work
- Back/forward buttons should work
- Progress indicators should update

✅ **Form Validation:**
- Required fields should show errors
- Invalid formats should be caught
- Submit should be disabled until valid

✅ **Data Persistence:**
- Form data should save (mock - in memory)
- Progress should be maintained
- Step completion should be tracked

## Next Steps After Testing

1. **Report Issues:**
   - Note any bugs or unexpected behavior
   - Include browser console errors
   - Include steps to reproduce

2. **Test Edge Cases:**
   - Empty forms
   - Invalid data
   - Network errors (simulate offline)
   - Large data sets

3. **Performance:**
   - Test with many locations
   - Test with many devices
   - Check page load times

## Notes

- All data is **mock data** - changes won't persist after refresh
- Authentication is **mock** - no real security
- API endpoints use **mock services** - not connected to database
- This is a **development build** - not production-ready

Happy Testing! 🚀
