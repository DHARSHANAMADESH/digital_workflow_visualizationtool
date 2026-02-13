# Digital Workflow Visualization & Approval System

This is a MERN Stack application for managing and visualizing workflows.

## Features
- **User Roles**: Admin, Manager, User.
- **Authentication**: JWT-based secure login/register.
- **Workflow Management**: Create, View, Approve, Reject workflows.
- **Visualization**: Timeline view of workflow status.
- **Dashboard**: Statistics and status overview.

## Project Structure
- `server/`: Node.js + Express + MongoDB API.
- `client/`: React + Vite + Tailwind CSS UI.

## Setup Instructions

### 1. Backend Setup
1. Navigate to the `server` folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure `.env`:
   - Open `.env` and ensure `MONGO_URI` is correct (default is `mongodb://localhost:27017/workflow_db`).
4. Start the server:
   ```bash
   npm run dev
   ```
   Server runs on http://localhost:5000

### 2. Frontend Setup
1. Navigate to the `client` folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   App runs on http://localhost:5173

## Usage Guide
1. **Register**: Create a new account (Default role is 'user').
2. **Login**: Sign in with your credentials.
3. **Create Workflow**: As a user, submit a new workflow request.
4. **Approve/Reject**: As a Manager or Admin, view pending requests and update their status.
5. **Dashboard**: View statistics and the visual timeline of workflows.

## API Endpoints
- `POST /api/auth/register`: Register user.
- `POST /api/auth/login`: Login user.
- `GET /api/workflows`: Get all workflows (filtered by role).
- `POST /api/workflows`: Create workflow.
- `PUT /api/workflows/:id/status`: Update status (Manager/Admin).
- `GET /api/dashboard/stats`: Get dashboard statistics.

"digital workflow"
