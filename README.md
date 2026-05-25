# Smart ITSM

An enterprise-grade IT Service Management (ITSM) platform built with .NET 9 and React 19. This project demonstrates structured clean architecture, real-time data synchronization, and AI-driven automation for modern IT operations.

## Technical Stack

| Layer         | Technologies                                                    |
| :------------ | :-------------------------------------------------------------- |
| **Backend**   | C#, .NET 9 Web API, Entity Framework Core, SQL Server           |
| **Frontend**  | React 19, Vite, TypeScript, Mantine UI, Zustand, TanStack Query |
| **Real-time** | ASP.NET Core SignalR                                            |
| **AI/ML**     | Google Gemini API (Ticket routing & categorization)             |
| **Security**  | JWT Authentication, Role-Based Access Control (RBAC)            |

## Core Features

### Ticket Lifecycle and SLA Management

- **Workflow Automation**: Full state machine implementation from creation to resolution.
- **SLA Monitoring**: Background workers track resolution deadlines based on priority levels, triggering automatic alerts upon breach.
- **Audit Logging**: Detailed lifecycle logs for assignment, status changes, and approvals to ensure compliance and traceability.
- **Dashboard & Analytics**: Real-time visualization of SLA compliance, technician performance, and ticket trends.

### AI-Powered Operations

- **Automated Triage**: Integrates Gemini AI to analyze ticket titles and descriptions, suggesting optimal categories and priority levels to reduce manual overhead.

### Real-time Collaboration

- **Live Updates**: SignalR integration ensures instant UI synchronization for comments and status changes without page refreshes.
- **Notification System**: Integrated bell notifications and email alerts for ticket updates, approvals, and SLA breaches.
- **Attachment Support**: Support for diagnostic screenshots and logs, allowing technicians to view evidence directly within the ticket.

### Enterprise Workflows

- **Ticket Approvals**: Automated workflows for hardware or high-cost requests requiring administrative sign-off before technician assignment.
- **Asset Management**: Centralized inventory tracking with the ability to link hardware assets directly to support tickets.
- **Organizational Mapping**: Manage departments, users, and roles to mirror your company's structure.
- **Reporting & Analytics**: Automated data exports to Excel for ticket tracking, status auditing, and resolution time analysis.

## Architecture and Design

The backend implements Clean Architecture to ensure the business logic remains decoupled from external frameworks and infrastructure:

- **SmartITSM.Core**: Domain entities, repository interfaces, and Identity abstractions.
- **SmartITSM.Application**: Business logic, DTOs, and service implementations.
- **SmartITSM.Infrastructure**: Persistence layer (EF Core), migrations, and external API integrations.
- **SmartITSM.API**: Request handling, SignalR hubs, and security middleware.

The frontend utilizes a modular folder structure, separating logic, types, and API calls into feature directories (e.g., Tickets, Assets) while maintaining global stores and page-level components for clean separation of concerns.

## Demo Images

<p align="center">
  <img width="400" alt="Dashboard Overview" src="https://github.com/user-attachments/assets/f60ed6f1-e11b-4598-8e42-03d2f70a8fb7" />
  <br><br>
  <img width="400" alt="Ticket Management" src="https://github.com/user-attachments/assets/6810d789-1092-4eb4-9597-2bd22041591c" />
  <br><br>
  <img width="400" alt="SLA Analytics" src="https://github.com/user-attachments/assets/0972006d-f1df-495a-8b6d-2764072a051b" />
</p>

## Getting Started

### Quick Start with Docker

The easiest way to run the entire stack (Database, API, and Frontend) is using [Docker Desktop](https://www.docker.com/products/docker-desktop/).

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/your-username/SmartITSM.git
    cd SmartITSM
    ```

2.  **Configure Secrets**:
    Create a `.env` file in the root directory and add your keys (use `.env.example` as a template if available, or copy the block below):

    ```env
    # Database (SQL Server 2022)
    DB_PASSWORD=YourStrongPassword123!
    DB_NAME=SmartITSM

    # Security (JWT)
    JWT_SECRET=Your_Super_Secret_Key_At_Least_32_Chars
    JWT_ISSUER=SmartITSM
    JWT_AUDIENCE=SmartITSM_UI

    # AI (Gemini)
    GEMINI_API_KEY=your_key_here

    # Frontend/Internal
    FRONTEND_BASE_URL=http://localhost:3000
    VITE_API_URL=http://localhost:8080/api
    ```

3.  **Start the Platform**:

    ```bash
    docker compose up -d --build
    ```

4.  **Seed Demo Data** (Optional but Recommended):
    Run the following command to populate the database with realistic tickets, users, and audit logs:
    ```bash
    # Note: Use // for path if on Windows/Git Bash, or / on Linux/macOS
    docker exec -i smartitsm-db //opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "YourStrongPassword123!" -d SmartITSM -C -I < api/seed-smartitsm-demo-data.sql
    ```

### Access Points

| Service         | URL                                                    |
| :-------------- | :----------------------------------------------------- |
| **Frontend UI** | [http://localhost:3000](http://localhost:3000)         |
| **Backend API** | [http://localhost:8080/api](http://localhost:8080/api) |
| **Database**    | `localhost:1433` (User: `sa`, Pass: `YourPassword`)    |

---

### Manual Alternative Setup (Development)

If you prefer to run services manually for debugging:

#### Prerequisites

- **.NET 9 SDK**
- **Node.js (v20+)**
- **SQL Server**
- **EF Core Global Tools** (`dotnet tool install --global dotnet-ef`)

#### 1. Backend Setup

1. Navigate to: `cd api/SmartITSM.API`
2. Configure `appsettings.Development.json` with your connection string and API keys.
3. Apply migrations:
   ```bash
   dotnet ef database update --project ../SmartITSM.Infrastructure --startup-project .
   ```
4. Run: `dotnet run`

#### 2. Frontend Setup

1. Navigate to: `cd frontend`
2. Install dependencies: `npm install`
3. Create `.env` with `VITE_API_URL=http://localhost:5036/api` (standard .NET dev port)
4. Run: `npm run dev`
   - (Optional) Update `JwtSettings:Key` with a secure random string for production-like testing.
   - (Optional) Configure `MailtrapSettings` or `SmtpSettings` to enable email notifications.

5. **Frontend Setup**:
   - Navigate to the frontend folder:
     ```bash
     cd ../../frontend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file in the `frontend` root and add:
     ```env
     VITE_API_URL=http://localhost:5096/api
     ```

### Running the Project

1.  **Start the Backend**:
    - Open a terminal and navigate to the API folder:
      ```bash
      cd api/SmartITSM.API
      dotnet run
      ```
    - The API documentation (Swagger) will be available at `http://localhost:5096/swagger`.

2.  **Start the Frontend**: - Open a **new** terminal and navigate to the frontend folder:
    `bash
cd frontend
npm run dev
`
    The app should now be running at [http://localhost:5173](http://localhost:5173).
