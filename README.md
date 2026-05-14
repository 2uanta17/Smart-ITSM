# Smart ITSM

An enterprise-grade IT Service Management (ITSM) platform built with .NET 9 and React 19. This project demonstrates structured clean architecture, real-time data synchronization, and AI-driven automation for modern IT operations.

## Technical Stack

| Layer         | Technologies                                              |
| :------------ | :-------------------------------------------------------- |
| **Backend**   | .NET 9 Web API, Entity Framework Core, SQL Server         |
| **Frontend**  | React 19, TypeScript, Mantine UI, Zustand, TanStack Query |
| **Real-time** | ASP.NET Core SignalR                                      |
| **AI/ML**     | Google Gemini API (Ticket routing & categorization)       |
| **Security**  | JWT Authentication, Role-Based Access Control (RBAC)      |

## Core Features

### Ticket Lifecycle and SLA Management

- **Workflow Automation**: Full state machine implementation from creation to resolution.
- **SLA Monitoring**: Background workers track resolution deadlines based on priority levels, triggering automatic escalations upon breach.
- **Audit Logging**: Comprehensive immutable logs for every status change and assignment to ensure compliance.

### AI-Powered Operations

- **Automated Triage**: Integrates Gemini AI to analyze ticket descriptions, suggesting optimal categories and technician assignments to reduce manual overhead.
- **Smart Suggestions**: Provides initial troubleshooting steps based on historical ticket data.

### Real-time Collaboration

- **Live Updates**: SignalR integration ensures instant UI synchronization for comments and status changes without page refreshes.
- **Attachment Support**: Integrated multimodal support for diagnostic screenshots and logs.

### Enterprise Workflows

- **Multi-Level Approvals**: Custom logic for hardware or high-cost requests requiring departmental manager sign-off.
- **Asset Management**: Centralized inventory tracking with direct linking between hardware assets and support history.

## Architecture and Design

The backend implements Clean Architecture to ensure the business logic remains decoupled from external frameworks and infrastructure:

- **SmartITSM.Core**: Domain entities and repository interfaces (zero external dependencies).
- **SmartITSM.Application**: Business logic, DTOs, and service implementations.
- **SmartITSM.Infrastructure**: Persistence layer (EF Core), migrations, and external API integrations.
- **SmartITSM.API**: Request handling, SignalR hubs, and security middleware.

The frontend utilizes a Feature-Based Folder Structure, encapsulating logic, state, and components by module (e.g., Tickets, Assets, Dashboard) to ensure scalability.

## Demo Images
<img width="2856" height="2409" alt="localhost_5173_app_tickets" src="https://github.com/user-attachments/assets/f60ed6f1-e11b-4598-8e42-03d2f70a8fb7" width="400" />
<br>
<img width="2880" height="1800" alt="localhost_5173_app_tickets (1)" src="https://github.com/user-attachments/assets/6810d789-1092-4eb4-9597-2bd22041591c" width="400" />
<br>
<img width="2880" height="1800" alt="localhost_5173_app_tickets (2)" src="https://github.com/user-attachments/assets/0972006d-f1df-495a-8b6d-2764072a051b" width="400" />

## Getting Started

### Prerequisites

*   **.NET 9 SDK**
*   **Node.js (v18+)**
*   **SQL Server**

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
    *   (Optional) Seed demo data using `seed-smartitsm-demo-data.sql` in your SQL tool.

3.  **Frontend Setup**:
    *   Navigate to the frontend folder:
        ```bash
        cd ../../frontend
        ```
    *   Install dependencies:
        ```bash
        npm install
        ```

### Running the Project

1.  **Start the Backend**:
    ```bash
    cd api/SmartITSM.API
    dotnet run
    ```

2.  **Start the Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```
    The app should now be running at `http://localhost:5173`.


