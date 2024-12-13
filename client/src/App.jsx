import { Box, Flex } from '@chakra-ui/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import AuthProvider from './components/AuthProvider';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Flex minH="100vh">
          <Sidebar />
          <Box ml="250px" w="calc(100% - 250px)" bg="gray.50">
            <MainContent />
          </Box>
        </Flex>
      </Router>
    </AuthProvider>
  );
};

export default App;
