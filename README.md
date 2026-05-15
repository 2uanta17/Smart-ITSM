# Smart ITSM

An enterprise-grade IT Service Management (ITSM) platform built with .NET 9 and React 19. This project demonstrates structured clean architecture, real-time data synchronization, and AI-driven automation for modern IT operations.

## Technical Stack

| Layer         | Technologies                                              |
| :------------ | :-------------------------------------------------------- |
| **Backend**   | C#, .NET 9 Web API, Entity Framework Core, SQL Server     |
| **Frontend**  | React 19, Vite, TypeScript, Mantine UI, Zustand, TanStack Query |
| **Real-time** | ASP.NET Core SignalR                                      |
| **AI/ML**     | Google Gemini API (Ticket routing & categorization)       |
| **Security**  | JWT Authentication, Role-Based Access Control (RBAC)      |

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

### Prerequisites

*   **.NET 9 SDK**
*   **Node.js (v18+)**
*   **SQL Server**
*   **EF Core Global Tools** (`dotnet tool install --global dotnet-ef`)

### Installation

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/your-username/SmartITSM.git
    cd SmartITSM
    ```

2.  **Backend Setup**:
    *   Navigate to the API folder:
        ```bash
        cd api/SmartITSM.API
        ```
    *   Update the connection string in `appsettings.json` (or `appsettings.Development.json`):
        ```json
        "ConnectionStrings": {
          "DefaultConnection": "Server=YOUR_SERVER;Database=SmartITSM;Trusted_Connection=True;TrustServerCertificate=True"
        }
        ```
    *   Apply database migrations:
        ```bash
        dotnet ef database update --project ../SmartITSM.Infrastructure --startup-project .
        ```

> [!NOTE]
> As the demo seeding script is not included in the public repository, you will need to manually initialize the database with an Admin user or refer to the internal documentation for bootstrapping instructions.

3.  **Configuration**:
    *   Open `api/SmartITSM.API/appsettings.json` and provide your **Gemini API Key**.
    *   (Optional) Update `JwtSettings:Key` with a secure random string for production-like testing.
    *   (Optional) Configure `MailtrapSettings` or `SmtpSettings` to enable email notifications.

4.  **Frontend Setup**:
    *   Navigate to the frontend folder:
        ```bash
        cd ../../frontend
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```
    *   Create a `.env` file in the `frontend` root and add:
        ```env
        VITE_API_URL=http://localhost:5096/api
        ```

### Running the Project

1.  **Start the Backend**:
    *   Open a terminal and navigate to the API folder:
        ```bash
        cd api/SmartITSM.API
        dotnet run
        ```
    *   The API documentation (Swagger) will be available at `http://localhost:5096/swagger`.

2.  **Start the Frontend**:
    *   Open a **new** terminal and navigate to the frontend folder:
        ```bash
        cd frontend
        npm run dev
        ```
    The app should now be running at [http://localhost:5173](http://localhost:5173).


