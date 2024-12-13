const { google } = require('googleapis');

/**
 * Service class for interacting with Google Classroom API
 * @class ClassroomService
 */
class ClassroomService {
  /**
   * Creates an instance of ClassroomService
   * @param {string} accessToken - Google OAuth access token
   * @param {string} refreshToken - Google OAuth refresh token
   */
  constructor(accessToken, refreshToken) {
    this.auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/auth/google/callback'
    );
    
    this.auth.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    this.classroom = google.classroom({ version: 'v1', auth: this.auth });
  }

  /**
   * Fetches all active courses with student counts
   * @async
   * @returns {Promise<Array>} Array of course objects with student counts
   * @throws {Error} If API request fails
   */
  async getCourses() {
    try {
      console.log('Fetching courses...');
      const response = await this.classroom.courses.list({
        pageSize: 10,
        courseStates: ['ACTIVE']
      });

      if (!response.data.courses) {
        return [];
      }

      // Fetch student counts for each course
      const coursesWithStudents = await Promise.all(
        response.data.courses.map(async (course) => {
          const studentCount = await this.getStudentCount(course.id);
          return {
            ...course,
            studentCount
          };
        })
      );

      return coursesWithStudents;
    } catch (error) {
      console.error('Error in getCourses:', error);
      throw error;
    }
  }

  /**
   * Gets total student count for a specific course
   * @async
   * @param {string} courseId - Google Classroom course ID
   * @returns {Promise<number>} Total number of students
   */
  async getStudentCount(courseId) {
    try {
      const response = await this.classroom.courses.students.list({
        courseId,
        pageSize: 1,  // We only need the page token to get total count
        fields: 'students(profile(name)),nextPageToken'  // Optimize response size
      });

      let totalStudents = 0;
      let pageToken = null;

      do {
        const pageResponse = await this.classroom.courses.students.list({
          courseId,
          pageSize: 30,
          pageToken,
          fields: 'students(profile(name)),nextPageToken'
        });

        totalStudents += (pageResponse.data.students || []).length;
        pageToken = pageResponse.data.nextPageToken;
      } while (pageToken);

      return totalStudents;
    } catch (error) {
      console.error(`Error getting student count for course ${courseId}:`, error);
      return 0;  // Return 0 if there's an error (e.g., no access to student list)
    }
  }

  /**
   * Gets students for a specific course
   * @async
   * @param {string} courseId - Course ID
   * @returns {Promise<Array>} List of students
   */
  async getCourseStudents(courseId) {
    try {
      console.log(`Fetching students for course ${courseId}`);
      
      const response = await this.classroom.courses.students.list({
        courseId,
        pageSize: 100,
        fields: 'students(userId,profile,courseId)',
      });

      console.log('Raw API Response:', JSON.stringify(response.data, null, 2));

      const students = response.data.students || [];
      
      // Map the response to a simpler format
      return students.map(student => ({
        id: student.userId,
        name: student.profile.name.fullName,
        email: student.profile.emailAddress,
        photoUrl: student.profile.photoUrl,
        courseId: student.courseId
      }));
    } catch (error) {
      console.error('Error in getCourseStudents:', error);
      throw error;
    }
  }

  /**
   * Fetches all course work for a specific course
   * @async
   * @param {string} courseId - Google Classroom course ID
   * @returns {Promise<Array>} Array of course work items with submission stats
   */
  async getCourseWork(courseId) {
    try {
      const response = await this.classroom.courses.courseWork.list({
        courseId,
        courseWorkStates: ['PUBLISHED'],
        orderBy: 'dueDate desc'
      });

      if (!response.data.courseWork) {
        return [];
      }

      // Enhance with submission statistics
      const workWithStats = await Promise.all(
        response.data.courseWork.map(async (work) => {
          const stats = await this.getSubmissionStats(courseId, work.id);
          return {
            ...work,
            submissionStats: stats
          };
        })
      );

      return workWithStats;
    } catch (error) {
      console.error('Error fetching course work:', error);
      throw error;
    }
  }

  /**
   * Gets submission statistics for course work
   * @async
   * @param {string} courseId - Course ID
   * @param {string} courseWorkId - Course work ID
   * @returns {Promise<Object>} Submission statistics
   */
  async getSubmissionStats(courseId, courseWorkId) {
    try {
      const response = await this.classroom.courses.courseWork.studentSubmissions.list({
        courseId,
        courseWorkId,
        states: ['TURNED_IN', 'RETURNED', 'NEW']
      });

      const submissions = response.data.studentSubmissions || [];
      return {
        total: submissions.length,
        turnedIn: submissions.filter(s => s.state === 'TURNED_IN').length,
        graded: submissions.filter(s => s.state === 'RETURNED').length,
        pending: submissions.filter(s => s.state === 'NEW').length
      };
    } catch (error) {
      console.error('Error fetching submission stats:', error);
      return { total: 0, turnedIn: 0, graded: 0, pending: 0 };
    }
  }

  /**
   * Creates a new announcement in a course
   * @async
   * @param {string} courseId - Course ID
   * @param {Object} announcement - Announcement details
   * @returns {Promise<Object>} Created announcement
   */
  async createAnnouncement(courseId, { text, materials = [] }) {
    try {
      return await this.classroom.courses.announcements.create({
        courseId,
        requestBody: {
          text,
          materials,
          state: 'PUBLISHED'
        }
      });
    } catch (error) {
      console.error('Error creating announcement:', error);
      throw error;
    }
  }

  /**
   * Gets course topics
   * @async
   * @param {string} courseId - Course ID
   * @returns {Promise<Array>} Course topics
   */
  async getTopics(courseId) {
    try {
      const response = await this.classroom.courses.topics.list({
        courseId
      });
      return response.data.topic || [];
    } catch (error) {
      console.error('Error fetching topics:', error);
      throw error;
    }
  }

  /**
   * Gets course calendar
   * @async
   * @param {string} courseId - Course ID
   * @returns {Promise<Array>} Calendar events
   */
  async getCourseCalendar(courseId) {
    try {
      const work = await this.getCourseWork(courseId);
      return work.map(item => ({
        id: item.id,
        title: item.title,
        dueDate: item.dueDate,
        type: item.workType,
        maxPoints: item.maxPoints,
        submissionStats: item.submissionStats
      }));
    } catch (error) {
      console.error('Error creating calendar:', error);
      throw error;
    }
  }

  /**
   * Invites a teacher to a course
   * @async
   * @param {string} courseId - Course ID
   * @param {string} email - Teacher's email
   */
  async inviteTeacher(courseId, email) {
    try {
      await this.classroom.courses.teachers.create({
        courseId,
        requestBody: {
          userId: email
        }
      });
    } catch (error) {
      console.error('Error inviting teacher:', error);
      throw error;
    }
  }

  /**
   * Gets course materials
   * @async
   * @param {string} courseId - Course ID
   * @returns {Promise<Array>} Course materials
   */
  async getCourseMaterials(courseId) {
    try {
      const work = await this.getCourseWork(courseId);
      const materials = work.reduce((acc, item) => {
        if (item.materials) {
          acc.push(...item.materials.map(m => ({
            ...m,
            fromAssignment: item.title
          })));
        }
        return acc;
      }, []);
      return materials;
    } catch (error) {
      console.error('Error fetching materials:', error);
      throw error;
    }
  }

  /**
   * Gets detailed submissions for a specific course work
   * @async
   * @param {string} courseId - Course ID
   * @param {string} courseWorkId - Course work ID
   * @returns {Promise<Array>} Detailed submission data
   */
  async getDetailedSubmissions(courseId, courseWorkId) {
    try {
      console.log(`Fetching submissions for course ${courseId}, work ${courseWorkId}`);
      
      // First, get all submissions without field filtering
      const response = await this.classroom.courses.courseWork.studentSubmissions.list({
        courseId,
        courseWorkId,
        states: ['TURNED_IN', 'RETURNED', 'NEW', 'CREATED']
      });

      console.log('Raw API Response:', JSON.stringify(response.data, null, 2));

      // Get student details for each submission
      const submissions = response.data.studentSubmissions || [];
      console.log('Number of submissions found:', submissions.length);

      if (submissions.length === 0) {
        console.log('No submissions found in response');
        return [];
      }

      const submissionsWithDetails = await Promise.all(
        submissions.map(async (submission) => {
          try {
            console.log(`Fetching details for submission ${submission.id}, user ${submission.userId}`);
            const studentResponse = await this.classroom.userProfiles.get({
              userId: submission.userId
            });

            return {
              id: submission.id,
              userId: submission.userId,
              state: submission.state,
              late: submission.late,
              assignedGrade: submission.assignedGrade,
              alternateLink: submission.alternateLink,
              creationTime: submission.creationTime,
              updateTime: submission.updateTime,
              assignmentSubmission: submission.assignmentSubmission,
              shortAnswerSubmission: submission.shortAnswerSubmission,
              multipleChoiceSubmission: submission.multipleChoiceSubmission,
              student: {
                name: studentResponse.data.name.fullName,
                email: studentResponse.data.emailAddress,
                photoUrl: studentResponse.data.photoUrl
              }
            };
          } catch (error) {
            console.error(`Error fetching student details for ${submission.userId}:`, error);
            return submission;
          }
        })
      );

      console.log('Final processed submissions:', JSON.stringify(submissionsWithDetails, null, 2));
      return submissionsWithDetails;
    } catch (error) {
      console.error('Error in getDetailedSubmissions:', error);
      throw error;
    }
  }

  /**
   * Gets submission files and attachments
   * @async
   * @param {string} courseId - Course ID
   * @param {string} courseWorkId - Course work ID
   * @param {string} submissionId - Submission ID
   * @returns {Promise<Array>} Submission files and attachments
   */
  async getSubmissionAttachments(courseId, courseWorkId, submissionId) {
    try {
      const response = await this.classroom.courses.courseWork.studentSubmissions.get({
        courseId,
        courseWorkId,
        id: submissionId,
        fields: 'attachments'
      });

      return response.data.attachments || [];
    } catch (error) {
      console.error('Error fetching submission attachments:', error);
      throw error;
    }
  }

  /**
   * Grades a student submission
   * @param {string} courseId - Course ID
   * @param {string} courseWorkId - Course work ID
   * @param {string} submissionId - Submission ID
   * @param {Object} gradeData - Grade data
   * @returns {Promise<Object>} Updated submission
   */
  async gradeSubmission(courseId, courseWorkId, submissionId, gradeData) {
    try {
      console.log('[ClassroomService] Starting grading process:', {
        courseId,
        courseWorkId,
        submissionId,
        grade: gradeData.grade
      });

      // First get the current submission state
      const submission = await this.classroom.courses.courseWork.studentSubmissions.get({
        courseId,
        courseWorkId,
        id: submissionId
      });

      console.log('[ClassroomService] Current submission state:', {
        state: submission.data.state,
        currentGrade: submission.data.assignedGrade
      });

      // Try to update the grade
      const gradeUpdate = await this.classroom.courses.courseWork.studentSubmissions.patch({
        courseId,
        courseWorkId,
        id: submissionId,
        requestBody: {
          assignedGrade: parseInt(gradeData.grade)
        },
        updateMask: 'assignedGrade'
      });

      console.log('[ClassroomService] Grade updated:', {
        assignedGrade: gradeUpdate.data.assignedGrade
      });

      // Return the submission
      const returnResponse = await this.classroom.courses.courseWork.studentSubmissions.return({
        courseId,
        courseWorkId,
        id: submissionId
      });

      console.log('[ClassroomService] Submission returned:', {
        state: returnResponse.data.state,
        grade: returnResponse.data.assignedGrade
      });

      return returnResponse.data;

    } catch (error) {
      console.error('[ClassroomService] Grading process failed:', {
        error: error.message,
        response: error.response?.data,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Gets file content from Google Drive
   * @async
   * @param {string} fileId - Google Drive file ID
   * @returns {Promise<Object>} File content and metadata
   */
  async getFileContent(fileId) {
    try {
      const drive = google.drive({ version: 'v3', auth: this.auth });
      const docs = google.docs({ version: 'v1', auth: this.auth });
      
      // Get file metadata
      const metadata = await drive.files.get({
        fileId,
        fields: 'mimeType'
      });

      const mimeType = metadata.data.mimeType;

      // Handle Google Docs
      if (mimeType === 'application/vnd.google-apps.document') {
        const doc = await docs.documents.get({
          documentId: fileId
        });

        // Extract text content from the document
        let content = '';
        doc.data.body.content.forEach(element => {
          if (element.paragraph) {
            element.paragraph.elements.forEach(el => {
              if (el.textRun) {
                content += el.textRun.content;
              }
            });
          }
        });

        return {
          type: 'text',
          content: content,
          mimeType
        };
      }

      // Handle regular text files
      if (mimeType.startsWith('text/')) {
        const response = await drive.files.get({
          fileId,
          alt: 'media'
        });
        return {
          type: 'text',
          content: response.data,
          mimeType
        };
      }

      // Handle images
      if (mimeType.startsWith('image/')) {
        const response = await drive.files.get({
          fileId,
          alt: 'media'
        }, {
          responseType: 'arraybuffer'
        });
        const content = Buffer.from(response.data).toString('base64');
        return {
          type: 'image',
          content,
          mimeType
        };
      }

      // For other file types
      return {
        type: 'unsupported',
        mimeType
      };
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw error;
    }
  }

  /**
   * Gets course work details including formatted due date
   * @param {string} courseId - Course ID
   * @param {string} courseWorkId - Course work ID
   * @returns {Promise<Object>} Course work details with formatted due date
   */
  async getCourseWorkDetails(courseId, courseWorkId) {
    try {
      console.log('[ClassroomService] Fetching course work details for:', {
        courseId,
        courseWorkId
      });

      // Get course work details
      const response = await this.classroom.courses.courseWork.get({
        courseId,
        id: courseWorkId
      });

      // Get submission stats
      const submissionStats = await this.classroom.courses.courseWork.studentSubmissions.list({
        courseId,
        courseWorkId,
        fields: 'studentSubmissions(state)'
      });

      // Calculate submission stats
      const stats = {
        studentCount: 0,
        turnedInStudents: 0
      };

      if (submissionStats.data.studentSubmissions) {
        stats.studentCount = submissionStats.data.studentSubmissions.length;
        stats.turnedInStudents = submissionStats.data.studentSubmissions.filter(
          sub => sub.state === 'TURNED_IN' || sub.state === 'RETURNED'
        ).length;
      }

      console.log('[ClassroomService] Final result:', {
        title: result.title
      });

      return result;

    } catch (error) {
      console.error('[ClassroomService] Error fetching course work details:', {
        error: error.message,
        courseId,
        courseWorkId,
        stack: error.stack
      });
      throw error;
    }
  }

  /**
   * Gets course work list with submission stats
   * @param {string} courseId - Course ID
   * @returns {Promise<Array>} List of course work with submission stats
   */
  async getCourseWorkList(courseId) {
    try {
      // Get all course work
      const response = await this.classroom.courses.courseWork.list({
        courseId,
        orderBy: 'updateTime desc'
      });

      if (!response.data.courseWork) {
        return [];
      }

      // Get submission stats for each course work
      const courseWorkWithStats = await Promise.all(
        response.data.courseWork.map(async (work) => {
          const submissionStats = await this.classroom.courses.courseWork.studentSubmissions.list({
            courseId,
            courseWorkId: work.id,
            fields: 'studentSubmissions(state)'
          });

          const stats = {
            studentCount: 0,
            turnedInStudents: 0
          };

          if (submissionStats.data.studentSubmissions) {
            stats.studentCount = submissionStats.data.studentSubmissions.length;
            stats.turnedInStudents = submissionStats.data.studentSubmissions.filter(
              sub => sub.state === 'TURNED_IN' || sub.state === 'RETURNED'
            ).length;
          }

          return {
            ...work,
            submissionStats: stats
          };
        })
      );

      console.log('[ClassroomService] Course work with stats:', 
        courseWorkWithStats.map(work => ({
          title: work.title,
          stats: work.submissionStats
        }))
      );

      return courseWorkWithStats;

    } catch (error) {
      console.error('Error fetching course work list:', error);
      throw error;
    }
  }
}

module.exports = ClassroomService; 