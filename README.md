# 💇‍♀️ Style Studio — Salon Management System

[![Java](https://img.shields.io/badge/Java-17+-red?logo=openjdk)](https://adoptium.net/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Enabled-626CD9?logo=stripe&logoColor=white)](https://stripe.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Enabled-0C76FF?logo=razorpay&logoColor=white)](https://razorpay.com/)

Premium styling services for everyone. Users can browse salons, book appointments for a specific date & time, and pay online (Stripe/Razorpay) or **Pay at Salon**. Owners manage bookings, services, payments/earnings, notifications, and account settings — with **queue prevention** via time-slot locking.

---

## 📌 Table of Contents
- [Demo & Screenshots](#-demo--screenshots)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Monorepo Structure](#-monorepo-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Backend Setup (Spring Boot)](#backend-setup-spring-boot)
  - [Frontend Setup (React + Vite)](#frontend-setup-react--vite)
- [Database & Seed](#-database--seed)
- [Queue Prevention (No Waiting Lines)](#-queue-prevention-no-waiting-lines)
- [API Overview](#-api-overview)
- [Owner Portal Features](#-owner-portal-features)
- [User Portal Features](#-user-portal-features)
- [Build & Deployment](#-build--deployment)
- [Project Scripts](#-project-scripts)
- [Contributing](#-contributing)
- [License](#-license)
- [Notes](#-notes)

---

## 🖼 Demo & Screenshots

- Landing Page  
  <img width="1920" height="1080" alt="1" src="https://github.com/user-attachments/assets/9f767ac8-5c37-4278-958d-4c4783e9c8ea" />

- User Dashboard  
  <img width="1920" height="1080" alt="4" src="https://github.com/user-attachments/assets/49c4d451-f9bf-469b-8948-8de04201b11a" />
  
- Owner Dashboard  
  <img width="1920" height="1080" alt="10" src="https://github.com/user-attachments/assets/d58e6ee1-017b-4b86-97fa-3617c4783d12" />

- Book Appointment  
  <img width="1920" height="1080" alt="7" src="https://github.com/user-attachments/assets/4518a3d5-c518-428b-a050-2d5fad35d4c3" />

- Payment Page  
  <img width="1920" height="1080" alt="14" src="https://github.com/user-attachments/assets/67b90278-8ff2-43cb-8a59-fbe81735c282" />

- Notification Page  
  <img width="1920" height="1080" alt="17" src="https://github.com/user-attachments/assets/a16feba2-95e6-4cda-9a52-58e0dc35497d" />

---

## ✨ Features

### User (Customer)
- Sign up / Log in (JWT based).
- Browse salons & services.
- **Book appointment** with date & time.
- Live availability: prevents double bookings.
- Pay via **Razorpay**, **Stripe**, or **Pay at Salon**.
- View bookings: pending/confirmed/completed/cancelled.
- Payment receipts & booking history.
- Notifications (booking status, payment, reminders).
- Manage profile.

### Owner (Salon)
- Register salon / Login.
- Dashboard analytics (bookings, earnings, trends).
- Manage services (CRUD, duration, price).
- Manage bookings (confirm, reschedule, cancel, complete).
- Payment insights, transaction history.
- Live notifications (new bookings, payments).
- Account & business settings (address, hours, images).

---

## 🧰 Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Axios, React Router
- **Backend:** Java 17+, Spring Boot 3 (Web, Security, JPA/Hibernate, Validation), JWT, Lombok
- **Database:** MySQL 8 (Workbench optional)
- **Payments:** Stripe, Razorpay
- **Auth:** JWT (access/refresh strategy ready)
- **Notifications:** Server-sent or WebSocket (optional), plus email/SMS hooks (optional)

---

## 🗂 Monorepo Structure

```bash
salon-management-system/
├─ backend/
│  ├─ src/main/java/com/example/salon/...
│  ├─ src/main/resources/
│  │  ├─ application.properties
│  │  └─ schema.sql / data.sql
│  ├─ pom.xml
│  └─ README.md
├─ frontend/
│  ├─ src/pages/ components/ hooks/ store/ api/ styles/
│  ├─ public/
│  ├─ index.html
│  ├─ vite.config.ts
│  ├─ package.json
│  └─ README.md
├─ docs/screenshots/
│  ├─ landing.png
│  ├─ user-dashboard.png
│  └─ owner-dashboard.png
└─ README.md

## 🚀 Getting Started

### Prerequisites
- **Java 17+**
- **Maven 3.9+**
- **Node 18+**
- **MySQL 8**
- **Stripe** &/or **Razorpay** keys

### Environment Variables

**Backend — `application.properties`**
```properties
server.port=5005
spring.datasource.url=jdbc:mysql://localhost:3306/salon_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASS
spring.jpa.hibernate.ddl-auto=update
spring.jpa.open-in-view=false

app.cors.allowed-origins=http://localhost:5173

app.jwt.secret=CHANGE_THIS_SUPER_SECRET
app.jwt.access-token-exp-min=60
app.jwt.refresh-token-exp-days=7

payment.stripe.public-key=pk_test_xxx
payment.stripe.secret-key=sk_test_xxx
payment.stripe.webhook-secret=whsec_xxx

payment.razorpay.key-id=rzp_test_xxx
payment.razorpay.key-secret=xxxxxxx

app.base-url=http://localhost:${server.port}

````markdown
**Frontend — `.env`**
```env
VITE_API_BASE_URL=http://localhost:5005/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
VITE_RAZORPAY_KEY_ID=rzp_test_xxx
````

---

## 🗃 Database & Seed

```sql
CREATE DATABASE salon_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'salon_user'@'%' IDENTIFIED BY 'salon_pass';
GRANT ALL PRIVILEGES ON salon_db.* TO 'salon_user'@'%';
FLUSH PRIVILEGES;
```

---

## 🔒 Queue Prevention

* Atomic slot check in DB transaction.
* Pending booking with expiry (10 min).
* Unique constraint on `(salon_id, date, start_time)`.
* Interval overlap check.
* Idempotent payment webhooks.

---

## 📚 API Overview

### Auth

* `POST /auth/register`
* `POST /auth/login`
* `POST /auth/refresh`

### Salons

* `GET /salons`
* `GET /salons/{id}`
* `GET /salons/{id}/services`
* `POST /owner/salons`
* `POST /owner/services`

### Bookings

* `POST /bookings`
* `GET /bookings/my`
* `GET /owner/bookings`
* `PUT /owner/bookings/{id}/confirm`

**Create booking payload**

```json
{
  "salonId": 1,
  "serviceId": 5,
  "date": "2025-08-24",
  "startTime": "15:30",
  "paymentMethod": "RAZORPAY"
}
```

### Payments

* `POST /payments/stripe/create-intent`
* `POST /payments/razorpay/create-order`
* Webhooks: `/payments/stripe/webhook`, `/payments/razorpay/webhook`
* `GET /payments/{bookingId}`

---

## 🧭 Owner Portal Features

* Overview metrics, bookings, earnings.
* Services CRUD.
* Bookings approve/reschedule/cancel.
* Payments view/export.
* Transactions ledger.
* Notifications.
* Account settings.

---

## 🙋‍♀️ User Portal Features

* Dashboard with counters.
* My Bookings & receipts.
* Browse salons with filters.
* Book Now + payment.
* Notifications.
* Profile management.

---

## 🏗 Build & Deployment

**Backend**

```bash
cd backend
mvn spring-boot:run
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
npm run build
```

---

## 🧪 Project Scripts

**Frontend**

```bash
npm run dev
npm run build
npm run preview
```

**Backend**

```bash
mvn spring-boot:run
mvn test
mvn package
```

---

## 🤝 Contributing

```bash
git checkout -b feat/amazing-feature
git commit -m "feat: add amazing-feature"
git push origin feat/amazing-feature
```

---

## 📄 License

MIT License

---

## 📝 Notes

* Replace placeholders (API keys, DB creds).
* Update ports in backend/frontend if changed.
* Use test keys for payments locally.
* Extendable to microservices later.

> Happy shipping! ✂️

```

---

✅ Now this **whole chunk is in one big code block** → GitHub won’t split it into broken text/boxes anymore.  

Do you also want me to **merge the intro + features + screenshots + this block** into a **single giant README.md code block**?
```
