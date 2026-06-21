# Spice Bureau - Frontend Client

> The client-side application of the Spice Bureau 2.0 ecosystem. A high-performance, responsive portal built using React 19, TypeScript, and Vite.

This folder contains the complete Single Page Application (SPA) that acts as the frontend interface for all four roles: **Customers, Sellers (Restaurants), Riders, and Administrators**.


## Core Technologies

*   **React 19 & TypeScript**: Provides a modern, type-safe, component-driven UI foundation.
*   **Vite**: The build tool ensuring lightning-fast Hot Module Replacement (HMR) and optimized client-side asset compilation.
*   **TailwindCSS 4.2**: The styling framework defining our layout, glassmorphic menus, buttons, animations, and custom theme parameters.
*   **React Router DOM v7**: Handles declarative routing for all core portals.
*   **Leaflet & React-Leaflet**: Powering live tracking on interactive maps for customers and routing/directions maps for riders.
*   **Stripe & Razorpay Checkout Integration**: Secures checkout flows directly from the browser.
*   **Google OAuth**: Enables fast, passwordless single-sign-on (SSO).


## Directory Structure

```text
frontend/
├── public/                 # Static assets (fonts, icons, and logo assets)
├── src/
│   ├── assets/             # Images, sounds (alert tones for riders/sellers)
│   ├── components/         # Reusable UI component blocks (Navbar, Card, Loading states, Maps)
│   ├── context/            # AppContext (Auth state, Cart state, Location) & SocketContext (WebSocket clients)
│   ├── pages/              # Role-specific portal dashboard pages & layout views
│   │   ├── Account.tsx / ProfileDetails.tsx     # Profile views
│   │   ├── Address.tsx                          # Address management
│   │   ├── Admin.tsx                            # Admin Control Panel
│   │   ├── Cart.tsx / Checkout.tsx              # Order checkout workflow
│   │   ├── Home.tsx / RestaurantPage.tsx        # Customer home and menus
│   │   ├── RiderDashboard.tsx / RiderOrders.tsx # Rider delivery portals
│   │   └── SellerDashboard.tsx / SellerOrders.tsx# Restaurant owner portals
│   ├── App.tsx             # Main routing hub
│   ├── main.tsx            # Service endpoint configuration & app bootstrap
│   └── types.ts            # Common TypeScript interface definitions
├── index.html              # HTML shell template
├── package.json            # Scripts and devDependencies configurations
└── tsconfig.json           # TypeScript compilation options
```


## Setup & Local Development

### 1. Install Dependencies
Navigate to the `frontend/` directory and run:
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in this directory and populate your keys:
```env
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
VITE_INTERNAL_SERVICE_KEY=your_internal_secret_key
```

### 3. Server Endpoint Configuration
The microservice URLs are configured in `src/main.tsx`. 
*   **Local Development**: To test against microservices running on your local machine, update the server variables to point to localhost ports:
    ```typescript
    export const authService = "http://localhost:5000";
    export const restaurantService = "http://localhost:5001";
    export const utilsService = "http://localhost:5002";
    export const realtimeService = "http://localhost:5004";
    export const riderService = "http://localhost:5005";
    export const adminService = "http://localhost:5006";
    ```
*   **Production**: Ensure they point to your deployed backend endpoints (Render, etc.).

### 4. Run Development Server
Start the local server with hot reload:
```bash
npm run dev
```
The client dashboard will typically load at `http://localhost:5173`.

### 5. Build for Production
To bundle and optimize the application assets for deployment (Vercel, Netlify, etc.):
```bash
npm run build
```
The compiled, minified assets will be generated inside the `dist/` directory.
