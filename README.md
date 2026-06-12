# Traffic Fine Management System

A distributed, microservices-based Traffic Fine Management System developed for the Software Architecture module. It enables administrators to manage traffic officers and categories, allows officers to issue traffic violation tickets, and lets drivers query and pay their fines instantly over the web or mobile.

---

## 🏛️ System Architecture

The project is built on a clean microservice architecture using **Spring Boot & Spring Cloud** for the backend, **React + Vite** for the web frontends, and **Flutter** for the mobile application.

*   **Eureka Server (8761)**: Service Registry for microservice discovery.
*   **API Gateway (8090)**: Central routing gate using Spring Cloud Gateway. (Configured on port `8090` to avoid conflicts with local Jenkins on `8080`).
*   **Auth Service (8081)**: Manages users, JWT generation, and role authentication (Admin vs. Officer).
*   **Fine Service (8082)**: Manages traffic fine tickets and category preloads.
*   **Payment Service (8083)**: Simulates banking authorization and issues payment receipts.
*   **Notification Service (8084)**: Simulates SMS dispatch logging.
*   **Report Service (8085)**: Aggregates dashboard analytics.
*   **Database (H2)**: Zero-configuration file-based H2 databases (persisted locally under each service directory `./data/`).

---

## 🛠️ Prerequisites

Before launching the project, ensure you have the following installed:
*   **Java JDK 17** (LTS)
*   **Apache Maven 3.9+**
*   **Node.js 20+ & npm**
*   **Flutter SDK 3.19+**

---

## 🚀 How to Run the Project (Step-by-Step)

### Step 1: Run the Backend Microservices
Open a terminal, navigate to the `backend` directory, and launch the services in order. Wait a few seconds between each command for startup registration:

1.  **Start Eureka Registry**:
    ```bash
    mvn -pl eureka-server spring-boot:run
    ```
2.  **Start Core Microservices**:
    Launch the following in separate terminal sessions:
    ```bash
    mvn -pl auth-service spring-boot:run
    ```
    ```bash
    mvn -pl fine-service spring-boot:run
    ```
    ```bash
    mvn -pl payment-service spring-boot:run
    ```
    ```bash
    mvn -pl notification-service spring-boot:run
    ```
    ```bash
    mvn -pl report-service spring-boot:run
    ```
3.  **Start API Gateway**:
    ```bash
    mvn -pl api-gateway spring-boot:run
    ```

*Verify the services status by visiting the Eureka Dashboard at **[http://localhost:8761](http://localhost:8761)** (All 6 services should register as `UP`).*

---

### Step 2: Start the Web Portals
Run the portals using the following commands:

*   **Admin Portal** (`frontend-admin`):
    Navigate to `frontend-admin`, install packages, and start the Vite dev server:
    ```bash
    npm install
    npm run dev
    ```
    *Access the portal at **[http://localhost:3000](http://localhost:3000)** (Default Login: `admin` / `admin123`).*

*   **Public Settlement Portal** (`frontend-public`):
    Navigate to `frontend-public`, install packages, and start:
    ```bash
    npm install
    npm run dev
    ```
    *Access the portal at **[http://localhost:3001](http://localhost:3001)**.*

---

### Step 3: Run the Mobile Application
Navigate to the `mobile-app` directory and pull packages:
```bash
flutter pub get
```
*You can launch the app on an Android Emulator or connected physical device using `flutter run` or via your IDE.*

---

## 💳 Demo Verification Flow
1.  Open the **Admin Portal** on `http://localhost:3000` and login (`admin`/`admin123`).
2.  Go to the **Register Officer** tab and create a new officer account (e.g., Username: `PC1001`, Badge: `B8821`). The default password will be `PC1001123`.
3.  Issue a fine ticket. (Either via the mobile app, or by logging in as `PC1001` and calling the REST API).
4.  Open the **Public Portal** on `http://localhost:3001` and search for your fine ticket reference.
5.  Proceed to checkout, enter mock card details, and pay. The ticket status will update to `PAID` instantly across all services and reflect on the Admin Dashboard analytics charts!
