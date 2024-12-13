/**
 * CourseList Component
 * 
 * A React component that displays Google Classroom courses in a modern, card-based layout.
 * Includes features for viewing course details, student counts, and quick access to Google Classroom.
 * 
 * @component
 * @example
 * return (
 *   <CourseList />
 * )
 */

import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, 
  ExternalLink, 
  AlertTriangle,
  Loader2,
  GraduationCap,
  BookOpen
} from 'lucide-react';
import StudentList from './StudentList';

/**
 * Main CourseList component
 * @returns {JSX.Element} Rendered component
 */
const CourseList = () => {
  /**
   * States for managing course data and UI
   * @type {[Array, Function]} courses - List of Google Classroom courses
   * @type {[boolean, Function]} isLoading - Loading state indicator
   * @type {[string|null, Function]} error - Error message if any
   */
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetches courses from the API
   * @async
   * @function fetchCourses
   */
  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/courses', {
        withCredentials: true
      });
      setCourses(response.data);
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Opens course in Google Classroom
   * @param {string} courseId - Google Classroom course ID
   */
  const openInClassroom = (courseId) => {
    window.open(`https://classroom.google.com/w/NzMyODMwMTEwMTQ2/t/all`, '_blank');
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center p-8">
          <Loader2 className="h-12 w-12 animate-spin text-purple-500 mx-auto" />
          <p className="mt-4 text-lg text-purple-600 font-medium">
            Loading your magical classroom...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center gap-3 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Error loading courses</h3>
              <p className="text-red-600/80 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalStudents = courses.reduce((total, course) => total + (course.studentCount || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
            My Courses
          </h1>
          <p className="text-gray-600">
            Manage your virtual classrooms and students
          </p>
        </div>

        {/* Stats Cards */}
        <div className="bg-white rounded-xl shadow-sm border border-purple-100 p-6 min-w-[240px]">
          <div className="space-y-6">
            <div className="space-y-1">
              <p className="text-sm font-medium text-purple-600">Total Courses</p>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-purple-500" />
                <span className="text-2xl font-bold text-purple-700">
                  {courses.length}
                </span>
              </div>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-purple-600">Total Students</p>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-500" />
                <span className="text-2xl font-bold text-purple-700">
                  {totalStudents}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center p-8 bg-purple-50 rounded-xl border border-purple-100">
          <p className="text-purple-600 text-lg">No courses found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {courses.map((course) => (
            <div 
              key={course.id}
              className="bg-white rounded-xl shadow-sm border border-purple-100 overflow-hidden
                hover:shadow-md hover:border-purple-300 hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Course Info */}
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h2 className="text-2xl font-bold text-purple-900 truncate">
                        {course.name}
                      </h2>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <span className="font-semibold">Section:</span>
                        <span>{course.section || 'N/A'}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-start">
                      {/* Student Count */}
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-600">Students</p>
                        <div className="flex items-center gap-2">
                          <Users className="h-5 w-5 text-purple-500" />
                          <span className="text-lg font-bold text-purple-700">
                            {course.studentCount || 0}
                          </span>
                        </div>
                      </div>

                      {/* Enrollment Code */}
                      <div className="space-y-1">
                        <p className="font-semibold text-gray-600">Enrollment Code</p>
                        <span className="inline-flex px-3 py-1 bg-purple-100 text-purple-700 
                          rounded-md font-medium text-sm">
                          {course.enrollmentCode || 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => openInClassroom(course.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                        border-2 border-purple-200 text-purple-700 font-medium
                        hover:bg-purple-50 hover:border-purple-300 transition-colors"
                    >
                      <span>Open in Classroom</span>
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Student List */}
                  <div className="bg-purple-50/50 rounded-xl p-6">
                    <StudentList courseId={course.id} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList; 