import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, 
  Users, 
  Loader2, 
  AlertTriangle,
  GraduationCap
} from 'lucide-react';

const StudentList = ({ courseId }) => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      if (!courseId) {
        setError('No course ID provided');
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching students for course:', courseId);
        setIsLoading(true);
        setError(null);
        
        const response = await axios.get(
          `http://localhost:3000/api/courses/${courseId}/students`,
          { withCredentials: true }
        );
        
        console.log('Students API response:', response.data);
        setStudents(response.data || []);
      } catch (error) {
        console.error('Error fetching students:', error.response || error);
        setError(
          error.response?.data?.error || 
          error.response?.data?.details || 
          error.message || 
          'Failed to fetch students'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [courseId]);

  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto" />
        <p className="mt-2 text-purple-600">Loading students...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3 text-red-600">
          <AlertTriangle className="h-5 w-5 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-semibold">Error loading students</h3>
            <p className="text-red-600/80">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-lg bg-white shadow-sm">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-purple-700 flex items-center gap-2">
            <Users className="h-5 w-5" />
            Students
          </h2>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            {students.length} Students
          </span>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 
              focus:border-purple-400 focus:ring-2 focus:ring-purple-100 
              transition-colors duration-200"
          />
        </div>

        {/* Student List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 
          scrollbar-thin scrollbar-thumb-purple-200 scrollbar-track-transparent">
          {filteredStudents.map((student) => (
            <div 
              key={student.id}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100
                hover:border-purple-200 hover:bg-purple-50/50 transition-all duration-200"
            >
              {/* Avatar */}
              {student.photoUrl ? (
                <img 
                  src={student.photoUrl} 
                  alt={student.name}
                  className="h-10 w-10 rounded-full object-cover border-2 border-purple-100"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-purple-500" />
                </div>
              )}

              {/* Student Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 truncate">
                  {student.name}
                </h3>
                <p className="text-sm text-gray-500 truncate">
                  {student.email}
                </p>
              </div>
            </div>
          ))}

          {filteredStudents.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No students found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentList; 