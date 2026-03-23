# Running the Project

Follow these steps to get the Digital Workflow Visualization & Approval System running locally.

## Prerequisites
- Node.js (v20+ recommended)
- MongoDB running locally (default: `mongodb://localhost:27017/workflowDB`)

## 1. Backend Setup
1. Open a terminal in the `/server` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm run dev
   ```
   *The server will run on `http://localhost:5000`.*

## 2. Frontend Setup
1. Open a new terminal in the `/client` directory.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *The client will run on a port like `http://localhost:5173` (check terminal output).*

## 3. Usage
1. Open the frontend URL in your browser.
2. Go to **Create Workflow** to define your first process (e.g., "Holiday Request").
3. Go to **My Requests** and click **New Submission** to start a request.
4. Go to **Approvals** to review and progress the request through the workflow steps.
