import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  HelpCircle, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  ExternalLink,
  Loader2,
  ChevronRight,
  Users
} from 'lucide-react';
import SubmissionViewer from './SubmissionViewer';

const workTypeIcons = {
  ASSIGNMENT: FileText,
  QUESTION: HelpCircle,
  MATERIAL: BookOpen,
};

const workTypeStyles = {
  ASSIGNMENT: {
    gradient: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
    hover: 'hover:border-blue-300 hover:bg-blue-50/80'
  },
  QUESTION: {
    gradient: 'bg-gradient-to-r from-green-500 to-teal-500',
    bg: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200',
    hover: 'hover:border-green-300 hover:bg-green-50/80'
  },
  MATERIAL: {
    gradient: 'bg-gradient-to-r from-purple-500 to-pink-500',
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200',
    hover: 'hover:border-purple-300 hover:bg-purple-50/80'
  }
};

const AssignmentCard = ({ work, stats, course, onSelect, selected, submissions }) => {
  const Icon = workTypeIcons[work.workType] || FileText;
  const styles = workTypeStyles[work.workType] || workTypeStyles.ASSIGNMENT;

  // Calculate submission stats
  const submissionPercentage = stats.total > 0 
    ? Math.round((stats.turnedIn / stats.total) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      <div 
        onClick={() => onSelect(work, course)}
        className={`
          p-6 rounded-xl border cursor-pointer transition-all duration-200
          ${selected ? 
            `${styles.border} ${styles.bg} shadow-lg` : 
            'border-gray-200 hover:border-gray-300 hover:shadow-md'
          }
        `}
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${styles.gradient}`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{work.title}</h3>
                <p className="text-sm text-gray-500">
                  {work.description || 'No description'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <div className="text-sm font-medium text-gray-900">
                  {stats.turnedIn} of {stats.total} submitted
                </div>
                <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${styles.gradient}`}
                    style={{ width: `${submissionPercentage}%` }}
                  />
                </div>
              </div>
              <ChevronRight className={`h-5 w-5 text-gray-400 transition-transform duration-200
                ${selected ? 'rotate-90' : ''}`} 
              />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-4">
            <div className={`p-3 rounded-lg ${styles.bg}`}>
              <div className="text-sm font-medium text-gray-600">Points</div>
              <div className={`${styles.text} font-semibold`}>
                {work.maxPoints || 'Ungraded'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submissions Section */}
      {selected && submissions && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 
          transform transition-all duration-200">
          <SubmissionViewer
            courseId={course.id}
            courseWorkId={work.id}
            title={work.title}
            submissions={submissions}
            submissionStats={work.submissionStats}
          />
        </div>
      )}
    </div>
  );
};

const AssignmentList = () => {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);
  const [submissions, setSubmissions] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get('http://localhost:3000/api/courses', {
        withCredentials: true
      });
      
      const coursesWithWork = await Promise.all(
        response.data.map(async (course) => {
          const workResponse = await axios.get(
            `http://localhost:3000/api/courses/${course.id}/work`,
            { withCredentials: true }
          );
          return {
            ...course,
            courseWork: workResponse.data
          };
        })
      );
      
      setCourses(coursesWithWork);
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectWork = async (work, course) => {
    try {
      // If clicking the same work, toggle it off
      if (selectedWork?.id === work.id) {
        setSelectedWork(null);
        setSubmissions(null);
        return;
      }

      // Set loading state by setting selected work without submissions first
      setSelectedWork(work);
      
      // Fix: Update the API endpoint to match your backend route
      const response = await axios.get(
        `http://localhost:3000/api/courses/${course.id}/coursework/${work.id}/submissions`,
        { withCredentials: true }
      );
      
      // Update submissions
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError('Failed to load submissions');
      // Reset selected work if submissions fetch fails
      setSelectedWork(null);
    }
  };

  const getSubmissionStats = (stats) => {
    if (!stats) return { total: 0, turnedIn: 0 };
    return {
      total: stats.studentCount || 0,
      turnedIn: stats.turnedInStudents || 0
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
          <p className="mt-2 text-purple-600">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3 text-red-600">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-semibold">Error loading assignments</h3>
            <p className="text-red-600/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {courses.map(course => (
        <div key={course.id} className="space-y-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white">
              <BookOpen className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">{course.name}</h2>
          </div>

          <div className="space-y-4">
            {course.courseWork?.map(work => (
              <AssignmentCard 
                key={work.id} 
                work={work}
                course={course}
                stats={getSubmissionStats(work.submissionStats)}
                onSelect={handleSelectWork}
                selected={selectedWork?.id === work.id}
                submissions={selectedWork?.id === work.id ? submissions : null}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AssignmentList; 