# Magic School - Google Classroom Integration

A modern, user-friendly interface for managing Google Classroom courses, built with React and Chakra UI.

![Magic School Interface](screenshot.png)

## 🎯 Features

- **Single Sign-On**: Seamless Google authentication
- **Course Dashboard**: Visual overview of all your courses
- **Student Management**: Track student counts across courses
- **Quick Access**: Direct links to Google Classroom
- **Real-time Updates**: Automatic synchronization with Google Classroom

## 🚀 Getting Started

### For Teachers
1. Click "Connect with Google Classroom"
2. Grant necessary permissions
3. View your courses and student information
4. Use enrollment codes to add new students

### For Developers
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/magic-school.git
   ```

2. Install dependencies:
   ```bash
   npm install
   cd client
   npm install
   ```

3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Google OAuth credentials:
     ```
     GOOGLE_CLIENT_ID=your_client_id
     GOOGLE_CLIENT_SECRET=your_client_secret
     SESSION_SECRET=your_session_secret
     PORT=3000
     ```

4. Start the development servers:
   ```bash
   # Start backend (from root directory)
   node src/server.js

   # Start frontend (from client directory)
   cd client
   npm run dev
   ```

5. Visit `http://localhost:5173` in your browser

### Tech Stack
- Backend: Node.js, Express, Passport.js
- Frontend: React, Chakra UI, Vite
- Authentication: Google OAuth 2.0
- API: Google Classroom API
