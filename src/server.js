/**
 * Express server configuration for Google Classroom integration
 * @module server
 */

require('dotenv').config();
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const ClassroomService = require('./services/classroom.service');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();

// Add body parsing middleware BEFORE routes
app.use(express.json());

// Add CORS configuration before other middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

/**
 * Configure Google OAuth Strategy
 * Scopes:
 * - profile: Basic user info
 * - email: User email
 * - classroom.courses.readonly: View courses
 * - classroom.rosters.readonly: View student rosters
 * - classroom.coursework.students: View course work
 * - classroom.coursework.me: Manage course work
 * - classroom.announcements: View announcements
 */
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    // Store tokens in user object
    const user = {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      accessToken,
      refreshToken
    };
    return done(null, user);
  }
));

// Routes
app.get('/auth/google',
  passport.authenticate('google', { 
    scope: [
      'profile', 
      'email',
      'https://www.googleapis.com/auth/classroom.courses.readonly',
      'https://www.googleapis.com/auth/classroom.rosters.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.students',
      'https://www.googleapis.com/auth/classroom.coursework.me',
      'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
      'https://www.googleapis.com/auth/classroom.student-submissions.me.readonly',
      'https://www.googleapis.com/auth/drive.readonly',
      'https://www.googleapis.com/auth/classroom.profile.emails'
    ],
    accessType: 'offline',
    prompt: 'consent'
  })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Redirect back to the frontend application
    res.redirect('http://localhost:5173');
  }
);

/**
 * API Routes
 * @namespace routes
 */

/**
 * Get authentication status
 * @name GET/api/auth/status
 * @function
 * @returns {Object} Authentication status
 */
app.get('/api/auth/status', (req, res) => {
  res.json({ isAuthenticated: req.isAuthenticated() });
});

app.get('/api/courses', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    console.log('Fetching courses for user:', {
      email: req.user.email,
      hasAccessToken: !!req.user.accessToken,
      hasRefreshToken: !!req.user.refreshToken
    });

    const classroomService = new ClassroomService(
      req.user.accessToken,
      req.user.refreshToken
    );
    
    const courses = await classroomService.getCourses();
    console.log('Courses fetched:', {
      count: courses.length,
      courses: courses.map(c => ({
        id: c.id,
        name: c.name,
        section: c.section
      }))
    });
    
    res.json(courses);
  } catch (error) {
    console.error('Error fetching courses:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });
    res.status(500).json({ 
      error: 'Failed to fetch courses', 
      details: error.message,
      response: error.response?.data
    });
  }
});

// Course work endpoints
app.get('/api/courses/:courseId/work', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const classroomService = new ClassroomService(
      req.user.accessToken,
      req.user.refreshToken
    );
    
    const courseWork = await classroomService.getCourseWorkList(req.params.courseId);
    res.json(courseWork);
  } catch (error) {
    console.error('Error fetching course work:', error);
    res.status(500).json({ 
      error: 'Failed to fetch course work',
      details: error.message
    });
  }
});

// Course calendar endpoint
app.get('/api/courses/:courseId/calendar', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const classroomService = new ClassroomService(
      req.user.accessToken,
      req.user.refreshToken
    );
    const calendar = await classroomService.getCourseCalendar(req.params.courseId);
    res.json(calendar);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch calendar' });
  }
});

// Add this with your other routes
app.get('/api/courses/:courseId/students', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    console.log('Fetching students for course:', {
      courseId: req.params.courseId,
      user: req.user.email,
      hasAccessToken: !!req.user.accessToken,
      hasRefreshToken: !!req.user.refreshToken
    });
    
    const classroomService = new ClassroomService(
      req.user.accessToken,
      req.user.refreshToken
    );

    const students = await classroomService.getCourseStudents(req.params.courseId);
    console.log('Students found:', {
      count: students.length,
      courseId: req.params.courseId,
      sampleStudent: students[0] ? {
        id: students[0].id,
        name: students[0].name
      } : null
    });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', {
      error: error.message,
      stack: error.stack,
      courseId: req.params.courseId,
      user: req.user.email
    });
    
    res.status(500).json({ 
      error: 'Failed to fetch students',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get submissions for specific course work
app.get('/api/courses/:courseId/coursework/:courseWorkId/submissions', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    console.log('Fetching submissions for:', {
      courseId: req.params.courseId,
      courseWorkId: req.params.courseWorkId,
      user: req.user.email
    });

    const classroomService = new ClassroomService(
      req.user.accessToken,
      req.user.refreshToken
    );
    const submissions = await classroomService.getDetailedSubmissions(
      req.params.courseId,
      req.params.courseWorkId
    );

    console.log(`Found ${submissions.length} submissions`);
    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ 
      error: 'Failed to fetch submissions',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Grade submission endpoint
app.post('/api/courses/:courseId/coursework/:courseWorkId/submissions/:submissionId/grade', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const { courseId, courseWorkId, submissionId } = req.params;
    const { grade, feedback } = req.body;

    // Validate input
    if (grade === undefined || grade === null || isNaN(parseInt(grade))) {
      return res.status(400).json({ error: 'Invalid grade provided' });
    }

    console.log('Processing grade submission:', {
      courseId,
      courseWorkId,
      submissionId,
      grade,
      feedback,
      user: req.user.email
    });

    const classroomService = new ClassroomService(
      req.user.accessToken,
      req.user.refreshToken
    );

    const updatedSubmission = await classroomService.gradeSubmission(
      courseId,
      courseWorkId,
      submissionId,
      { grade, feedback }
    );

    console.log('Successfully graded submission:', updatedSubmission);
    res.json(updatedSubmission);
  } catch (error) {
    console.error('Error grading submission:', error);
    res.status(500).json({ 
      error: 'Failed to grade submission',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Add this with your other routes
app.post('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

// Add this near your other routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running', 
    auth_url: '/auth/google',
    status_url: '/api/auth/status',
    courses_url: '/api/courses'
  });
});

// Add this with your other routes
app.get('/api/drive/files/:fileId/content', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const classroomService = new ClassroomService(
      req.user.accessToken,
      req.user.refreshToken
    );
    const content = await classroomService.getFileContent(req.params.fileId);
    res.json(content);
  } catch (error) {
    console.error('Error fetching file content:', error);
    res.status(500).json({ 
      error: 'Failed to fetch file content',
      details: error.message 
    });
  }
});

// Add this with your other routes
app.post('/api/analyze-writing', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  if (!req.body || !req.body.text) {
    return res.status(400).json({ error: 'No text provided for analysis' });
  }

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });

    const completion = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `You are a Writing Adventure Guide analyzing student writing in an encouraging and playful way. Analyze this writing sample and provide detailed feedback in this gamified format:

Writer Level Assessment:
- Overall writer level (1-10) considering grade-appropriate skills
- Total XP earned (100-1000) calculated from:
  • Depth and complexity of ideas (up to 200 XP)
  • Effective use of evidence and examples (up to 150 XP)  
  • Clear organization and structure (up to 150 XP)
  • Distinctive style and voice (up to 125 XP)
  • Grammar and mechanics (up to 125 XP)
  • Vocabulary usage and word choice (up to 125 XP)
  • Creative and original elements (up to 125 XP)


Writing Powers Analysis:
- Identify 2-3 key writing strengths
- For each strength:
  • Give it an epic name (e.g. "Dragon's Voice", "Story Weaver's Grace")
  • Rate mastery level (1-5 stars)
  • Highlight specific examples showing this power in action
  • Provide encouraging feedback about how they used this strength

Example powers:
- Character Conjuring (★★★★☆)
- Plot Weaver's Touch (★★★★★) 
- World Builder's Vision (★★★☆☆)


Quest Progress:

Main quest status (Essay type + progress percentage)
List 3 specific achievements earned
Base these on actual strengths in the writing
Add a "Quest Chain" showing how this piece fits into larger writing goals
Add specific milestone rewards unlocked


Magical Elements:

Identify 3-4 literary devices used (metaphors, similes, personification, etc.)
Rate their power level (Apprentice, Adept, Master, Legendary)
Quote specific examples from the text
Explain the impact each device has on the writing
Suggest ways to level up each magical element


Next Quests:

Suggest 3 specific areas for improvement as side quests
Frame them as epic challenges with clear rewards
Provide tactical tips for success
Include estimated XP rewards for completing each quest
Add bonus objectives for extra mastery points



Please format your response as a JSON object matching this structure:

{
"writerLevel": number,
"xpGained": number,
"writingPowers": [{
"name": string,
"level": number,
"description": string,
"examples": string[]
}],
"questProgress": {
"mainQuest": string,
"progress": number,
"achievements": string[]
},
"magicalElements": {
"spells": [{
"name": string,
"power": string,
"example": string
}]
},
"nextQuests": [{
"title": string,
"reward": string,
"hint": string
}]
}

Writing sample to analyze:
${req.body.text}`
      }]
    });

    try {
      // Log the raw response for debugging
      console.log('Raw completion:', completion);
      
      // Extract just the JSON part from the response
      const responseText = completion.content[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      // Parse the JSON
      const analysisResult = JSON.parse(jsonMatch[0]);
      console.log('Parsed analysis:', analysisResult);
      
      // Validate the response structure
      if (!analysisResult.writerLevel || !analysisResult.xpGained || !analysisResult.writingPowers) {
        console.error('Invalid response structure:', analysisResult);
        throw new Error('Invalid response structure - missing required fields');
      }
      
      res.json(analysisResult);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('Raw response text:', completion.content[0].text);
      res.status(500).json({ 
        error: 'Failed to parse analysis result',
        details: parseError.message,
        rawResponse: completion.content[0].text
      });
    }
  } catch (error) {
    console.error('Writing analysis failed:', error);
    res.status(500).json({ 
      error: 'Failed to analyze writing',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Add a new endpoint to get course work details
app.get('/api/courses/:courseId/coursework/:courseWorkId', async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  try {
    const classroomService = new ClassroomService(
      req.user.accessToken,
      req.user.refreshToken
    );
    
    const courseWork = await classroomService.getCourseWorkDetails(
      req.params.courseId,
      req.params.courseWorkId
    );

    res.json(courseWork);
  } catch (error) {
    console.error('Error fetching course work:', error);
    res.status(500).json({ 
      error: 'Failed to fetch course work',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 