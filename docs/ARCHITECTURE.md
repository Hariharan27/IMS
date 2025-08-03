# Inventory Management System - Architecture Document

## 1. System Overview

### 1.1 Architecture Pattern
The Inventory Management System follows a **Microservices Architecture** with a **React Frontend** and **Spring Boot Backend**, designed for scalability, maintainability, and rapid MVP development.

### 1.2 High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend│    │  Spring Boot    │    │   PostgreSQL    │
│   (TypeScript)  │◄──►│   Backend       │◄──►│   Database      │
│                 │    │   (Java)        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TailwindCSS   │    │   Feign Client  │    │   Flyway        │
│   + Shadcn/UI   │    │   (Microservices│    │   Migrations    │
│                 │    │   Communication)│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 2. Frontend Architecture

### 2.1 Technology Stack
- **Framework**: React 18+ with TypeScript
- **UI Library**: TailwindCSS + Shadcn/UI Components
- **State Management**: React Context + useReducer
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Build Tool**: Vite
- **Package Manager**: npm/yarn

### 2.2 Frontend Structure
```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── ui/                 # Shadcn/UI components
│   │   ├── layout/             # Layout components
│   │   ├── forms/              # Form components
│   │   └── charts/             # Chart components
│   ├── pages/
│   │   ├── auth/               # Authentication pages
│   │   ├── dashboard/          # Dashboard pages
│   │   ├── products/           # Product management
│   │   ├── inventory/          # Inventory tracking
│   │   ├── purchase-orders/    # Purchase order management
│   │   ├── reports/            # Reporting pages
│   │   └── settings/           # Settings pages
│   ├── hooks/
│   │   ├── useAuth.ts          # Authentication hook
│   │   ├── useApi.ts           # API communication hook
│   │   └── useInventory.ts     # Inventory operations hook
│   ├── context/
│   │   ├── AuthContext.tsx     # Authentication context
│   │   └── InventoryContext.tsx # Inventory state context
│   ├── services/
│   │   ├── api.ts              # API service layer
│   │   ├── authService.ts      # Authentication service
│   │   ├── productService.ts   # Product service
│   │   ├── inventoryService.ts # Inventory service
│   │   └── reportService.ts    # Reporting service
│   ├── types/
│   │   ├── auth.ts             # Authentication types
│   │   ├── product.ts          # Product types
│   │   ├── inventory.ts        # Inventory types
│   │   └── common.ts           # Common types
│   ├── utils/
│   │   ├── constants.ts        # Application constants
│   │   ├── helpers.ts          # Helper functions
│   │   └── validation.ts       # Validation utilities
│   ├── styles/
│   │   └── globals.css         # Global styles
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

### 2.3 Frontend Design Patterns
- **Component Composition**: Reusable UI components
- **Custom Hooks**: Business logic encapsulation
- **Context API**: Global state management
- **Service Layer**: API communication abstraction
- **Type Safety**: Full TypeScript implementation

## 3. Backend Architecture

### 3.1 Technology Stack
- **Framework**: Spring Boot 3.x
- **Language**: Java 17+
- **Build Tool**: Maven
- **Microservices**: Feign Client
- **Security**: Spring Security + JWT
- **Database**: PostgreSQL + Spring Data JPA
- **Validation**: Bean Validation
- **Documentation**: OpenAPI 3 (Swagger)
- **Testing**: JUnit 5 + Mockito

### 3.2 Backend Structure
```
backend/
├── src/
│   ├── main/
│   │   ├── java/com/inventory/
│   │   │   ├── InventoryApplication.java
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── SwaggerConfig.java
│   │   │   │   └── DatabaseConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── ProductController.java
│   │   │   │   ├── InventoryController.java
│   │   │   │   ├── PurchaseOrderController.java
│   │   │   │   └── ReportController.java
│   │   │   ├── service/
│   │   │   │   ├── AuthService.java
│   │   │   │   ├── ProductService.java
│   │   │   │   ├── InventoryService.java
│   │   │   │   ├── PurchaseOrderService.java
│   │   │   │   ├── NotificationService.java
│   │   │   │   └── ReportService.java
│   │   │   ├── repository/
│   │   │   │   ├── UserRepository.java
│   │   │   │   ├── ProductRepository.java
│   │   │   │   ├── InventoryRepository.java
│   │   │   │   ├── PurchaseOrderRepository.java
│   │   │   │   └── WarehouseRepository.java
│   │   │   ├── entity/
│   │   │   │   ├── User.java
│   │   │   │   ├── Product.java
│   │   │   │   ├── Inventory.java
│   │   │   │   ├── PurchaseOrder.java
│   │   │   │   └── Warehouse.java
│   │   │   ├── dto/
│   │   │   │   ├── AuthDto.java
│   │   │   │   ├── ProductDto.java
│   │   │   │   ├── InventoryDto.java
│   │   │   │   └── PurchaseOrderDto.java
│   │   │   ├── exception/
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   ├── ResourceNotFoundException.java
│   │   │   │   └── ValidationException.java
│   │   │   └── util/
│   │   │       ├── JwtUtil.java
│   │   │       └── ValidationUtil.java
│   │   └── resources/
│   │       ├── application.yml
│   │       ├── application-dev.yml
│   │       ├── application-prod.yml
│   │       └── db/migration/
│   │           ├── V1__Create_initial_schema.sql
│   │           ├── V2__Add_products_table.sql
│   │           └── V3__Add_inventory_tracking.sql
│   └── test/
│       └── java/com/inventory/
│           ├── controller/
│           ├── service/
│           └── repository/
├── pom.xml
└── Dockerfile
```

### 3.3 Microservices Architecture
The system is designed with microservices in mind, using Feign Client for service communication:

#### 3.3.1 Service Modules
1. **User Service**: Authentication and user management
2. **Product Service**: Product catalog management
3. **Inventory Service**: Stock tracking and management
4. **Purchase Order Service**: Order management
5. **Notification Service**: Alert and notification system
6. **Report Service**: Analytics and reporting

#### 3.3.2 Service Communication
```java
// Example Feign Client interface
@FeignClient(name = "inventory-service")
public interface InventoryServiceClient {
    @GetMapping("/api/inventory/{productId}")
    InventoryDto getInventoryByProduct(@PathVariable Long productId);
    
    @PostMapping("/api/inventory/update")
    InventoryDto updateInventory(@RequestBody InventoryUpdateDto updateDto);
}
```

## 4. Database Architecture

### 4.1 Database Schema
The system uses PostgreSQL with the following core tables:

#### 4.1.1 Core Entities
- **users**: User management and authentication
- **products**: Product catalog and specifications
- **warehouses**: Warehouse locations and information
- **inventory**: Stock levels and tracking
- **purchase_orders**: Purchase order management
- **suppliers**: Supplier information
- **stock_movements**: Inventory movement history
- **alerts**: System alerts and notifications

### 4.2 Database Design Principles
- **Normalization**: 3NF compliance
- **Indexing**: Strategic indexes for performance
- **Constraints**: Foreign key and check constraints
- **Audit Trail**: Created/updated timestamps
- **Soft Deletes**: Logical deletion support

## 5. API Design

### 5.1 RESTful API Structure
```
/api/v1/
├── auth/
│   ├── POST /login
│   ├── POST /register
│   └── POST /refresh
├── products/
│   ├── GET /products
│   ├── POST /products
│   ├── GET /products/{id}
│   ├── PUT /products/{id}
│   └── DELETE /products/{id}
├── inventory/
│   ├── GET /inventory
│   ├── GET /inventory/{productId}
│   ├── POST /inventory/update
│   └── GET /inventory/movements
├── purchase-orders/
│   ├── GET /purchase-orders
│   ├── POST /purchase-orders
│   ├── GET /purchase-orders/{id}
│   └── PUT /purchase-orders/{id}/status
├── reports/
│   ├── GET /reports/inventory-turnover
│   ├── GET /reports/stock-valuation
│   └── GET /reports/trends
└── alerts/
    ├── GET /alerts
    ├── POST /alerts/acknowledge
    └── GET /alerts/config
```

### 5.2 API Response Format
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### 5.3 Error Handling
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "productName",
        "message": "Product name is required"
      }
    ]
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## 6. Security Architecture

### 6.1 Authentication & Authorization
- **JWT-based Authentication**: Stateless token-based auth
- **Role-based Access Control**: Admin, Manager, Staff roles
- **Password Security**: BCrypt hashing
- **Token Refresh**: Automatic token renewal

### 6.2 Security Measures
- **CORS Configuration**: Cross-origin resource sharing
- **Input Validation**: Bean validation and sanitization
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy
- **Rate Limiting**: API request throttling

## 7. Deployment Architecture

### 7.1 Containerization
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

```dockerfile
# Backend Dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
```

### 7.2 Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
    environment:
      - REACT_APP_API_URL=http://localhost:8080/api/v1

  backend:
    build: ./backend
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    environment:
      - SPRING_PROFILES_ACTIVE=dev
      - DATABASE_URL=jdbc:postgresql://postgres:5432/inventory_db

  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_DB=inventory_db
      - POSTGRES_USER=inventory_user
      - POSTGRES_PASSWORD=inventory_pass
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## 8. Performance & Scalability

### 8.1 Performance Optimization
- **Database Indexing**: Strategic indexes on frequently queried columns
- **Connection Pooling**: HikariCP for database connections
- **Caching**: Redis for frequently accessed data
- **CDN**: Static asset delivery optimization
- **Code Splitting**: Lazy loading for frontend components

### 8.2 Scalability Strategies
- **Horizontal Scaling**: Load balancer support
- **Microservices**: Independent service scaling
- **Database Sharding**: Future horizontal database scaling
- **Caching Layers**: Multi-level caching strategy
- **Async Processing**: Background job processing

## 9. Monitoring & Observability

### 9.1 Application Monitoring
- **Health Checks**: Spring Boot Actuator
- **Metrics**: Prometheus integration
- **Logging**: Structured logging with Logback
- **Tracing**: Distributed tracing support

### 9.2 Error Tracking
- **Exception Handling**: Global exception handler
- **Error Logging**: Centralized error logging
- **Alerting**: Critical error notifications
- **Performance Monitoring**: Response time tracking

## 10. Development Workflow

### 10.1 Development Environment
- **Local Development**: Docker Compose setup
- **Hot Reload**: Frontend and backend hot reloading
- **Database Migrations**: Flyway for schema management
- **API Documentation**: Swagger UI for API testing

### 10.2 Testing Strategy
- **Unit Tests**: JUnit 5 for backend, Jest for frontend
- **Integration Tests**: TestContainers for database testing
- **E2E Tests**: Cypress for frontend testing
- **API Tests**: Postman/Newman for API testing

## 11. Related Documentation

For detailed implementation guidance, refer to:
- [Implementation Guide](./IMPLEMENTATION_GUIDE.md)
- [Database Schema](./DATABASE_SCHEMA.md)
- [API Specification](./API_SPEC.md)
- [Architecture Diagrams](./ARCHITECTURE_DIAGRAMS.md)

## 12. Technology Decisions

### 12.1 Why This Stack?
- **React + TypeScript**: Type safety and developer experience
- **Spring Boot**: Enterprise-grade backend framework
- **PostgreSQL**: ACID compliance and advanced features
- **Docker**: Consistent deployment across environments
- **TailwindCSS**: Rapid UI development and consistency

### 12.2 Alternatives Considered
- **Frontend**: Vue.js, Angular (React chosen for ecosystem)
- **Backend**: Node.js, .NET Core (Spring Boot for enterprise features)
- **Database**: MySQL, MongoDB (PostgreSQL for ACID compliance)
- **Styling**: Material-UI, Ant Design (TailwindCSS for flexibility) 