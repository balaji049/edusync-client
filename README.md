# EduSync - Community Learning Platform

> A full-stack platform that brings real-time collaboration, resource management, and AI-powered assistance together in one place for students and educators.

---

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Live Demo](#live-demo)
- [Screenshots](#screenshots)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Key Workflows](#key-workflows)
- [API Endpoints](#api-endpoints)
- [Role-Based Access Control](#role-based-access-control)
- [Deployment](#deployment)
- [Testing Scenarios](#testing-scenarios)
- [Challenges & Design Decisions](#challenges--design-decisions)
- [Future Enhancements](#future-enhancements)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

EduSync is a full-stack, community-based learning platform designed to bridge the gap between how students communicate and how they actually learn. It combines real-time chat, a structured resource management system, an AI-powered contextual assistant, and voice/video collaboration — all in a single, unified interface.

The platform is inspired by tools like Discord, Google Classroom, and Slack, and adapts the best parts of each into an educational context.

---

## Problem Statement

Traditional learning platforms tend to fail students and educators in a few key ways:

- Communication is slow, asynchronous, and scattered across multiple tools
- Resources get buried inside chat threads or uploaded to disconnected storage systems
- There is no intelligent, context-aware support when students get stuck
- Voice and video collaboration requires jumping to a completely separate platform
- No clear separation of roles and permissions between students, teachers, and admins

EduSync was built to address all of these problems in one cohesive system.

---

## Solution

EduSync solves these problems through four core pillars:

1. **Centralized community space** - all learning happens in one place, organized by community channels
2. **Real-time chat with file sharing** - instant messaging with typing indicators, file support, and message search
3. **Dedicated resource hub** - a separate, well-organized space for uploads so they don't clutter the chat
4. **Context-aware AI assistant** — pulls recent conversation history to give intelligent, relevant responses

---

## Live Demo

> Frontend: [https://edusync.onrender.com](https://edusync.onrender.com)  
> Backend API: [https://edusync-api.onrender.com](https://edusync-api.onrender.com)

*(Update these links once deployed)*

---

## Screenshots

> *(Add screenshots here once the app is deployed)*

| Feature | Preview |
|---|---|
| Community Chat | `screenshots/chat.png` |
| Resource Hub | `screenshots/resources.png` |
| AI Assistant | `screenshots/ai-assistant.png` |
| Voice/Video Call | `screenshots/jitsi-call.png` |
| Dashboard | `screenshots/dashboard.png` |

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React.js | UI framework |
| React Router | Client-side routing |
| Context API | Auth and call state management |
| Axios | HTTP requests to the backend |
| CSS (custom) | Styling and layout |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Server runtime |
| Express.js | REST API framework |
| MongoDB + Mongoose | Database and ODM |
| Socket.IO | Real-time bidirectional communication |
| Multer | File upload handling |
| JWT | Authentication and authorization |

### AI Integration

| Technology | Purpose |
|---|---|
| OpenAI API | Primary AI provider for the assistant |
| Cloudflare AI | Fallback AI provider (architecture is ready) |

### Media & Real-time

| Technology | Purpose |
|---|---|
| Socket.IO | Live chat, typing indicators, resource updates |
| Jitsi Meet SDK | In-platform voice and video calls |

### Deployment

| Service | Purpose |
|---|---|
| Render | Frontend and backend hosting |
| MongoDB Atlas | Cloud database |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│         Pages / Components / Context / Services         │
└────────────┬──────────────────────────┬─────────────────┘
             │ REST API (Axios)          │ Socket.IO
             ▼                           ▼
┌─────────────────────────────────────────────────────────┐
│                  Backend (Express.js)                    │
│        Controllers / Routes / Middleware / Socket       │
└────────────┬──────────────────────────┬─────────────────┘
             │                           │
             ▼                           ▼
┌─────────────────────┐     ┌─────────────────────────────┐
│  MongoDB (Atlas)    │     │   OpenAI / Cloudflare AI    │
│  Users, Messages,  │     │   Context-aware responses   │
│  Resources         │     └─────────────────────────────┘
└─────────────────────┘

Media Layer:
┌──────────────────────────────────────┐
│         Jitsi Meet SDK               │
│   Voice / Video calls (frontend)    │
└──────────────────────────────────────┘
```

---

## Features

### Real-Time Chat

- Channel-based messaging organized by community
- Typing indicators visible to all users in a channel
- Support for both text messages and file attachments
- Message normalization and formatting
- AI-generated responses integrated into chat
- Message search with result highlighting and jump-to-message navigation

### Resource Management

**Community Page (Preview)**
- Displays the latest 4 uploaded resources
- Lightweight card-based UI to avoid cluttering the main community page

**Dedicated Resource Page**
- Full grid layout with image and PDF previews
- View count and download tracking per resource
- Real-time analytics updates via Socket.IO
- Admin controls for editing and deleting resources

### Role-Based Access Control

| Role | Permissions |
|---|---|
| Student | View resources, participate in chat |
| Teacher | Upload resources, edit own uploads, chat |
| Admin | Full platform control — edit, delete, manage all resources and users |

### AI Assistant

- Fetches recent chat messages and uses them as context before generating a response
- Functions as both a conversation assistant and a subject-matter tutor
- Designed to give relevant, contextual answers rather than generic replies
- Fallback architecture in place for switching AI providers without code changes

### Voice & Video Calls

- Powered by the Jitsi Meet SDK, embedded directly inside the platform
- Supports voice-only and full video modes
- Users can join calls directly from the chat without leaving the page
- Call state managed globally via Context API

### Search

- Full message search within channels
- Highlights matching terms in results
- Jump-to-message functionality for quick navigation

---

## Project Structure

```
edusync/
├── edusync-client/                   # Frontend (React)
│   ├── public/
│   └── src/
│       ├── components/
│       │   └── community/
│       │       ├── ChatWindow.jsx
│       │       ├── ResourcePanelPreview.jsx
│       │       ├── CommunityResourcesPage.jsx
│       │       ├── MembersPanel.jsx
│       │       ├── JitsiRoom.jsx
│       │       └── ...
│       ├── context/
│       │   └── AuthContext.js
│       ├── services/
│       │   ├── api.js
│       │   └── socket.js
│       ├── pages/
│       │   ├── Community/
│       │   ├── Dashboard/
│       │   ├── Auth/
│       │   └── Profile/
│       └── App.js
│
└── edusync-server/                   # Backend (Node.js + Express)
    ├── controllers/
    │   ├── authController.js
    │   ├── resourceController.js
    │   └── aiController.js
    ├── models/
    │   ├── User.js
    │   ├── Message.js
    │   └── Resource.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── resourceRoutes.js
    │   └── aiRoutes.js
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── upload.js
    ├── socket.js
    └── server.js
```

---

## Getting Started

### Prerequisites

Make sure you have the following installed before running the project:

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account (or a local MongoDB instance)
- OpenAI API key

### 1. Clone the repository

```bash
git clone https://github.com/your-username/edusync.git
cd edusync
```

### 2. Set up the backend

```bash
cd edusync-server
npm install
```

Create a `.env` file in the `edusync-server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
OPENAI_API_KEY=your_openai_api_key
```

Start the backend server:

```bash
npm run dev
```

The backend will be running at `http://localhost:5000`.

### 3. Set up the frontend

Open a new terminal window:

```bash
cd edusync-client
npm install
```

Create a `.env` file in the `edusync-client` directory:

```env
REACT_APP_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm start
```

The app will be running at `http://localhost:3000`.

---

## Environment Variables

### Backend (`edusync-server/.env`)

| Variable | Description | Required |
|---|---|---|
| `PORT` | Port the server runs on | Yes |
| `MONGO_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | Secret key for signing JWTs | Yes |
| `OPENAI_API_KEY` | OpenAI API key for the AI assistant | Yes |

### Frontend (`edusync-client/.env`)

| Variable | Description | Required |
|---|---|---|
| `REACT_APP_API_URL` | Base URL of the backend API | Yes |

---

## Key Workflows

### File Upload Flow

```
User selects and uploads a file
        ↓
Multer middleware processes the file on the backend
        ↓
A new Resource document is created in MongoDB
        ↓
A linked Message is created referencing the resource
        ↓
Socket.IO emits an event to all users in the channel
        ↓
UI updates in real time for all connected users
```

### Chat Message Flow

```
User types and sends a message
        ↓
REST API saves the message to MongoDB
        ↓
Socket.IO broadcasts the message to the channel
        ↓
All connected users receive it instantly
```

### AI Assistant Flow

```
User submits a question in chat
        ↓
Backend fetches the last N messages from the channel as context
        ↓
Context + question are sent to the OpenAI API
        ↓
AI response is returned and displayed in the chat
```

---

## API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/register` | Register a new user | No |
| POST | `/login` | Login and receive a JWT | No |
| GET | `/me` | Get the logged-in user's profile | Yes |

### Resource Routes — `/api/resources`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/` | Get all resources for a community | Yes |
| POST | `/` | Upload a new resource | Yes (Teacher/Admin) |
| PUT | `/:id` | Edit a resource | Yes (Teacher/Admin) |
| DELETE | `/:id` | Delete a resource | Yes (Admin) |
| POST | `/:id/view` | Increment view count | Yes |
| POST | `/:id/download` | Increment download count + serve file | Yes |

### AI Routes — `/api/ai`

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/ask` | Send a question with chat context to the AI | Yes |

---

## Role-Based Access Control

EduSync uses JWT-based authentication combined with role checks in middleware.

```
Student  →  Can view resources and send messages
Teacher  →  Can upload and edit their own resources, plus all Student permissions
Admin    →  Full control: edit/delete any resource, manage users, plus all Teacher permissions
```

Role is stored on the User model and verified on protected routes using `authMiddleware.js`.

---

## Deployment

### Frontend (Render)

1. Connect your GitHub repository to Render
2. Set the build command: `npm run build`
3. Set the publish directory: `build`
4. Add the environment variable: `REACT_APP_API_URL=<your_backend_url>`

### Backend (Render)

1. Connect your GitHub repository to Render
2. Set the start command: `node server.js`
3. Add all required environment variables in the Render dashboard (`MONGO_URI`, `JWT_SECRET`, `OPENAI_API_KEY`, `PORT`)

### Database (MongoDB Atlas)

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Whitelist your backend's IP address (or use `0.0.0.0/0` for development)
3. Copy the connection string and set it as `MONGO_URI` in your backend environment

---

## Testing Scenarios

To verify the platform is working end to end, walk through the following scenarios:

1. **Auth** — Register a new account, log in, verify the JWT is stored and used in subsequent requests
2. **Community** — Join or create a community, verify the channel list loads correctly
3. **Chat** — Send a text message, verify it appears in real time for other users in the same channel
4. **File Upload** — Upload a PDF or image as a resource, verify it appears in the resource panel and the dedicated resource page
5. **AI Query** — Ask a question in the chat, verify the AI response is contextual and relevant
6. **Voice/Video** — Start a call, verify Jitsi loads and another user can join
7. **Resource Management (Admin)** — Edit a resource title, delete a resource, verify changes reflect immediately
8. **Search** — Search for a keyword in messages, verify highlighting and jump-to-message work correctly

---

## Challenges & Design Decisions

### Resource System Refactor

The most significant architectural decision during development was separating resources from the chat system. Early on, resources were embedded directly inside the chat flow, which caused two problems: the chat became visually cluttered as uploads grew, and performance degraded because the client was fetching full resource data alongside every message batch.

The solution was to split the system into two layers — a lightweight preview panel on the community page showing the latest four resources, and a fully independent resource page with its own API, grid layout, and analytics. This mirrors how Discord separates its file attachments from its server channels, and how Google Classroom separates its Stream from its Classwork tab.

### AI Context Awareness

A generic chatbot that just answers isolated questions adds limited value in an educational platform. The AI assistant in EduSync fetches the last several messages from the current channel before sending a request to the AI API, so the response is grounded in what the class or group is actually working on. This made the assistant significantly more useful as a tutor and less like a search engine.

---

## Future Enhancements

- **Resource search and filtering** — search across all uploaded resources by title, type, or uploader
- **Pinned resources** — allow admins and teachers to pin important resources to the top of the resource page
- **AI-generated summaries** — automatically summarize long resource documents and discussion threads
- **Analytics dashboard** — a dedicated page showing community activity, resource engagement, and member participation
- **Mobile responsiveness** — full support for mobile browsers
- **Notification system** — real-time notifications for new messages, uploads, and AI responses
- **Dark mode** — user-controlled theme switching

---

## Contributing

Contributions are welcome. If you find a bug or have a feature suggestion, feel free to open an issue or submit a pull request.

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "Add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a pull request

Please make sure your code is clean, well-commented, and tested before submitting.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  Built with React, Node.js, MongoDB, Socket.IO, and OpenAI
</div>
