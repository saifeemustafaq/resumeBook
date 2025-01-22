
# Carnegie Mellon Resume Book - Development Specification

## Core Authentication
- Implement Google OAuth as the sole authentication method for students
- Create separate admin authentication system using email/password

## Student Interface Requirements

### Access Control
- Route protected behind Google OAuth authentication
- Auto-redirect unauthenticated users to login

### Form Interface
Create a form with the following fields:
- Email (read-only, auto-populated from Google OAuth)
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

## Technical Constraints
- All student data must pass through admin approval before public display
- Admin actions must be logged and reversible
- Implement proper error handling and user feedback
- Ensure responsive design across all interfaces
- Add proper loading states and error boundaries

## Data Validation Rules
- Enforce PDF-only for resumes
- Validate image dimensions for profile pictures
- Implement proper LinkedIn URL validation
- Add GPA range validation (1.0-4.04)
- Ensure all required fields are filled before submission

Tech Stack: Use MongoDB, NextJS, and TailwindCSS


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