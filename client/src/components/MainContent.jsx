import { Routes, Route, Navigate } from 'react-router-dom';
import CourseList from './CourseList';
import AssignmentList from './AssignmentList';
import StudentList from './StudentList';
import Calendar from './Calendar';
import Announcements from './Announcements';
import Settings from './Settings';

const MainContent = () => {
  return (
    <div className="p-8 ml-64 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/courses" replace />} />
          <Route path="/courses" element={<CourseList />} />
          <Route path="/assignments" element={<AssignmentList />} />
          <Route path="/students" element={<StudentList courseId="732830110146" />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  );
};

export default MainContent; 