# 🛒 GroceryMart - MEAN Stack Application

A full-featured Grocery Store web application built with MongoDB, Express.js, Angular 17, and Node.js.

## 🔐 Default Credentials

| Role     | Email                        | Password   |
|----------|------------------------------|------------|
| Admin    | admin@grocerystore.com       | Admin@123  |
| Customer | Register via signup page     | Your choice|

---

## 📁 Project Structure

```
GS/
├── backend/          # Node.js + Express API
│   ├── config/       # MongoDB connection
│   ├── controllers/  # Route logic
│   ├── middlewares/  # Auth, Upload
│   ├── models/       # Mongoose schemas
│   ├── routes/       # API routes
│   ├── uploads/      # Product images
│   ├── seed.js       # Database seeder
│   └── server.js     # Entry point
│
└── frontend/         # Angular 17 App
    └── src/app/
        ├── auth/         # Login, Register
        ├── admin/        # Dashboard, Products, Orders
        ├── customer/     # Shop, Cart, Orders
        ├── guards/       # Route protection
        ├── models/       # TypeScript interfaces
        ├── services/     # HTTP service layer
        └── shared/       # Navbar component
```

---

## 🚀 Local Setup

### Step 1: MongoDB Atlas Setup
1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. **Network Access** → Add IP Address → Allow Access from Anywhere (`0.0.0.0/0`)
3. Copy your connection string

### Step 2: Backend Setup
```bash
cd backend
npm install

# Edit .env - Your MongoDB URI is already configured
# MONGODB_URI=mongodb+srv://gs:060576@cluster0.k9jjr3f.mongodb.net/grocery-store?...

# Seed the database (creates admin + sample products)
npm run seed

# Start backend (port 5000)
npm run dev
```

### Step 3: Frontend Setup
```bash
cd frontend
npm install

# Start Angular dev server (port 4200)
npx ng serve
```

### Step 4: Access the Application
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

---

## 🌐 Deployment

### Backend → Render

1. Push `backend/` folder to a GitHub repo
2. Go to [render.com](https://render.com)
3. **New** → **Web Service** → Connect your GitHub repo
4. Configure:
   - **Name**: `grocerymart-api`
   - **Root Directory**: `backend`  *(if full repo)*
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add **Environment Variables**:
   ```
   MONGODB_URI=mongodb+srv://gs:060576@cluster0.k9jjr3f.mongodb.net/grocery-store?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=grocerystore_jwt_secret_key_2024_secure
   NODE_ENV=production
   FRONTEND_URL=https://your-app.vercel.app
   ```
6. Click **Create Web Service**
7. Copy the Render URL (e.g., `https://grocerymart-api.onrender.com`)

### Frontend → Vercel

1. Update `frontend/src/environments/environment.prod.ts`:
   ```typescript
   export const environment = {
     production: true,
     apiUrl: 'https://grocerymart-api.onrender.com/api',  // Your Render URL
   };
   ```
2. Push `frontend/` to a GitHub repo
3. Go to [vercel.com](https://vercel.com)
4. **New Project** → Import your GitHub repo
5. Configure:
   - **Root Directory**: `frontend` *(if full repo)*
   - **Build Command**: `npx ng build --configuration=production`
   - **Output Directory**: `dist/frontend/browser`
6. Click **Deploy**

> ✅ The `vercel.json` file is already configured for Angular SPA routing.

---

## 📡 API Endpoints

### Auth
```
POST /api/auth/register    → Register customer
POST /api/auth/login       → Login (admin or customer)
GET  /api/auth/me          → Get current user
POST /api/auth/create-admin → Create first admin (one-time)
```

### Products
```
GET    /api/products           → List active products (public)
GET    /api/products/:id       → Get single product (public)
GET    /api/products/admin/all → All products (admin)
POST   /api/products           → Create product (admin)
PUT    /api/products/:id       → Update product (admin)
DELETE /api/products/:id       → Delete product (admin)
```

### Orders
```
POST /api/orders           → Create order (customer)
GET  /api/orders/my-orders → My orders (customer)
GET  /api/orders/stats     → Dashboard stats (admin)
GET  /api/orders           → All orders (admin)
PUT  /api/orders/:id       → Update status (admin)
GET  /api/orders/:id       → Order details
```

---

## 🎯 Features

### Admin
- 📊 Dashboard with live stats (revenue, orders, customers, products)
- 📦 Full Product CRUD with image upload
- 🏷️ Category management (11 categories)
- 📋 Order management with inline status update
- 📑 Filter orders by status

### Customer
- 🛍️ Product browsing with search + category filter
- 📄 Product detail page with quantity selector
- 🛒 Persistent shopping cart (localStorage)
- ✅ Order placement with address form
- 📦 Order history with visual status timeline

---

## 🔧 Tech Stack

| Layer       | Technology                    |
|-------------|-------------------------------|
| Frontend    | Angular 17, Bootstrap 5, SCSS |
| Backend     | Node.js, Express.js           |
| Database    | MongoDB Atlas (Mongoose)      |
| Auth        | JWT + bcryptjs                |
| Upload      | Multer (disk storage)         |
| Deployment  | Render (API) + Vercel (UI)    |

# GS
