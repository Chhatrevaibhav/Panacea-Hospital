import React from 'react';
import { Box, Text, Button, VStack } from '@chakra-ui/react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p={8} textAlign="center">
          <VStack spacing={4}>
            <Text fontSize="2xl" fontWeight="bold" color="red.500">
              Something went wrong
            </Text>
            <Text color="gray.600">
              {this.state.error && this.state.error.toString()}
            </Text>
            <Button
              colorScheme="blue"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </VStack>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
