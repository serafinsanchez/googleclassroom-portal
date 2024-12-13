import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { School, Users, BookOpen, Check } from 'lucide-react';

const IntegrationDemo = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [courses, setCourses] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      setIsAuthenticated(data.isAuthenticated);
      if (data.isAuthenticated) {
        loadCourses();
      }
    } catch (error) {
      setStatus('Error checking authentication status');
    }
  };

  const handleLogin = () => {
    window.location.href = '/auth/google';
  };

  const loadCourses = async () => {
    try {
      const response = await fetch('/api/courses');
      const data = await response.json();
      setCourses(data);
      setStatus('Courses loaded successfully');
    } catch (error) {
      setStatus('Error loading courses');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="h-6 w-6" />
            Google Classroom Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleLogin}
              disabled={isAuthenticated}
              className="w-full"
            >
              {isAuthenticated ? 'Connected to Google Classroom' : 'Connect to Google Classroom'}
              {isAuthenticated && <Check className="ml-2 h-4 w-4" />}
            </Button>

            {status && (
              <Alert>
                <AlertTitle>Status Update</AlertTitle>
                <AlertDescription>{status}</AlertDescription>
              </Alert>
            )}

            {isAuthenticated && (
              <div className="grid gap-4">
                {courses.map((course) => (
                  <Card key={course.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        <div>
                          <h3 className="font-medium">{course.name}</h3>
                          <p className="text-sm text-gray-500">Section: {course.section}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <span>{course.enrollmentCode}</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntegrationDemo; 