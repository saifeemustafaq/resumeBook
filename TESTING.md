# Testing Guide for CMU Resume Book Authentication

## Setup Test Users
1. Make sure MongoDB is running
2. Run the following command:
   ```bash
   npm run setup-test-users
   ```
3. This will create two test users:
   - Student: test.student@cmu.edu / TestStudent123!
   - Admin: test.admin@cmu.edu / TestAdmin123!

## Test Cases

### 1. Student Authentication Flow
1. Navigate to the homepage
2. Click "Student Login" button
3. Enter student credentials:
   - Email: test.student@cmu.edu
   - Password: TestStudent123!
4. Should redirect to student dashboard
5. Verify that the JWT token cookie is set
6. Try accessing admin dashboard - should be denied

### 2. Admin Authentication Flow
1. Navigate to the homepage
2. Click "Admin Login" button
3. Enter admin credentials:
   - Email: test.admin@cmu.edu
   - Password: TestAdmin123!
4. Should redirect to admin dashboard
5. Verify that the JWT token cookie is set
6. Should have access to admin features

### 3. Password Reset Flow
1. Login as either user
2. Navigate to password reset page
3. Enter current password
4. Enter and confirm new password
5. Should be able to login with new password

### 4. Session Management
1. Login with either account
2. Close and reopen browser
3. Should still be logged in (if within session time)
4. Try clearing cookies
5. Should be logged out

### 5. Error Cases to Test
- Invalid credentials
- Missing fields
- Invalid password format
- Accessing protected routes without auth
- Using student token for admin routes

## Expected Behaviors

### Success Cases
- Valid login should redirect to appropriate dashboard
- Session should persist within time limit
- Password reset should work with valid current password

### Error Cases
- Invalid credentials should show error message
- Missing fields should show validation errors
- Protected routes should redirect to login
- Cross-role access attempts should be denied

## Testing Environment
- Development server: `npm run dev`
- Database: Local MongoDB
- Test users are automatically configured with the setup script

## Notes
- Test users are created with known passwords
- All test accounts start with status 'active'
- No rate limiting in test environment
- Sessions last 24h for students, 12h for admins 