# Frontend Implementation Prompts

## Prompt 1: User Service Frontend Implementation

**Prompt Used:**
```
# User Service Frontend Implementation

## Business Context
We are building the frontend for an inventory management system. We need to implement the complete user management and authentication system with JWT integration, including login, registration, user profile management, and role-based access control.

## Technical Requirements
- React 18+ with TypeScript
- Vite as build tool
- Material-UI (MUI) for professional components
- TailwindCSS for custom styling and utilities
- React Router v6 for routing
- Axios for API communication
- React Hook Form + Zod for form validation
- JWT authentication with secure token storage
- Role-based access control (ADMIN, MANAGER, STAFF)
- Responsive design for all screen sizes

## Implementation Tasks
1. Initialize React project with Vite and TypeScript
2. Configure TailwindCSS and Material-UI (MUI)
3. Set up project structure and environment configuration
4. Create authentication service with JWT integration
5. Implement authentication context and hooks
6. Create protected route component
7. Build login page with form validation
8. Build user registration page with role selection
9. Create user profile management page
10. Implement user management dashboard (Admin only)
11. Add navigation and layout components
12. Set up routing with authentication guards

## Project Structure Requirements
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/           # Material-UI components
│   │   ├── layout/       # Layout components
│   │   ├── forms/        # Form components
│   │   └── auth/         # Authentication components
│   ├── pages/
│   │   ├── auth/         # Login, Register pages
│   │   ├── dashboard/    # Main dashboard
│   │   └── users/        # User management pages
│   ├── hooks/
│   │   ├── useAuth.ts    # Authentication hook
│   │   └── useApi.ts     # API communication hook
│   ├── services/
│   │   ├── api.ts        # Base API configuration
│   │   └── authService.ts # Authentication service
│   ├── types/
│   │   ├── auth.ts       # Authentication types
│   │   └── user.ts       # User types
│   ├── context/
│   │   └── AuthContext.tsx # Authentication context
│   ├── utils/
│   │   ├── constants.ts  # Application constants
│   │   └── helpers.ts    # Helper functions
│   ├── theme/
│   │   └── theme.ts      # Material-UI theme configuration
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## API Integration Requirements
Based on @API_SPEC.md and @ARCHITECTURE.md:

### Authentication Endpoints
- POST /api/auth/login - User login
- POST /api/auth/register - User registration
- GET /api/users - Get all users (Admin only)
- GET /api/users/{id} - Get user by ID
- PUT /api/users/{id} - Update user
- DELETE /api/users/{id} - Delete user (Admin only)

### JWT Authentication Flow
- Login → Receive JWT token → Store securely → Redirect to dashboard
- Token refresh mechanism for expired tokens
- Automatic token inclusion in API requests
- Logout → Clear token → Redirect to login

## UI/UX Requirements
- Modern, clean design with Material-UI components and TailwindCSS utilities
- Professional enterprise-grade interface
- Responsive layout for desktop, tablet, and mobile
- Loading states for all async operations
- Error handling with user-friendly messages
- Form validation with real-time feedback
- Accessible design following WCAG guidelines
- Dark/light mode support with MUI theme
- Custom styling with TailwindCSS for unique design elements

## Component Requirements

### Authentication Components
1. **LoginForm Component**
   - Material-UI TextField for username/email and password
   - Material-UI Checkbox for remember me
   - Material-UI Button with loading state
   - Form validation with Zod
   - Error message display with Material-UI Alert
   - Custom styling with TailwindCSS

2. **RegisterForm Component**
   - Material-UI TextField for user registration fields
   - Material-UI Select for role selection (Admin only)
   - Material-UI LinearProgress for password strength
   - Form validation with Zod
   - Success/error handling with Material-UI Snackbar
   - Custom styling with TailwindCSS

3. **UserProfile Component**
   - Material-UI Card for user information display
   - Material-UI Dialog for edit profile
   - Material-UI TextField for form inputs
   - Material-UI Chip for user status
   - Custom styling with TailwindCSS

4. **UserManagement Component (Admin)**
   - Material-UI DataGrid for user list with pagination
   - Material-UI TextField for search functionality
   - Material-UI Chip for status management
   - Material-UI Select for role assignment
   - Material-UI Button for bulk operations
   - Custom styling with TailwindCSS

### Layout Components
1. **MainLayout Component**
   - Material-UI Drawer for responsive sidebar navigation
   - Material-UI AppBar for header with user info and logout
   - Material-UI Breadcrumbs for navigation
   - Material-UI IconButton for mobile menu
   - Custom styling with TailwindCSS

2. **ProtectedRoute Component**
   - Authentication check with Material-UI CircularProgress
   - Role-based access control
   - Loading states with Material-UI Skeleton
   - Redirect handling with React Router

## State Management Requirements
- **AuthContext**: Global authentication state
- **User State**: Current user information
- **Token Management**: Secure JWT storage and refresh
- **Loading States**: Global loading indicators
- **Error States**: Centralized error handling

## Security Requirements
- Secure token storage (httpOnly cookies or secure localStorage)
- Automatic token refresh
- CSRF protection
- Input sanitization
- XSS prevention
- Secure API communication

## Form Validation Requirements
- Username: Required, 3-50 characters, alphanumeric
- Email: Required, valid email format
- Password: Required, minimum 8 characters, complexity rules
- First Name: Required, 2-50 characters
- Last Name: Required, 2-50 characters
- Role: Required, valid role selection

## Success Criteria
- ✅ User can register and login successfully
- ✅ JWT authentication works end-to-end
- ✅ Protected routes function correctly
- ✅ Role-based access control implemented
- ✅ User management interface is functional
- ✅ Responsive design works on all devices
- ✅ Form validation and error handling work
- ✅ No console errors or warnings
- ✅ Integration with backend API successful

## Testing Requirements
- Unit tests for utility functions
- Integration tests for authentication flow
- Component tests for UI components
- E2E tests for critical user journeys
- Accessibility testing
- Cross-browser compatibility

## Deliverables
- Complete React project with TypeScript
- Material-UI (MUI) + TailwindCSS configured
- Authentication service with JWT integration
- Authentication context and hooks
- Protected route component
- Login and registration pages with Material-UI components
- User profile management with Material-UI Card and Dialog
- User management dashboard (Admin) with Material-UI DataGrid
- Navigation and layout components with Material-UI Drawer and AppBar
- Complete routing setup
- Form validation and error handling with Material-UI components
- Responsive design implementation with TailwindCSS utilities
- Material-UI theme configuration
- Custom styling with TailwindCSS for unique design elements

## References
- @ARCHITECTURE.md - System architecture and patterns
- @API_SPEC.md - API endpoint specifications
- @DATABASE_SCHEMA.md - Database schema for user entity
- Backend User Service - Already implemented and tested
```

## Prompt 2: [To be created after Prompt 1 implementation]

## Prompt 3: [To be created after Prompt 2 implementation]

## Prompt 4: [To be created after Prompt 3 implementation]

## Prompt 5: [To be created after Prompt 4 implementation]

## Prompt 6: [To be created after Prompt 5 implementation]

## Prompt 7: [To be created after Prompt 6 implementation]

## Prompt 8: [To be created after Prompt 7 implementation]

## Prompt 9: [To be created after Prompt 8 implementation] 