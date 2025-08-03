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

## Prompt 2: Product Management Page Implementation

### Business Context
The Product Management page allows users to manage the product catalog, including creating, viewing, editing, and deleting products. Users need comprehensive product information management with category and supplier relationships.

### Technical Requirements
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Material-UI + TailwindCSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **JWT**: Authentication integration
- **File Upload**: Image upload for products

### Implementation Tasks
1. **Product Listing & Search**
   - Display paginated product list
   - Advanced search and filtering
   - Sort by various fields
   - Bulk operations

2. **Product CRUD Operations**
   - Create new products
   - View product details
   - Edit existing products
   - Delete products (soft delete)

3. **Product Form Management**
   - Comprehensive product form
   - Category and supplier selection
   - Image upload functionality
   - Validation and error handling

4. **Data Integration**
   - Connect to product API endpoints
   - Real-time data updates
   - Error handling and loading states
   - Optimistic updates

5. **Advanced Features**
   - Product duplication
   - Bulk import/export
   - Product variants
   - Inventory integration

### Project Structure
```
src/
├── pages/products/
│   ├── ProductManagement.tsx
│   ├── ProductDetail.tsx
│   └── components/
│       ├── ProductList.tsx
│       ├── ProductForm.tsx
│       ├── ProductCard.tsx
│       ├── ProductFilters.tsx
│       ├── ProductSearch.tsx
│       └── ProductBulkActions.tsx
├── services/
│   └── productService.ts
├── types/
│   └── product.ts
└── utils/
    ├── formatters.ts
    └── validation.ts
```

### API Integration Requirements
Reference `@API_SPEC.md` for:
- **GET /api/products** - List products with pagination and filtering
- **GET /api/products/{id}** - Get product by ID
- **POST /api/products** - Create new product
- **PUT /api/products/{id}** - Update product
- **DELETE /api/products/{id}** - Soft delete product
- **GET /api/categories** - Get categories for dropdown
- **GET /api/suppliers** - Get suppliers for dropdown

Reference `@ARCHITECTURE.md` for:
- Frontend structure and patterns
- State management approach
- Component architecture
- Service layer design
- Error handling patterns

Reference `@DATABASE_SCHEMA.md` for:
- Product entity structure
- Category relationships
- Supplier relationships
- Field validations and constraints
- Audit trail implementation

### UI/UX Requirements
- **Design System**: Material-UI + TailwindCSS
- **Responsive**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliance
- **Performance**: Virtual scrolling for large lists
- **User Experience**: Intuitive forms and interactions
- **Data Visualization**: Product status indicators

### Component Requirements
1. **ProductManagement (Main Page)**
   - Product list with search/filter
   - Create/Edit/Delete actions
   - Bulk operations
   - Pagination controls
   - Status indicators

2. **ProductList**
   - Data table with sorting
   - Row selection
   - Action buttons per row
   - Loading states
   - Empty states

3. **ProductForm**
   - Comprehensive form fields
   - Category/Supplier dropdowns
   - Image upload
   - Validation feedback
   - Save/Cancel actions

4. **ProductCard**
   - Product information display
   - Status indicators
   - Quick actions
   - Image preview

5. **ProductFilters**
   - Search by name/SKU/brand
   - Category filter
   - Status filter
   - Price range filter
   - Clear filters option

6. **ProductSearch**
   - Real-time search
   - Search suggestions
   - Search history
   - Advanced search options

### State Management
- **Context**: ProductContext for global state
- **Local State**: Component-specific state
- **API State**: Loading, error, success states
- **Form State**: React Hook Form integration
- **Cache**: Product data caching

### Form Validation (Zod Schema)
```typescript
const productSchema = z.object({
  sku: z.string().min(1, "SKU is required").max(50),
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().optional(),
  categoryId: z.number().min(1, "Category is required"),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  weight: z.number().min(0).optional(),
  dimensions: z.string().max(100).optional(),
  unitOfMeasure: z.string().default("PCS"),
  costPrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  reorderPoint: z.number().min(0).default(0),
  reorderQuantity: z.number().min(0).default(0),
  isActive: z.boolean().default(true)
});
```

### API Service Methods
```typescript
// ProductService methods
- getProducts(params: ProductFilters): Promise<ApiResponse<ProductListResponse>>
- getProductById(id: number): Promise<ApiResponse<Product>>
- createProduct(data: ProductCreateRequest): Promise<ApiResponse<Product>>
- updateProduct(id: number, data: ProductUpdateRequest): Promise<ApiResponse<Product>>
- deleteProduct(id: number): Promise<ApiResponse<void>>
- getCategories(): Promise<ApiResponse<Category[]>>
- getSuppliers(): Promise<ApiResponse<Supplier[]>>
```

### TypeScript Interfaces
```typescript
interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category: Category;
  brand?: string;
  model?: string;
  weight?: number;
  dimensions?: string;
  unitOfMeasure: string;
  costPrice?: number;
  sellingPrice?: number;
  reorderPoint: number;
  reorderQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductFilters {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

### Success Criteria
- [ ] Product list displays with pagination
- [ ] Search and filtering work correctly
- [ ] Create product form validates properly
- [ ] Edit product pre-fills form correctly
- [ ] Delete product shows confirmation
- [ ] Category and supplier dropdowns load
- [ ] Image upload functionality works
- [ ] Responsive design on all devices
- [ ] Error handling implemented
- [ ] Loading states shown
- [ ] Accessibility features included
- [ ] Bulk operations work
- [ ] Real-time search implemented

### Testing Requirements
- **Unit Tests**: Component testing with Jest
- **Integration Tests**: API integration testing
- **E2E Tests**: User workflow testing with Cypress
- **Form Validation Tests**: Zod schema validation
- **Error Handling Tests**: API error scenarios

### Deliverables
1. Complete Product Management page
2. All required components (ProductList, ProductForm, etc.)
3. ProductService with full API integration
4. TypeScript interfaces and types
5. Zod validation schemas
6. Error handling and loading states
7. Responsive design implementation
8. Accessibility features (ARIA labels, keyboard navigation)
9. Unit tests for components
10. Integration tests for API calls
11. Form validation and error display
12. Image upload functionality
13. Bulk operations implementation
14. Real-time search functionality

## Prompt 3: Dashboard & Analytics Implementation
```

## Prompt 3: Product Management Page Implementation

### Business Context
The Product Management page allows users to manage the product catalog, including creating, viewing, editing, and deleting products. Users need comprehensive product information management with category and supplier relationships.

### Technical Requirements
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite
- **Styling**: Material-UI + TailwindCSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod
- **JWT**: Authentication integration
- **File Upload**: Image upload for products

### Implementation Tasks
1. **Product Listing & Search**
   - Display paginated product list
   - Advanced search and filtering
   - Sort by various fields
   - Bulk operations

2. **Product CRUD Operations**
   - Create new products
   - View product details
   - Edit existing products
   - Delete products (soft delete)

3. **Product Form Management**
   - Comprehensive product form
   - Category and supplier selection
   - Image upload functionality
   - Validation and error handling

4. **Data Integration**
   - Connect to product API endpoints
   - Real-time data updates
   - Error handling and loading states
   - Optimistic updates

5. **Advanced Features**
   - Product duplication
   - Bulk import/export
   - Product variants
   - Inventory integration

### Project Structure
```
src/
├── pages/products/
│   ├── ProductManagement.tsx
│   ├── ProductDetail.tsx
│   └── components/
│       ├── ProductList.tsx
│       ├── ProductForm.tsx
│       ├── ProductCard.tsx
│       ├── ProductFilters.tsx
│       ├── ProductSearch.tsx
│       └── ProductBulkActions.tsx
├── services/
│   └── productService.ts
├── types/
│   └── product.ts
└── utils/
    ├── formatters.ts
    └── validation.ts
```

### API Integration Requirements
Reference `@API_SPEC.md` for:
- **GET /api/products** - List products with pagination and filtering
- **GET /api/products/{id}** - Get product by ID
- **POST /api/products** - Create new product
- **PUT /api/products/{id}** - Update product
- **DELETE /api/products/{id}** - Soft delete product
- **GET /api/categories** - Get categories for dropdown
- **GET /api/suppliers** - Get suppliers for dropdown

Reference `@ARCHITECTURE.md` for:
- Frontend structure and patterns
- State management approach
- Component architecture
- Service layer design
- Error handling patterns

Reference `@DATABASE_SCHEMA.md` for:
- Product entity structure
- Category relationships
- Supplier relationships
- Field validations and constraints
- Audit trail implementation

### UI/UX Requirements
- **Design System**: Material-UI + TailwindCSS
- **Responsive**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliance
- **Performance**: Virtual scrolling for large lists
- **User Experience**: Intuitive forms and interactions
- **Data Visualization**: Product status indicators

### Component Requirements
1. **ProductManagement (Main Page)**
   - Product list with search/filter
   - Create/Edit/Delete actions
   - Bulk operations
   - Pagination controls
   - Status indicators

2. **ProductList**
   - Data table with sorting
   - Row selection
   - Action buttons per row
   - Loading states
   - Empty states

3. **ProductForm**
   - Comprehensive form fields
   - Category/Supplier dropdowns
   - Image upload
   - Validation feedback
   - Save/Cancel actions

4. **ProductCard**
   - Product information display
   - Status indicators
   - Quick actions
   - Image preview

5. **ProductFilters**
   - Search by name/SKU/brand
   - Category filter
   - Status filter
   - Price range filter
   - Clear filters option

6. **ProductSearch**
   - Real-time search
   - Search suggestions
   - Search history
   - Advanced search options

### State Management
- **Context**: ProductContext for global state
- **Local State**: Component-specific state
- **API State**: Loading, error, success states
- **Form State**: React Hook Form integration
- **Cache**: Product data caching

### Form Validation (Zod Schema)
```typescript
const productSchema = z.object({
  sku: z.string().min(1, "SKU is required").max(50),
  name: z.string().min(1, "Product name is required").max(200),
  description: z.string().optional(),
  categoryId: z.number().min(1, "Category is required"),
  brand: z.string().max(100).optional(),
  model: z.string().max(100).optional(),
  weight: z.number().min(0).optional(),
  dimensions: z.string().max(100).optional(),
  unitOfMeasure: z.string().default("PCS"),
  costPrice: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  reorderPoint: z.number().min(0).default(0),
  reorderQuantity: z.number().min(0).default(0),
  isActive: z.boolean().default(true)
});
```

### API Service Methods
```typescript
// ProductService methods
- getProducts(params: ProductFilters): Promise<ApiResponse<ProductListResponse>>
- getProductById(id: number): Promise<ApiResponse<Product>>
- createProduct(data: ProductCreateRequest): Promise<ApiResponse<Product>>
- updateProduct(id: number, data: ProductUpdateRequest): Promise<ApiResponse<Product>>
- deleteProduct(id: number): Promise<ApiResponse<void>>
- getCategories(): Promise<ApiResponse<Category[]>>
- getSuppliers(): Promise<ApiResponse<Supplier[]>>
```

### TypeScript Interfaces
```typescript
interface Product {
  id: number;
  sku: string;
  name: string;
  description?: string;
  category: Category;
  brand?: string;
  model?: string;
  weight?: number;
  dimensions?: string;
  unitOfMeasure: string;
  costPrice?: number;
  sellingPrice?: number;
  reorderPoint: number;
  reorderQuantity: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductFilters {
  page?: number;
  size?: number;
  search?: string;
  categoryId?: number;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
```

### Success Criteria
- [ ] Product list displays with pagination
- [ ] Search and filtering work correctly
- [ ] Create product form validates properly
- [ ] Edit product pre-fills form correctly
- [ ] Delete product shows confirmation
- [ ] Category and supplier dropdowns load
- [ ] Image upload functionality works
- [ ] Responsive design on all devices
- [ ] Error handling implemented
- [ ] Loading states shown
- [ ] Accessibility features included
- [ ] Bulk operations work
- [ ] Real-time search implemented

### Testing Requirements
- **Unit Tests**: Component testing with Jest
- **Integration Tests**: API integration testing
- **E2E Tests**: User workflow testing with Cypress
- **Form Validation Tests**: Zod schema validation
- **Error Handling Tests**: API error scenarios

### Deliverables
1. Complete Product Management page
2. All required components (ProductList, ProductForm, etc.)
3. ProductService with full API integration
4. TypeScript interfaces and types
5. Zod validation schemas
6. Error handling and loading states
7. Responsive design implementation
8. Accessibility features (ARIA labels, keyboard navigation)
9. Unit tests for components
10. Integration tests for API calls
11. Form validation and error display
12. Image upload functionality
13. Bulk operations implementation
14. Real-time search functionality

## Prompt 4: [To be created after Prompt 3 implementation]

## Prompt 5: [To be created after Prompt 4 implementation]

## Prompt 6: [To be created after Prompt 5 implementation]

## Prompt 7: [To be created after Prompt 6 implementation]

## Prompt 8: [To be created after Prompt 7 implementation]

## Prompt 9: [To be created after Prompt 8 implementation] 