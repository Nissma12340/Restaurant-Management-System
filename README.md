# Restaurant Management System

A simple, modern, web-based restaurant management dashboard and point-of-sale application designed for restaurant staff to manage menu items, create customer orders, auto-calculate bills, track kitchen orders, and view sales summaries.

---

## 🛠️ Technology Stack

- **Frontend**: 
  - React 18 / 19
  - Vite
  - JavaScript (ES Modules)
  - Axios (API client)
  - Lucide React (Icons)
  - Pure CSS Design System (Responsive, Modern Typography, Restaurant-themed aesthetics)
- **Backend**: 
  - Node.js (v22+)
  - Express.js
  - CORS middleware
- **Data Storage**: 
  - Local Persistent JSON Storage (`backend/data/menu.json` and `backend/data/orders.json`).
  - Abstracted `Storage` model layer for seamless plug-and-play migration to MongoDB / Mongoose.

---

## 📁 Project Structure

```
Restaurant-Management_system/
├── backend/
│   ├── controllers/
│   │   ├── dashboardController.js
│   │   ├── menuController.js
│   │   └── orderController.js
│   ├── data/
│   │   ├── menu.json
│   │   └── orders.json
│   ├── models/
│   │   └── storage.js
│   ├── routes/
│   │   ├── dashboardRoutes.js
│   │   ├── menuRoutes.js
│   │   └── orderRoutes.js
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BillModal.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Toast.jsx
│   │   │   └── Topbar.jsx
│   │   ├── pages/
│   │   │   ├── CreateOrder.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Menu.jsx
│   │   │   └── Orders.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🚀 Getting Started & Running

### Prerequisites
- Node.js (v18+)
- npm

### 1. Start the Backend Server (Terminal 1)
```bash
cd backend
npm install
npm run dev
# or: node server.js
```
The backend API starts on **`http://localhost:5000`**  
Health Check: **`http://localhost:5000/api/health`**

### 2. Start the Frontend Application (Terminal 2)
```bash
cd frontend
npm install
npm run dev
```
The frontend application starts on **`http://localhost:5173`**

---

## 🌟 Key Features

1. **Executive Dashboard**:
   - 4 Live Statistics Cards: **Total Menu Items**, **Total Orders**, **Today's Revenue (₹)**, and **Pending Orders**.
   - Recent Orders overview table with live status badges.
   - Quick one-click thermal receipt viewing.

2. **Menu Management**:
   - Tabular and card display of menu items with prices in INR (₹) and category tags.
   - Search dishes by name or category.
   - Category filtering (Fast Food, Pizza, Italian, Snacks, Beverages, Indian, Desserts).
   - "Add Menu Item" modal with input validation (Name required, Category required, Price > 0).
   - Delete menu items with confirmation dialog.

3. **Order Creation & Live Billing**:
   - Dropdown item selector with quantity controls or 1-click quick-picker cards.
   - Live line-item cart showing: Item name, Unit price, Quantity (+ / - stepper), Subtotal calculation.
   - Automatic grand total calculation.
   - Instant generation of printable **Customer Bill / Thermal Receipt**:
     - Order ID (#1001, #1002, ...)
     - Itemized list with quantities and subtotals
     - Total Amount
     - Order Status
     - Print receipt capability (`window.print()`).

4. **Order Management & Kitchen Status Tracking**:
   - Complete list of placed orders sorted chronologically.
   - Filter orders by status: **All**, **Pending**, **Preparing**, **Completed**.
   - Search orders by Order ID or dish name.
   - Instant status dropdown selector (`Pending` ➔ `Preparing` ➔ `Completed`) with real-time backend updates.

---

## 🔌 API Endpoints Reference

### Health Check
- `GET /api/health` — Checks API server status.

### Menu Endpoints
- `GET /api/menu` — Retrieve all menu items.
- `POST /api/menu` — Create a new menu item.
  - Body: `{ "name": "Paneer Tikka", "category": "Indian", "price": 220 }`
- `DELETE /api/menu/:id` — Delete a menu item by ID.

### Order Endpoints
- `GET /api/orders` — Retrieve all orders (newest first).
- `POST /api/orders` — Create a new customer order.
  - Body:
    ```json
    {
      "items": [
        { "name": "Veg Burger", "price": 120, "quantity": 2, "subtotal": 240 },
        { "name": "French Fries", "price": 100, "quantity": 1, "subtotal": 100 }
      ],
      "total": 340,
      "status": "Pending"
    }
    ```
- `PUT /api/orders/:id/status` — Update order status.
  - Body: `{ "status": "Preparing" }` (Allowed: `Pending`, `Preparing`, `Completed`)

### Dashboard Endpoints
- `GET /api/dashboard` — Aggregated metrics:
  - `totalMenuItems`, `totalOrders`, `todayRevenue`, `pendingOrders`, `recentOrders`.

---

## 🗄️ Database / Data Structure

### Menu Item Entity
```json
{
  "id": "item_1",
  "name": "Veg Burger",
  "category": "Fast Food",
  "price": 120
}
```

### Order Entity
```json
{
  "id": 1001,
  "items": [
    {
      "name": "Veg Burger",
      "price": 120,
      "quantity": 2,
      "subtotal": 240
    }
  ],
  "total": 240,
  "status": "Pending",
  "createdAt": "2026-10-05T18:30:00.000Z"
}
```

---

## 🧪 Verification & Testing Completed

All 10 user testing scenarios were systematically executed and verified:
1. ✅ **Dashboard Loads**: Metric cards and recent orders render.
2. ✅ **Menu Loads**: Sample menu items (Burgers, Pizza, Pasta, Fries, Coffee) display properly.
3. ✅ **Add Item**: "Paneer Tikka" (Indian, ₹220) added successfully.
4. ✅ **Delete Item**: Item deleted and verified removed.
5. ✅ **Order Calculation**: 2 Veg Burger (₹240) + 1 Fries (₹100) + 2 Coffee (₹180) = ₹520 total.
6. ✅ **Order Placement**: Order stored with auto-increment ID (#1004).
7. ✅ **Status Update (Pending ➔ Preparing)**: Updated and confirmed.
8. ✅ **Status Update (Preparing ➔ Completed)**: Updated and confirmed.
9. ✅ **Dashboard Reflection**: Total orders and today's revenue update immediately.
10. ✅ **Data Persistence**: Disk file persistence verified across restarts.
