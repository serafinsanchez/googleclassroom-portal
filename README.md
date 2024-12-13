# Classroom Assistant

A modern, user-friendly interface for managing Google Classroom courses, built with React, Vite, and Chakra UI.


## 🎯 Features

- **Single Sign-On**: Seamless Google authentication
- **Course Dashboard**: Visual overview of all your courses
- **Student Management**: Track student counts across courses
- **Course Materials**: View and manage course materials and assignments
- **Writing Analysis**: AI-powered writing feedback system
- **Real-time Updates**: Automatic synchronization with Google Classroom

## 🚀 Getting Started

### For Teachers
1. Click "Connect with Google Classroom"
2. Grant necessary permissions
3. View your courses and student information
4. Use the writing analyzer for student submissions
5. Manage course materials and assignments

### For Developers
1. Clone the repository:
   ```bash
   git clone https://github.com/serafinsanchez/googleclassroom-portal.git
   ```

2. Install dependencies:
   ```bash
   # Install backend dependencies
   npm install

   # Install frontend dependencies
   cd client
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with:
   ```
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   SESSION_SECRET=your_session_secret
   ANTHROPIC_API_KEY=your_anthropic_api_key
   PORT=3000
   ```

4. Start the development servers:
   ```bash
   # Start backend (from root directory)
   node src/server.js

   # Start frontend (in another terminal, from client directory)
   cd client
   npm run dev
   ```

5. Visit `http://localhost:5173` in your browser

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Authentication**: Passport.js with Google OAuth 2.0
- **APIs**: Google Classroom API, Anthropic Claude API
- **Middleware**: CORS, express-session

### Frontend
- **Framework**: React 18 with Vite
- **UI Library**: Chakra UI
- **Styling**: TailwindCSS
- **Icons**: @chakra-ui/icons, react-icons, lucide-react
- **HTTP Client**: Axios
- **Routing**: React Router DOM

### Development
- **Package Manager**: npm
- **Linting**: ESLint
- **Build Tool**: Vite
- **CSS Processing**: PostCSS, Autoprefixer

## 📝 API Endpoints

- `/auth/google`: Google OAuth authentication
- `/api/auth/status`: Check authentication status
- `/api/courses`: Get list of courses
- `/api/courses/:courseId/work`: Get course work
- `/api/courses/:courseId/students`: Get course students
- `/api/analyze-writing`: AI writing analysis
- `/api/drive/files/:fileId/content`: Get file content

## 🔒 Security

- Secure session management
- OAuth 2.0 authentication
- Environment variable protection
- CORS configuration
- HTTP-only cookies
