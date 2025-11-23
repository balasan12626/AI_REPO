# AI MediaHub - Full-Stack Application

A modern multi-page web application featuring a YouTube-like video platform and Google Drive-like file management system.

## Features

### Video Library (YouTube Clone)
- Browse videos by category (Music, Gaming, Education, Entertainment, Sports, Tech, News)
- Search videos
- Video player with related videos
- Like/Dislike functionality
- Upload new videos
- View counts and channel info

### File Manager (Google Drive Clone)
- Browse files and folders
- Create new folders
- Upload files (drag & drop or click to browse)
- Grid and List view modes
- File type icons (PDF, documents, images, videos, code, etc.)
- Breadcrumb navigation
- Rename and delete files/folders
- File download support

## Project Structure

```
AI_REPO/
├── backend/
│   ├── server.js           # Express server with CORS
│   ├── routes/
│   │   ├── videos.js       # Video API endpoints
│   │   └── files.js        # File system API endpoints
│   ├── data/
│   │   ├── videos.json     # Video data storage
│   │   └── files.json      # File metadata storage
│   └── uploads/            # Uploaded files directory
├── frontend/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js          # Main app with routing
│       ├── App.css         # Global styles
│       ├── pages/
│       │   ├── Home.js     # Landing page
│       │   ├── Videos.js   # Video library page
│       │   └── Files.js    # File manager page
│       ├── components/
│       │   ├── common/     # Navbar, Sidebar
│       │   ├── videos/     # VideoCard, VideoPlayer, VideoUpload
│       │   └── files/      # FileCard, FolderCard, Breadcrumb, etc.
│       └── services/
│           └── api.js      # API service layer
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. Install backend dependencies:
```bash
cd backend && npm install
```

2. Install frontend dependencies:
```bash
cd frontend && npm install
```

### Running the Application

1. Start the backend server (port 5000):
```bash
cd backend && npm start
```

2. In a new terminal, start the frontend (port 3000):
```bash
cd frontend && npm start
```

3. Open http://localhost:3000 in your browser

## API Endpoints

### Videos API
- `GET /api/videos` - Get all videos (supports ?category= and ?search= params)
- `GET /api/videos/:id` - Get single video (increments view count)
- `POST /api/videos` - Create new video
- `PUT /api/videos/:id` - Update video
- `POST /api/videos/:id/reaction` - Like or dislike video
- `DELETE /api/videos/:id` - Delete video

### Files API
- `GET /api/files` - Get files and folders (supports ?folderId= and ?search= params)
- `GET /api/files/:id` - Get single file/folder
- `POST /api/files/folder` - Create new folder
- `POST /api/files/upload` - Upload file (multipart/form-data)
- `PUT /api/files/:id` - Rename file/folder
- `PUT /api/files/:id/move` - Move file/folder
- `DELETE /api/files/:id` - Delete file/folder
- `GET /api/files/:id/path` - Get breadcrumb path

### Health Check
- `GET /api/health` - Server status

## Technologies Used

- **Frontend**: React 18, React Router v6, CSS3
- **Backend**: Node.js, Express.js, Multer (file uploads)
- **Data Storage**: JSON files
- **Styling**: Custom CSS with modern UI/UX
