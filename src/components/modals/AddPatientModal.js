import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useColorModeValue,
  VStack,
  HStack,
  Text,
  useToast,
  Box,
} from '@chakra-ui/react';
import { useDatabase } from 'contexts/DatabaseContext';

export default function AddPatientModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    partnerName: '',
    address: '',
    emergencyContact: '',
    emergencyPhone: '',
    medicalHistory: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { patientService } = useDatabase();
  
  // Chakra Color Mode
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'dateOfBirth', 'gender', 'partnerName'];
    const missingFields = requiredFields.filter(field => !formData[field].trim());
    
    if (missingFields.length > 0) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please fill in all required fields.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Save patient to database
      const newPatient = patientService.createPatient(formData);
      
      toast({
        title: 'Patient Added Successfully',
        description: `${formData.firstName} ${formData.lastName} has been added to the system.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form and close modal
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        partnerName: '',
        address: '',
        emergencyContact: '',
        emergencyPhone: '',
        medicalHistory: '',
      });
      onClose();
      
    } catch (error) {
      console.error('Error adding patient:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to add patient. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent bg={bgColor} m={0} borderRadius={0} maxW="100vw" maxH="100vh">
        <ModalHeader color={textColor} fontSize="2xl" fontWeight="bold" py={6} px={8}>
          <HStack justify="space-between" w="100%" align="center">
            <Text>Add New Patient</Text>
            <HStack spacing={4} align="center">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={onClose}
                px={6}
                h="45px"
                fontSize="sm"
                fontWeight="600"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="patient-form"
                bg="brand.500"
                color="white"
                _hover={{ bg: "brand.600" }}
                isLoading={isLoading}
                loadingText="Adding..."
                size="lg"
                px={6}
                h="45px"
                fontSize="sm"
                fontWeight="600"
              >
                Add New Patient
              </Button>
              <ModalCloseButton size="lg" position="relative" top={0} right={0} />
            </HStack>
          </HStack>
        </ModalHeader>
        <form id="patient-form" onSubmit={handleSubmit}>
          <ModalBody px={8} pb={0} maxH="calc(100vh - 120px)" overflowY="auto">
            <VStack spacing={6} maxW="1200px" mx="auto" pb={8}>
              {/* Personal Information Section */}
              <Box w="100%" p={6} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="lg">
                <Text fontSize="xl" fontWeight="bold" color={textColor} mb={4}>
                  Personal Information
                </Text>
                <VStack spacing={4}>
                  <HStack spacing={6} w="100%">
                    <FormControl isRequired>
                      <FormLabel color={textColor} fontSize="md" fontWeight="600">First Name</FormLabel>
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        placeholder="Enter first name"
                        borderColor={borderColor}
                        size="lg"
                        h="50px"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel color={textColor} fontSize="md" fontWeight="600">Last Name</FormLabel>
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        placeholder="Enter last name"
                        borderColor={borderColor}
                        size="lg"
                        h="50px"
                      />
                    </FormControl>
                  </HStack>

                  <HStack spacing={6} w="100%">
                    <FormControl isRequired>
                      <FormLabel color={textColor} fontSize="md" fontWeight="600">Email Address</FormLabel>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter email address"
                        borderColor={borderColor}
                        size="lg"
                        h="50px"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel color={textColor} fontSize="md" fontWeight="600">Phone Number</FormLabel>
                      <Input
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Enter phone number"
                        borderColor={borderColor}
                        size="lg"
                        h="50px"
                      />
                    </FormControl>
                  </HStack>

                  <HStack spacing={6} w="100%">
                    <FormControl isRequired>
                      <FormLabel color={textColor} fontSize="md" fontWeight="600">Date of Birth</FormLabel>
                      <Input
                        name="dateOfBirth"
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        borderColor={borderColor}
                        size="lg"
                        h="50px"
                      />
                    </FormControl>
                    <FormControl isRequired>
                      <FormLabel color={textColor} fontSize="md" fontWeight="600">Gender</FormLabel>
                      <Select
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        placeholder="Select gender"
                        borderColor={borderColor}
                        size="lg"
                        h="50px"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </Select>
                    </FormControl>
                  </HStack>

                  <FormControl isRequired>
                    <FormLabel color={textColor} fontSize="md" fontWeight="600">Partner Name</FormLabel>
                    <Input
                      name="partnerName"
                      value={formData.partnerName}
                      onChange={handleInputChange}
                      placeholder="Enter partner name"
                      borderColor={borderColor}
                      size="lg"
                      h="50px"
                    />
                  </FormControl>
                </VStack>
              </Box>

              {/* Address Section */}
              <Box w="100%" p={6} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="lg">
                <Text fontSize="xl" fontWeight="bold" color={textColor} mb={4}>
                  Address Information
                </Text>
                <FormControl>
                  <FormLabel color={textColor} fontSize="md" fontWeight="600">Full Address</FormLabel>
                  <Textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter complete address including street, city, state, and postal code"
                    borderColor={borderColor}
                    size="lg"
                    minH="100px"
                    resize="vertical"
                  />
                </FormControl>
              </Box>

              {/* Emergency Contact Section */}
              <Box w="100%" p={6} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="lg">
                <Text fontSize="xl" fontWeight="bold" color={textColor} mb={4}>
                  Emergency Contact
                </Text>
                <HStack spacing={6} w="100%">
                  <FormControl>
                    <FormLabel color={textColor} fontSize="md" fontWeight="600">Emergency Contact Name</FormLabel>
                    <Input
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleInputChange}
                      placeholder="Emergency contact name"
                      borderColor={borderColor}
                      size="lg"
                      h="50px"
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel color={textColor} fontSize="md" fontWeight="600">Emergency Contact Phone</FormLabel>
                    <Input
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleInputChange}
                      placeholder="Emergency contact phone number"
                      borderColor={borderColor}
                      size="lg"
                      h="50px"
                    />
                  </FormControl>
                </HStack>
              </Box>

              {/* Medical History Section */}
              <Box w="100%" p={6} bg={useColorModeValue("gray.50", "gray.700")} borderRadius="lg">
                <Text fontSize="xl" fontWeight="bold" color={textColor} mb={4}>
                  Medical Information
                </Text>
                <FormControl>
                  <FormLabel color={textColor} fontSize="md" fontWeight="600">Medical History</FormLabel>
                  <Textarea
                    name="medicalHistory"
                    value={formData.medicalHistory}
                    onChange={handleInputChange}
                    placeholder="Enter any relevant medical history, allergies, current medications, or other important health information"
                    borderColor={borderColor}
                    size="lg"
                    minH="120px"
                    resize="vertical"
                  />
                </FormControl>
              </Box>
            </VStack>
          </ModalBody>

        </form>
      </ModalContent>
    </Modal>
  );
}
