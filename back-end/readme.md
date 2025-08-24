
````markdown
# 💇‍♂️ Salon Management System — Backend

This is the **Spring Boot + MySQL** backend for the Salon Management System.  
It provides **REST APIs** for users and salon owners to handle authentication, bookings, payments, and notifications.  

---

## 🛠 Tech Stack
- **Spring Boot 3**
- **Spring Security + JWT**
- **Spring Data JPA (Hibernate)**
- **MySQL**
- **Maven**
- **Stripe & Razorpay SDKs**

---

## 🚀 Getting Started

### Prerequisites
- **Java 17+**
- **Maven 3.9+**
- **MySQL 8**
- Stripe & Razorpay API keys

---

### 🔧 Installation
```bash
# clone the repo
git clone https://github.com/your-username/salon-management-system.git

# go to backend folder
cd salon-management-system/backend

# build the project
mvn clean install
````

---

### ⚙️ Environment Setup

Update your `src/main/resources/application.properties`:

```properties
server.port=5005

spring.datasource.url=jdbc:mysql://localhost:3306/salon_db?useSSL=false&serverTimezone=UTC
spring.datasource.username=YOUR_DB_USER
spring.datasource.password=YOUR_DB_PASS

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.open-in-view=false

app.jwt.secret=CHANGE_THIS_SECRET
app.jwt.access-token-exp-min=60
app.jwt.refresh-token-exp-days=7

app.cors.allowed-origins=http://localhost:5173

payment.stripe.public-key=pk_test_xxx
payment.stripe.secret-key=sk_test_xxx
payment.stripe.webhook-secret=whsec_xxx

payment.razorpay.key-id=rzp_test_xxx
payment.razorpay.key-secret=xxxxxxx
```

---

### 🗃 Database Setup

```sql
CREATE DATABASE salon_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'salon_user'@'%' IDENTIFIED BY 'salon_pass';
GRANT ALL PRIVILEGES ON salon_db.* TO 'salon_user'@'%';
FLUSH PRIVILEGES;
```

---

## 📚 API Overview

### 🔐 Auth

* `POST /auth/register`
* `POST /auth/login`
* `POST /auth/refresh`

### 🏪 Salons

* `GET /salons`
* `GET /salons/{id}`
* `GET /salons/{id}/services`
* `POST /owner/salons`
* `POST /owner/services`

### 📅 Bookings

* `POST /bookings`
* `GET /bookings/my`
* `GET /owner/bookings`
* `PUT /owner/bookings/{id}/confirm`

**Sample booking payload**

```json
{
  "salonId": 1,
  "serviceId": 5,
  "date": "2025-08-24",
  "startTime": "15:30",
  "paymentMethod": "RAZORPAY"
}
```

### 💳 Payments

* `POST /payments/stripe/create-intent`
* `POST /payments/razorpay/create-order`
* Webhooks: `/payments/stripe/webhook`, `/payments/razorpay/webhook`
* `GET /payments/{bookingId}`

---

## 🏗 Build & Run

```bash
# build jar
mvn -DskipTests package

# run jar
java -jar target/*.jar

# OR run directly
mvn spring-boot:run
```

---

## 🧪 Testing

```bash
mvn test
```

---

## 📂 Project Structure

```
backend/
│── src/
│   ├── main/
│   │   ├── java/com/salonmanagement/
│   │   │   ├── controller/     # REST Controllers
│   │   │   ├── model/          # Entities
│   │   │   ├── repository/     # Repositories
│   │   │   ├── service/        # Business Logic
│   │   │   └── config/         # Security, JWT, CORS
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/ (if needed)
│   └── test/
│       └── java/com/salonmanagement/
│
├── pom.xml
```

---

## 📦 Features

* User & Owner authentication with JWT
* Salon & Service management
* Queue prevention (no double booking)
* Secure Payments (Stripe / Razorpay / Pay at Salon)
* Notifications for booking updates
* Transaction history & earnings report

---

## 📄 License

MIT License

---

## 📝 Notes

* Always use **test keys** for payments in local/dev environments.
* Update both frontend `.env` and backend `application.properties` if you change API ports.
* Can be extended to **microservices** in future.

> 🚀 Backend ready to run!

```

---

Do you want me to also make a **root-level README.md** that combines both **frontend + backend instructions** in one place (like a master guide for the whole repo)?
```
