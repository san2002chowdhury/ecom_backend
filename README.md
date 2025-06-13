# 🛒 Chowdhury Store

**Chowdhury Store** is a full-featured **MERN stack eCommerce application** built from scratch to simulate a real-world online store. It supports secure authentication, OTP flows, Razorpay payment integration, product reviews, PDF invoice generation, and dynamic coupon application — making it an ideal full-stack portfolio project.

## 🔗 Live Demo

> ⚠️ Hosted on a free tier — **initial page loads may take \~1 min** due to server cold starts.live link:- [View Live Demo](https://ecom-frontend-tswm.onrender.com)
> 📹 **Project video demo** 👉 [Watch Video Demo on Google Drive](https://drive.google.com/file/d/1u2CDecj5wm4cJVKdv5tbOwuDizhsKUuR/view?usp=sharing)

---

## 📁 GitHub Repositories

* 🔷 **Frontend**: [ecom\_frontend](https://github.com/san2002chowdhury/ecom_frontend)
* 🔶 **Backend**: [ecom\_backend](https://github.com/san2002chowdhury/ecom_backend)

---

## 🧱 Tech Stack

### 🔹 Frontend

* React JS (Functional Components)
* Redux Toolkit, Redux Store & Redux Saga
* React Router DOM
* Bootstrap 5 + Custom CSS
* Axios for API calls
* Form validation and toast notifications
* Responsive design with category-based navigation

### 🔸 Backend

* Node.js + Express
* MongoDB + Mongoose
* JWT Authentication
* OTP System (email-based)
* OAuth2-based NodeMailer Email System
* Razorpay Payment Gateway
* PDFKit + html-pdf-node for invoice PDFs
* RESTful APIs with role-based protection

---

## ✨ Features

### 🛍️ Product Management

* Dynamic product listing with pagination
* Banner-based category redirection
* Product **ratings & reviews**

  * Star-based rating system
  * User-authenticated reviews
  * Review fetch and display per product

### 🛒 Cart & Checkout

* Add/remove/update product quantity (1–5)
* Apply coupon codes:

  * `WELCOME10` — 10% off for new users
  * `OFF200` — ₹200 off for all
* Total price reflects real-time discounts
* Fixed shipping rate (₹40)
* Payment:

  * Razorpay for online
  * Cash on Delivery

### 🧾 Order Summary

* Order confirmation page after checkout
* View past orders
* Filter/search by order ID or status
* PDF invoice sent via email

  * Contains product names, images, quantities, coupon applied, and total

### 📬 Email Notifications (via OAuth2 Gmail)

* Welcome email on signup
* Newsletter subscription confirmation
* Contact message response
* OTP for password recovery
* PDF invoice email after order placement

### 👤 User Features

* Register/login with JWT & session handling
* Forgot/Reset password with OTP flow
* Profile page with editable details & profile photo upload
* Wishlist management
* Cart persistence (via backend and localStorage)

---

## 🧪 Security

* JWT-authenticated routes
* OTP expiration & verification limits
* Razorpay signature validation
* Middleware-protected API endpoints

---

## 📷 Screenshots

> (*Coming soon along with video demo*)

---

## ⚙️ Getting Started

### 1. Clone Repositories

```bash
# Frontend
git clone https://github.com/san2002chowdhury/ecom_frontend.git

# Backend
git clone https://github.com/san2002chowdhury/ecom_backend.git
```

### 2. Setup Frontend

```bash
cd ecom_frontend
npm install
npm start
```

### 3. Setup Backend

```bash
cd ecom_backend
npm install
npm run dev
```

### 4. Environment Variables (`.env`)

Configure these in the backend:

```env
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_jwt_secret
EMAIL_CLIENT_ID=your_oauth_client_id
EMAIL_CLIENT_SECRET=your_oauth_client_secret
EMAIL_REFRESH_TOKEN=your_refresh_token
EMAIL_USER=your_email_address
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

---

## 🔮 Future Improvements

* Admin dashboard for managing inventory, users, and orders
* Product image gallery
* Product stock notifications
* Review moderation (report/spam flag)
* UI/UX polish and animation

---

## 👨‍💻 Author

**Santanu Chowdhury**
📧 [santanuchow2@gmail.com] (https://github.com/san2002chowdhury)


