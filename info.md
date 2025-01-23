# Carnegie Mellon Resume Book - Development Specification

## Core Authentication
- Implement custom email/password authentication system
- Admin-generated credentials for initial access
- Mandatory password reset on first login
- Password reset only through admin intervention

## Student Interface Requirements

### Access Control
- Route protected behind custom authentication
- Auto-redirect unauthenticated users to login
- Force password reset on first login
- Session management with appropriate timeouts

### Form Interface
Create a form with the following fields:
- Email (read-only, provided by admin)
- Resume upload field (PDF only)
- Profile picture upload (1:1 aspect ratio enforced)
- Name field (text)
- School Name field (text)
- GPA field (decimal, min: 1.0, max: 4.04, 2 decimal places)
- Years of Experience field (numeric)
- Graduation Date (month/year dropdown selection)
- LinkedIn URL field (with URL validation)
- Bio field (text with 100 character limit, real-time character counter)
- Submit button
- Delete Profile button

### Data Management
- Pre-populate all fields with existing data on each login
- Enable real-time validation for all fields
- Implement auto-save functionality for form progress
- Add confirmation dialog for profile deletion

## Public Interface Implementation

### Header Section
- Position login button in top-right corner
- Position admin login in top-left corner
- Center "Carnegie Mellon Resume Book" title
- Add visual separator below header

### Filter System
Create filter section with:
- Dropdown containers with checkbox selections for:
  - GPA ranges
  - Years of Experience ranges
  - Graduation Year options
- Clear Filters button
- Implement real-time filtering (no submit button needed)

### Student Cards Display
Design responsive grid layout with cards containing:
- Profile picture (circular thumbnail)
- Name
- GPA
- School
- Years of Experience
- Graduation Date
- Bio section (100 char max)
- Action buttons:
  - Download Resume
  - LinkedIn Profile

### Card Behavior
- Implement random card ordering on page load/refresh
- Maintain random ordering within filtered results
- Persist filter selections across page refreshes
- Ensure smooth transitions during filtering

## Admin Interface Implementation

### Authentication
- Create secure login system with email/password
- Implement session management
- Add password change functionality

### User Management
Create interface for:
- Add new users with auto-generated temporary passwords
- View all users in a table format with:
  - User name
  - Email ID
  - Account status
  - Last login timestamp
  - Password reset button
  - Delete user button
  - Disable user button
- Bulk user import capability
- Password reset functionality
- User account status management

### Profile Management
Create interface for:
- Viewing all submitted student profiles
- Approve/Deny buttons for each profile
- Edit capability for all student-submitted fields
- Bulk action capabilities for multiple profiles

### Admin Management
Implement functions for:
- Password change
- Adding new admin accounts
- Removing existing admin accounts
- Setting admin privileges

### Security Requirements
- Implement rate limiting
- Add audit logging for admin actions
- Enforce strong password requirements
- Add 2FA option for admin accounts
- Log all password resets and user management actions

## Technical Constraints
- All student data must pass through admin approval before public display
- Admin actions must be logged and reversible
- Implement proper error handling and user feedback
- Ensure responsive design across all interfaces
- Add proper loading states and error boundaries
- Use Azure Blob Storage for file storage (resumes and profile pictures)
- Implement proper Azure Storage security and access controls
- Set up Azure Storage container with appropriate CORS policies

## Data Validation Rules
- Enforce PDF-only for resumes
- Validate image dimensions for profile pictures
- Implement proper LinkedIn URL validation
- Add GPA range validation (1.0-4.04)
- Ensure all required fields are filled before submission

Tech Stack: Use MongoDB, NextJS, TailwindCSS, and Azure Storage


@app 

This website, will have two buttons, Student Login(left corner), Admin login(right corner) in the center it will say, CMU Resume book.
After this there will be a partition.
Now this will have around 6 cards, which contains dummy information in the following style:

Design responsive grid layout with cards containing:
- Profile picture (circular thumbnail)
- Name
- GPA
- School
- Years of Experience
- Graduation Date
- Bio section (100 char max)
- Action buttons:
  - Download Resume
  - LinkedIn Profile


Use material UI theme for the CSS.

Create proper component for everything, make sure everything resides in the @app 