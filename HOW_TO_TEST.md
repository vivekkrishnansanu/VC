# How to Test the Application

## 🚀 Quick Start

1. **Make sure the server is running:**
   ```bash
   npm run dev
   ```
   You should see: `✓ Ready in XXXXms` and `Local: http://localhost:3000`

2. **Open your browser:** http://localhost:3000

---

## 📋 Testing Checklist

### ✅ 1. Login Flow

**Test as Implementation Lead:**
1. Go to: http://localhost:3000/login
2. Enter:
   - **Name:** `John Lead`
   - **Email:** `lead@company.com` (or any email with `@company.com`)
3. Click "Continue"
4. ✅ Should redirect to: `/implementation-lead/dashboard`

**Test as Customer:**
1. Go to: http://localhost:3000/login
2. Enter:
   - **Name:** `Jane Customer`
   - **Email:** `customer@example.com` (any email WITHOUT `@company.com`)
3. Click "Continue"
4. ✅ Should redirect to: `/customer/dashboard`

**What to verify:**
- ✅ Form validation works (try submitting empty form)
- ✅ Button enables when form is valid
- ✅ Redirect happens after login
- ✅ User stays logged in after page refresh

---

### ✅ 2. Implementation Lead Dashboard

**URL:** http://localhost:3000/implementation-lead/dashboard

**What to test:**
- ✅ See list of accounts
- ✅ View statistics (Total Accounts, Total Locations, Pending Approvals)
- ✅ See onboarding progress bars per account
- ✅ Click "Create Account" button
- ✅ View account details (if detail page exists)

**Expected:**
- Dashboard loads without errors
- Accounts are displayed in a table
- Progress indicators show completion percentage
- Statistics cards show correct numbers

---

### ✅ 3. Create Account Flow

**URL:** http://localhost:3000/implementation-lead/accounts/create

**Step 1: Account Details**
- ✅ Enter Account Name (e.g., "Acme Medical Group")
- ✅ Select Total Locations (e.g., 3)
- ✅ Select Product Type:
  - **CS VoiceStack:** Should show AccountId field
  - **VoiceStack:** Should NOT show AccountId field
- ✅ Fill AccountId if CS VoiceStack selected
- ✅ Click "Next"

**Step 2: Contacts**
- ✅ Fill Primary POC:
  - Name (e.g., "Alice Johnson")
  - Phone (e.g., "+1-555-0101")
  - Email (e.g., "alice@example.com")
- ✅ Add Additional Contacts:
  - Click "Add Contact"
  - Fill name, email, phone
  - Remove contact (X button)
- ✅ Click "Create Account"

**What to verify:**
- ✅ Form validation works
- ✅ Product type changes show/hide AccountId field
- ✅ Can add/remove multiple contacts
- ✅ Submit creates account and redirects to dashboard
- ✅ New account appears in dashboard

---

### ✅ 4. Customer Dashboard

**URL:** http://localhost:3000/customer/dashboard

**What to test:**
- ✅ See assigned locations (should show location cards)
- ✅ View location status badges:
  - NOT_STARTED (outline badge)
  - IN_PROGRESS (secondary badge)
  - PENDING_APPROVAL (secondary badge)
  - COMPLETED (default badge)
- ✅ Click "Start Onboarding" or "Continue Onboarding"
- ✅ Navigate to onboarding wizard

**Expected:**
- Dashboard shows location cards
- Each location has status badge
- Buttons appear based on status
- Can click to start/continue onboarding

---

### ✅ 5. Onboarding Wizard (6 Steps)

**URL:** http://localhost:3000/customer/onboarding/location-1

**Test Location IDs:**
- `location-1` - Acme Medical - Main Office
- `location-2` - Acme Medical - Branch Office
- `location-3` - TechCorp - Headquarters

#### Step 1: Basic Details ✅

**What to test:**
- ✅ Fill POC Name (e.g., "Bob Smith")
- ✅ Fill POC Email (e.g., "bob@example.com")
- ✅ Fill POC Phone (e.g., "+1-555-0202")
- ✅ Select Preferred Contact Medium (Email, Phone, SMS, etc.)
- ✅ Enter Practice Management Software (e.g., "Epic")
- ✅ Test "Copy from Previous Location" button:
  - Click button
  - Select a location from dropdown
  - Verify fields are populated
  - Verify fields remain editable
- ✅ Click "Next"

**What to verify:**
- ✅ Required field validation
- ✅ Email format validation
- ✅ Copy functionality works
- ✅ Can proceed to next step

---

#### Step 2: Phone System ✅

**What to test:**
- ✅ Select Phone System Type:
  - **Traditional:** Should show text field for details
  - **VoIP:** Should show dropdown with providers
- ✅ If Traditional:
  - Enter phone system details
- ✅ If VoIP:
  - Select provider from dropdown
  - Or select "Other" and enter custom provider
- ✅ Answer "Call Forwarding Supported?":
  - If phone system is known in master data, question may auto-fill
  - Click info icon to see helper dialog
- ✅ Answer "Do you use FAX?":
  - **Yes:** Enter fax number
  - **No:** Answer "Do you want FAX in VoiceStack?"
- ✅ Click "Next"

**What to verify:**
- ✅ Conditional fields appear/disappear correctly
- ✅ Smart skip works (if phone system known)
- ✅ Helper dialogs open
- ✅ Validation works

---

#### Step 3: Devices ✅

**What to test:**
- ✅ Enter Total Number of Devices (e.g., 5)
- ✅ Select Assignment Strategy:
  - Click info icon to see explanation
  - Select: "Assigned to User", "Assigned to Extension", or "Common Phone"
- ✅ Add Devices:
  - Click "Add Device"
  - Select Brand (Yealink, Polycom, Other)
  - Select Model (dropdown based on brand)
  - Select Ownership (Owned/Leased)
  - Select Assignment Type
  - If "Assigned to User":
    - Enter User First Name
    - Enter User Last Name
    - Enter User Email
  - Enter MAC Address (click info icon for format help)
  - Enter Serial Number
  - Select Extension (if applicable)
- ✅ Test Unsupported Device:
  - Select unsupported brand/model combination
  - ✅ Device should highlight in RED
  - ✅ Warning should appear
- ✅ Remove device (X button)
- ✅ Click "Next"

**What to verify:**
- ✅ Device validation works
- ✅ Unsupported devices are highlighted
- ✅ Assignment strategy affects required fields
- ✅ Can add/remove multiple devices
- ✅ Extension dropdown works

---

#### Step 4: Working Hours ✅

**What to test:**
- ✅ Set working hours for each day:
  - Monday: 9:00 AM - 5:00 PM
  - Tuesday: 9:00 AM - 5:00 PM
  - etc.
- ✅ Test "Copy Schedule" button:
  - Set Monday schedule
  - Click "Copy Schedule"
  - Select days to copy to
  - Verify schedule is copied
- ✅ Mark days as closed:
  - Uncheck "Open" checkbox
  - Verify time fields are hidden
- ✅ Click "Next"

**What to verify:**
- ✅ Time pickers work
- ✅ Copy schedule works
- ✅ Closed days work correctly
- ✅ Validation prevents time overlaps

---

#### Step 5: Call Flow ✅

**What to test:**

**Option A: With IVR**
- ✅ Enter Greeting Message (e.g., "Thank you for calling...")
- ✅ Toggle "Has IVR?" to YES
- ✅ Add IVR Options:
  - Click "Add Option"
  - Enter Option Number (e.g., "1")
  - Enter Script (e.g., "Press 1 for Sales")
  - Select Ring Type (Users or Extensions)
  - Add Targets (select users/extensions)
  - Set Retry Attempts (e.g., 3)
  - Set Wait Time (e.g., 30 seconds)
  - Enter Invalid Selection Script
  - Set After Retries Target
  - Enter Voicemail Script
- ✅ Add multiple options (1, 2, 3, etc.)
- ✅ Remove options

**Option B: Without IVR**
- ✅ Toggle "Has IVR?" to NO
- ✅ Select Direct Routing:
  - Ring Type (Users or Extensions)
  - Add Targets
- ✅ Enter Voicemail Script
- ✅ Add Shared Voicemail Users

**What to verify:**
- ✅ IVR toggle shows/hides correct fields
- ✅ Can add/remove multiple IVR options
- ✅ Target selection works
- ✅ All fields are validated
- ✅ Click "Next"

---

#### Step 6: Review & Submit ✅

**What to test:**
- ✅ Review all entered information:
  - Basic Details
  - Phone System
  - Devices (count, unsupported devices highlighted)
  - Working Hours
  - Call Flow
- ✅ Check validation status:
  - ✅ Green checkmarks for valid sections
  - ⚠️ Warnings for issues
  - ❌ Errors for invalid data
- ✅ See unsupported device alerts (if any)
- ✅ Test Submit:
  - Click "Submit"
  - Confirm in dialog
  - ✅ Should submit successfully
  - ✅ Should show success message
  - ✅ Should redirect or show completion

**What to verify:**
- ✅ All data is displayed correctly
- ✅ Validation errors are shown
- ✅ Unsupported devices are highlighted
- ✅ Submit button is disabled if validation fails
- ✅ Submit works when valid

---

### ✅ 6. Navigation & Progress

**What to test:**
- ✅ Progress indicator at top shows current step
- ✅ Can click on completed steps to go back
- ✅ "Previous" button works
- ✅ "Next" button works
- ✅ Step completion is tracked
- ✅ Can save and resume later

---

### ✅ 7. Helper Features

**What to test:**
- ✅ Info icons (ℹ️) open helper dialogs:
  - Assignment Strategy explanation
  - MAC Address format help
  - Call Forwarding explanation
- ✅ Copy from Previous Location works
- ✅ Copy Schedule works
- ✅ Smart skips work (questions auto-filled)

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot read properties of undefined"
**Solution:** Make sure you're logged in first

### Issue: Dashboard shows "Loading..." forever
**Solution:** 
- Check browser console for errors
- Refresh the page
- Clear browser cache

### Issue: Form won't submit
**Solution:**
- Check for validation errors (red text)
- Fill all required fields (marked with *)
- Check browser console for errors

### Issue: Redirect loop
**Solution:**
- Clear browser localStorage
- Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
- Check if you're already logged in

### Issue: "Maximum update depth exceeded"
**Solution:**
- Hard refresh the page
- Clear browser cache
- Restart the dev server

---

## 🔍 Browser DevTools Testing

**Open DevTools (F12) and check:**

1. **Console Tab:**
   - Look for errors (red text)
   - Check for warnings (yellow text)
   - Verify API calls are being made

2. **Network Tab:**
   - See API requests/responses
   - Check for 404 or 500 errors
   - Verify data is being sent/received

3. **Application Tab:**
   - Check localStorage for auth data
   - Verify user data is stored

---

## 📊 Test Data Available

**Mock Locations:**
- `location-1` - Acme Medical - Main Office
- `location-2` - Acme Medical - Branch Office  
- `location-3` - TechCorp - Headquarters

**Mock Customer:**
- User ID: `user-3`
- Has access to locations

**Mock Accounts:**
- `account-1` - Acme Medical Group
- `account-2` - TechCorp Solutions

---

## ✅ Success Criteria

**Login:**
- ✅ Can log in as both roles
- ✅ Redirects to correct dashboard
- ✅ Session persists on refresh

**Implementation Lead:**
- ✅ Can view all accounts
- ✅ Can create new account
- ✅ Can see onboarding progress

**Customer:**
- ✅ Can see assigned locations
- ✅ Can start onboarding
- ✅ Can complete all 6 steps
- ✅ Can submit onboarding

**Forms:**
- ✅ Validation works
- ✅ Conditional fields work
- ✅ Helper dialogs work
- ✅ Copy features work

**Navigation:**
- ✅ Progress indicator works
- ✅ Can navigate between steps
- ✅ Can go back to previous steps

---

## 🚨 If Something Doesn't Work

1. **Check browser console** (F12 → Console tab)
2. **Check network requests** (F12 → Network tab)
3. **Hard refresh** (Cmd+Shift+R / Ctrl+Shift+R)
4. **Clear localStorage:**
   ```javascript
   localStorage.clear()
   ```
5. **Restart dev server:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

---

## 📝 Testing Notes

- All data is **mock data** - changes won't persist after refresh
- Authentication is **mock** - no real security
- API endpoints use **mock services** - not connected to database
- This is a **development build** - not production-ready

---

## 🎯 Quick Test Path

**Fastest way to test everything:**

1. Login as Customer: `customer@example.com`
2. Go to Customer Dashboard
3. Click "Start Onboarding" on location-1
4. Complete all 6 steps:
   - Fill basic details → Next
   - Select phone system → Next
   - Add 1-2 devices → Next
   - Set working hours → Next
   - Configure call flow → Next
   - Review & Submit
5. Verify submission works

**Then test Implementation Lead:**
1. Logout (or clear localStorage)
2. Login as Lead: `lead@company.com`
3. View dashboard
4. Create new account
5. View account list

---

Happy Testing! 🚀
