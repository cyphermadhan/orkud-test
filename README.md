# VibeSignal - Simple Message Sharing Platform

A minimal social media platform similar to Orkut/Reddit where users can share posts, follow each other, like and comment on posts.

## Features

- **Home Page**: View all posts from all users
- **Create Posts**: Share text posts with emojis
- **User Profiles**: View and edit your profile, or view other users' profiles
- **Follow Users**: Follow other users to stay connected
- **Like & Comment**: Interact with posts by liking and commenting
- **Search**: Search for posts and users
- **Help & Support**: Contact support and raise tickets

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

1. Install all dependencies:
```bash
npm run install:all
```

2. Start the development servers:
```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:3000`

### Project Structure

```
├── client/          # React frontend application
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/      # Page components
│   │   └── ...
│   └── package.json
├── server/          # Express backend API
│   ├── server.js    # Main server file
│   ├── data.json    # Data storage (created automatically)
│   └── package.json
└── package.json     # Root package.json
```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. You'll be logged in as a demo user automatically (no authentication required)
3. Start creating posts, following users, and interacting with the platform!

## API Endpoints

- `GET /api/user/current` - Get current user
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create a new post
- `GET /api/posts/:id` - Get a specific post
- `POST /api/posts/:id/like` - Like/unlike a post
- `POST /api/posts/:id/comment` - Comment on a post
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get a specific user
- `POST /api/users/:id/follow` - Follow/unfollow a user
- `GET /api/search/posts?q=query` - Search posts
- `GET /api/search/users?q=query` - Search users
- `PUT /api/users/:id` - Update user profile
- `DELETE /api/users/:id` - Delete user profile
- `POST /api/support/tickets` - Create support ticket
- `GET /api/support/tickets` - Get support tickets

## Notes

- Authentication is not implemented - users are automatically logged in as a demo user
- Data is stored in `server/data.json` (created automatically)
- All data persists between server restarts

## Technologies Used

- **Frontend**: React, React Router, Axios, Vite
- **Backend**: Node.js, Express
- **Storage**: JSON file (simple file-based storage)
