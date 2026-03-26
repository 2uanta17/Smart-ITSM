# Smart ITSM

Smart ITSM is a full-stack IT service management platform for handling tickets, approvals, assets, departments, users, and operational dashboards.

## Features
- Ticket lifecycle support: create, list, and view detailed tickets.
- Role-based access control for Admin, Technician, and requester workflows.
- Asset, department, user, and approval management modules.
- Real-time notification and comment updates through SignalR.

## Install

### Frontend (npm)
```bash
cd frontend
npm install
```

### Backend (.NET restore)
```bash
cd api
dotnet restore SmartITSM.sln
```

## Build From Source

### Backend
```bash
cd api
dotnet build SmartITSM.sln -c Release
```

### Frontend
```bash
cd frontend
npm run build
```

## Run (Development)

### Backend API
```bash
cd api/SmartITSM.API
dotnet run
```

### Frontend App
```bash
cd frontend
npm run dev
```