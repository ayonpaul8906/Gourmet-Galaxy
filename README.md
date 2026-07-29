# 🍽️ Gourmet Galaxy

**Gourmet Galaxy** is a modern full-stack food ordering web application that connects users with nearby restaurants and enables them to explore menus, place orders, track deliveries, and manage carts in real-time.  

It is designed with a **React + Next.js frontend**, a **Spring Boot backend**, and **Firebase Firestore** as the database — ensuring scalability, performance, and seamless user experience.

---

## 🚀 Features

### 👨‍🍳 User Features
- **Browse Restaurants & Menus** – Explore multiple restaurants and their dishes.  
- **Add to Cart** – Add, update, or remove food items from the cart.   
- **Place Orders** – Checkout and place orders securely.  
- **Live Order Tracking** – Track each order’s status: _Placed → Cooking → Out for Delivery → Delivered_.  
- **Cancel Orders** – Cancel orders in progress.  
- **Order History** – View all past and current orders with status.  

### 🧑‍💼 Admin/Backend Features
- Manage restaurant data and menus.  
- Handle user carts, orders, and statuses dynamically via API endpoints.  
- Real-time updates using Firestore.  

---

## 🧩 System Architecture
```
Frontend (Next.js / React)
↓
REST API (Spring Boot)
↓
Database (Firebase Firestore)
```

**Workflow:**
1. The user interacts with the **frontend** (Next.js).  
2. Requests are sent to **Spring Boot REST APIs**.  
3. Spring Boot connects with **Firestore** to fetch/store data.  
4. Responses are sent back as JSON to the frontend.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|-------|-------------|-------------|
| **Frontend** | **Next.js (React, TypeScript)** | Responsive and interactive UI |
| **Backend** | **Spring Boot (Java)** | RESTful APIs and business logic |
| **Database** | **Firebase Firestore** | Cloud NoSQL database |
| **Authentication** | LocalStorage-based (User IDs) | User session management |
| **APIs** | REST (HTTP/JSON) | Communication between frontend & backend |

---

## 📸 Screenshots  

| **Home** | **Explore** | **Orders** | **Cart** |
|:------------:|:------------:|:------------:|:------------:|
| ![Home](https://github.com/user-attachments/assets/efee502d-548b-459c-899c-6af103338b77) | ![Explore](https://github.com/user-attachments/assets/97417fa0-c5ae-410e-b9b5-7f9c2faccaef) | ![Orders](https://github.com/user-attachments/assets/b9f3e2e0-478f-4fc2-a6a3-ec87085fb8dc) | ![Cart](https://github.com/user-attachments/assets/4707a318-4acc-49b1-8a93-2a1a39ea06b1) |


---

## 📦 Backend Implementation

### 🔹 Key Controllers
| Controller | Path | Description |
|-------------|------|-------------|
| **CartController** | `/api/cart/...` | Handles adding, updating, removing items |
| **OrderController** | `/api/order/...` | Manages placing, tracking, and updating orders |
| **RestaurantController** | `/api/restaurants` | Fetches restaurant list and menus |

### 🔹 Sample Endpoints

#### 🛒 Cart
- GET /api/cart/{userId} → Fetch user cart
- POST /api/cart/{userId}/add → Add item to cart
- PUT /api/cart/{userId}/update → Update item quantity
- DELETE /api/cart/{userId}/remove/{itemId} → Remove item
- DELETE /api/cart/{userId}/clear → Clear cart

#### 📦 Orders
- GET /api/order/{userId} → Get user orders
- POST /api/order/{userId} → Place new order
- PUT /api/order/update-status/{userId}/{orderId}→ Update order status

#### 🍴 Restaurants
- GET /api/restaurants → Fetch all restaurants with their menus


---

## ⚙️ Backend Architecture

**Packages Overview:**
```
com.foodorder.food_backend
├── controller → Defines REST APIs (Cart, Order, Restaurant)
├── service → Business logic for Firestore CRUD operations
├── model → POJO classes (CartItem, Order, Food)
└── config → Firebase configuration
```

**Example Flow:**  
`Frontend (Add to Cart)` →  
`POST /api/cart/{userId}/add` →  
`CartController` → `CartService.addToCart()` →  
`Firestore` (users/{userId}/cart)

---

## 💾 Firestore Database Structure
```
users
└── {userId}
├── cart
│ ├── itemId → { name, price, quantity, restaurant }
└── orders
├── orderId → { items, totalAmount, status, date }
```

---

## 🎨 Frontend Overview

**Built with Next.js + TailwindCSS**, focusing on smooth UI/UX and modern design patterns.

### 🔸 Pages:
- **Home Page:** Browse restaurants and featured foods  
- **Cart Page:** Manage added items with quantity updates  
- **Checkout Page:** Place order  
- **Orders Page:** View order history  
- **Track Order Page:** Live order status tracking  

### 🔸 UI Highlights:
- Glassmorphism design  
- Gradient typography  
- Smooth animations (Framer Motion)  
- Responsive layout for all devices  

---

## 🔒 Security & API Handling

- CORS enabled (`@CrossOrigin(origins = "*")`)  
- JSON-based request/response  
- Unique userId stored in localStorage for cart & order mapping  
- Error handling for invalid responses  

---

## 🧠 Future Enhancements
- 🔐 Firebase Authentication for login/signup  
- 🛍️ Admin Dashboard for restaurant management  
- 💳 Online Payment Gateway integration  
- 🔔 Real-time order tracking using WebSockets or Firebase listeners  

---

## 🧾 How to Run Locally

### ▶️ Backend (Spring Boot)
```bash
# Open in IDE (IntelliJ / VS Code)
# Configure Firebase SDK service account
mvn spring-boot:run
```

### ▶️ Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```

Visit: http://localhost:3000

### 🧑‍💻 Developed By
**Ayon Paul**  
B.Tech CSE Student | Web Developer  
📧 Email: [ayonpaul8906@gmail.com](mailto:ayonpaul8906@gmail.com)  
🌐 GitHub: [Ayon Paul](https://github.com/ayonpaul8906)
