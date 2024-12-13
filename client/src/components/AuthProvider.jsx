import { createContext, useContext, useState, useEffect } from 'react';
import { Box, Spinner, Button, VStack, Heading, Text, Container } from '@chakra-ui/react';
import axios from 'axios';

// Create the context
export const AuthContext = createContext(null);

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/auth/status', {
        withCredentials: true
      });
      setIsAuthenticated(response.data.isAuthenticated);
      setUser(response.data.user);
    } catch (error) {
      console.error('Auth status check failed:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = () => {
    window.location.href = 'http://localhost:3000/auth/google';
  };

  const logout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, {
        withCredentials: true
      });
      setIsAuthenticated(false);
      setUser(null);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (isLoading) {
    return (
      <Container centerContent py={20}>
        <Spinner 
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.200"
          color="purple.500"
          size="xl"
        />
        <Text mt={4} color="purple.600">Loading...</Text>
      </Container>
    );
  }

  if (!isAuthenticated) {
    return (
      <Container centerContent py={20}>
        <VStack spacing={6}>
          <Heading size="lg" color="purple.600">Teacher Portal</Heading>
          <Text>Please sign in with your Google account to continue</Text>
          <Button
            colorScheme="purple"
            size="lg"
            onClick={login}
          >
            Sign in with Google
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, isLoading, login, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 