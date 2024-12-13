import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, 
  HelpCircle, 
  BookOpen, 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  ChevronDown,
  ExternalLink,
  Loader2
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

const CourseWork = ({ courseId, courseWorkId }) => {
  const [submissions, setSubmissions] = useState(null);
  const [courseWork, setCourseWork] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log('Fetching course work and submissions:', { courseId, courseWorkId });

        // Fetch course work details first
        const courseWorkResponse = await axios.get(
          `http://localhost:3000/api/courses/${courseId}/coursework/${courseWorkId}`,
          { withCredentials: true }
        );
        console.log('Course work details received:', courseWorkResponse.data);
        setCourseWork(courseWorkResponse.data);

        // Then fetch submissions
        const submissionsResponse = await axios.get(
          `http://localhost:3000/api/courses/${courseId}/coursework/${courseWorkId}/submissions`,
          { withCredentials: true }
        );
        setSubmissions(submissionsResponse.data);

      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && courseWorkId) {
      fetchData();
    }
  }, [courseId, courseWorkId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <SubmissionViewer
      courseId={courseId}
      courseWorkId={courseWorkId}
      title={courseWork?.title}
      submissions={submissions}
    />
  );
};

export default CourseWork; 