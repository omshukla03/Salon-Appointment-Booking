

````markdown
# 💇‍♀️ Salon Management System — Frontend

This is the **React + Vite + Tailwind CSS** frontend for the Salon Management System.  
Users can browse salons, book appointments, and make payments via **Razorpay / Stripe / Pay at Salon**.  
Salon owners can manage bookings, services, payments, and earnings from their portal.  

---

## 🛠 Tech Stack
- **React 18 + Vite**
- **Tailwind CSS**
- **Axios** (API calls)
- **React Router**
- **Stripe & Razorpay SDKs**

---

## 🚀 Getting Started

### Prerequisites
- **Node.js v18+**
- **npm or yarn**
- Backend server running at `http://localhost:5005`

---

### 🔧 Installation
```bash
# clone the repo
git clone https://github.com/your-username/salon-management-system.git

# go to frontend folder
cd salon-management-system/frontend

# install dependencies
npm install
````

---

### ⚙️ Environment Setup

Create a `.env` file in the **frontend folder** with the following values:

```env
VITE_API_BASE_URL=http://localhost:5005/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_RAZORPAY_KEY_ID=rzp_test_xxx
```

---

## 🧪 Scripts

```bash
# start dev server
npm run dev

# production build
npm run build

# preview production build
npm run preview

# lint project
npm run lint
```

---

## 📂 Project Structure

```
frontend/
│── public/              # static files
│── src/
│   ├── assets/          # images, logos
│   ├── components/      # reusable UI components
│   ├── pages/           # app pages (Home, Login, Booking, OwnerDashboard etc.)
│   ├── services/        # API calls (Axios)
│   ├── hooks/           # custom hooks
│   ├── context/         # auth & global state
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── .env
├── package.json
└── vite.config.js
```

---

## 🎨 Features (Frontend)

### 👤 User

* Login / Signup
* Browse salons & services
* Book appointment (time & date)
* Pay via Razorpay, Stripe, or Pay at Salon
* View booking history

### 🏪 Salon Owner

* Login / Register
* Manage services (add/edit/remove)
* View bookings & approve/reschedule/cancel
* View payments & earnings
* Notifications & account settings

---

## 📦 Deployment

```bash
# build project
npm run build

# deploy the /dist folder to Netlify, Vercel, Nginx or S3
```

---

## 📝 Notes

* Ensure backend API base URL in `.env` matches your Spring Boot server.
* Use test keys for Stripe/Razorpay in development.
* For production, set live keys in `.env.production`.

> ✨ Frontend ready to ship!

```

---

Do you also want me to make a **separate README for backend (Spring Boot)** in the same style, so you’ll have two clear README files — one for frontend and one for backend?
```
