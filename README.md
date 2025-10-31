# Dropbox Clone

A production-ready full-stack file storage application built with React and Node.js, containerized with Docker.

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Nginx
- **Backend**: Node.js, Express, Multer
- **Database**: PostgreSQL 15

## Prerequisites

- Docker installed
- Docker Compose installed

## Production Deployment

### Quick Start

```bash
# Build and start all services
docker compose up -d --build

# View logs
docker compose logs -f

# Stop all services
docker compose down
```

### Environment Variables

Create a `.env` file in the project root to customize configuration:

```env
# Frontend
FRONTEND_PORT=80

# Backend
BACKEND_PORT=5000
CLIENT_ORIGIN=http://your-domain.com

# Database
POSTGRES_DB=dropbox_clone
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
```

**Default values** are used if `.env` file is not provided.

### Access

- **Frontend**: http://localhost (or http://localhost:${FRONTEND_PORT})
- **Backend API**: http://localhost:${BACKEND_PORT}/api
- **PostgreSQL**: Accessible within Docker network only

## Docker Commands

```bash
# Check container status
docker compose ps

# View specific service logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres

# Rebuild and restart
docker compose up -d --build

# Stop and remove containers
docker compose down

# Stop and remove containers + volumes (WARNING: Assuming data)
docker compose down -v

# Restart a specific service
docker compose restart backend
```

## API Endpoints

- `GET /api/files` - Get all files
- `POST /api/files/upload` - Upload a file
- `GET /api/files/:id/view` - View a file
- `GET /api/files/:id/download` - Download a file
- `DELETE /api/files/:id` - Delete a file

## Features

- 📤 Upload files
- 👁️ View files (images, PDFs, videos, audio, text files)
- ⬇️ Download files
- 🗑️ Delete files
- 🔒 Production-ready with health checks
- 💾 Persistent data storage with Docker volumes

## Project Structure

```
dropbox-clone/
├── docker-compose.yml      # Production Docker configuration
├── .env                    # Environment variables (create this)
├── client/                 # React frontend
└── server/                 # Node.js backend
```
