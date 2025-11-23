# AI Full-Stack Application

A modern full-stack web application with React frontend and Express.js backend.

## Project Structure

```
AI_REPO/
├── backend/           # Express.js backend server
│   ├── server.js      # Main server file
│   ├── routes/        # API routes
│   └── data/          # Data storage
├── frontend/          # React frontend application
│   ├── public/        # Static assets
│   └── src/           # React source code
└── package.json       # Root package configuration
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Start the backend server:
```bash
npm run dev:backend
```

3. In a new terminal, start the frontend:
```bash
npm run dev:frontend
```

### API Endpoints

- `GET /api/items` - Get all items
- `POST /api/items` - Create a new item
- `PUT /api/items/:id` - Update an item
- `DELETE /api/items/:id` - Delete an item
- `GET /api/health` - Health check endpoint

## Technologies Used

- **Frontend**: React, CSS3
- **Backend**: Node.js, Express.js
- **Data**: JSON file storage
