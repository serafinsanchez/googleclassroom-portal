import {
  Box,
  VStack,
  Icon,
  Text,
  Flex,
  Divider,
  useColorModeValue,
  useToast,
  Button,
} from '@chakra-ui/react';
import {
  FaBook,
  FaClipboardList,
  FaUsers,
  FaCalendarAlt,
  FaBullhorn,
  FaCog,
  FaSignOutAlt,
} from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

const NavItem = ({ icon, children, to, isActive }) => {
  const activeBg = useColorModeValue('purple.50', 'purple.800');
  const hoverBg = useColorModeValue('purple.100', 'purple.700');

  return (
    <Flex
      align="center"
      px="4"
      py="3"
      cursor="pointer"
      role="group"
      fontWeight={isActive ? "bold" : "normal"}
      bg={isActive ? activeBg : 'transparent'}
      color={isActive ? 'purple.500' : undefined}
      _hover={{
        bg: hoverBg,
        color: 'purple.500',
      }}
      borderRadius="md"
      as={Link}
      to={to}
    >
      <Icon
        mr="4"
        fontSize="16"
        as={icon}
      />
      <Text>{children}</Text>
    </Flex>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:3000/api/auth/logout', {}, {
        withCredentials: true
      });
      
      toast({
        title: 'Logged out successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      window.location.href = '/';
    } catch (error) {
      toast({
        title: 'Failed to logout',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      w="250px"
      bg={bgColor}
      borderRight="1px"
      borderColor={borderColor}
      h="100vh"
      position="fixed"
      left="0"
      top="0"
    >
      <VStack spacing="1" align="stretch" h="full">
        <Box p="4">
          <Text
            fontSize="lg"
            fontWeight="bold"
            color="purple.500"
            mb="4"
            textAlign="center"
          >
            Teacher Portal
          </Text>
          <Divider mb="4" />
          
          <NavItem 
            icon={FaBook} 
            to="/courses"
            isActive={location.pathname === '/courses'}
          >
            Courses
          </NavItem>
          
          <NavItem 
            icon={FaClipboardList} 
            to="/assignments"
            isActive={location.pathname === '/assignments'}
          >
            Assignments
          </NavItem>
          
          <NavItem 
            icon={FaUsers} 
            to="/students"
            isActive={location.pathname === '/students'}
          >
            Students
          </NavItem>
          
          <NavItem 
            icon={FaCalendarAlt} 
            to="/calendar"
            isActive={location.pathname === '/calendar'}
          >
            Calendar
          </NavItem>
          
          <NavItem 
            icon={FaBullhorn} 
            to="/announcements"
            isActive={location.pathname === '/announcements'}
          >
            Announcements
          </NavItem>

          <Divider my="4" />
          
          <NavItem 
            icon={FaCog} 
            to="/settings"
            isActive={location.pathname === '/settings'}
          >
            Settings
          </NavItem>
        </Box>

        {/* Logout Section at bottom */}
        <Box mt="auto" p="4" borderTop="1px" borderColor={borderColor}>
          <Button
            onClick={handleLogout}
            leftIcon={<FaSignOutAlt />}
            variant="ghost"
            colorScheme="purple"
            width="full"
            justifyContent="flex-start"
            fontWeight="medium"
            fontSize="md"
            py="3"
          >
            Sign Out
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default Sidebar; 