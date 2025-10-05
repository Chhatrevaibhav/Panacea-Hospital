import React, { useState, useEffect } from 'react';
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
  Switch,
  FormHelperText,
} from '@chakra-ui/react';
import { useDatabase } from 'contexts/DatabaseContext';

export default function LogCallModal({ isOpen, onClose, patientId = null, patientName = null, onCallLogged = null }) {
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    patientName: patientName || '',
    callType: 'Outbound',
    callDate: new Date().toISOString().split('T')[0],
    callTime: new Date().toTimeString().slice(0, 5),
    duration: 0,
    sentiment: 'Neutral',
    notes: '',
    callSummary: '',
    followUpRequired: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { callService, patientService, isInitialized } = useDatabase();
  
  // Chakra Color Mode
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Load patients if no specific patient is provided
  const [patients, setPatients] = useState([]);
  
  useEffect(() => {
    if (!patientId && patientService && isInitialized) {
      const allPatients = patientService.getAllPatients();
      setPatients(allPatients);
    }
  }, [patientId, patientService, isInitialized]);

  // Update form data when props change
  useEffect(() => {
    if (patientId && patientName) {
      setFormData(prev => ({
        ...prev,
        patientId: patientId,
        patientName: patientName
      }));
    }
  }, [patientId, patientName]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePatientSelect = (e) => {
    const selectedPatientId = e.target.value;
    const selectedPatient = patients.find(p => p.id === parseInt(selectedPatientId));
    
    setFormData(prev => ({
      ...prev,
      patientId: selectedPatientId,
      patientName: selectedPatient ? `${selectedPatient.first_name} ${selectedPatient.last_name}` : ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug: Log form data
    console.log('Call Form Data:', formData);
    console.log('Patient ID from props:', patientId);
    console.log('Patient Name from props:', patientName);
    
    // Validate required fields
    const requiredFields = ['patientId', 'callDate', 'callTime', 'sentiment'];
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      const isEmpty = !value || (typeof value === 'string' && !value.trim());
      console.log(`Call Field ${field}:`, value, 'isEmpty:', isEmpty);
      return isEmpty;
    });
    
    console.log('Call Missing fields:', missingFields);
    
    if (missingFields.length > 0) {
      toast({
        title: 'Missing Required Fields',
        description: `Please fill in: ${missingFields.join(', ')}`,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!isInitialized || !callService) {
      toast({
        title: 'Service Not Ready',
        description: 'Database services are not initialized yet. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create call record
      const newCall = await callService.createCall({
        patientId: parseInt(formData.patientId),
        patientName: formData.patientName,
        callType: formData.callType,
        callDate: formData.callDate,
        callTime: formData.callTime,
        duration: parseInt(formData.duration),
        sentiment: formData.sentiment,
        notes: formData.notes,
        callSummary: formData.callSummary,
        followUpRequired: formData.followUpRequired,
      });
      
      toast({
        title: 'Call Logged',
        description: `Call with ${formData.patientName} has been logged successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form and close modal
      setFormData({
        patientId: '',
        patientName: '',
        callType: 'Outbound',
        callDate: new Date().toISOString().split('T')[0],
        callTime: new Date().toTimeString().slice(0, 5),
        duration: 0,
        sentiment: 'Neutral',
        notes: '',
        callSummary: '',
        followUpRequired: false,
      });
      
      // Call the callback to refresh the calls list
      if (onCallLogged) {
        onCallLogged();
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error logging call:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to log call. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader color={textColor}>Log New Call</ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              {!patientId && (
                <FormControl isRequired>
                  <FormLabel color={textColor}>Select Patient</FormLabel>
                  <Select
                    name="patientId"
                    value={formData.patientId}
                    onChange={handlePatientSelect}
                    placeholder="Choose a patient"
                    borderColor={borderColor}
                  >
                    {patients.map(patient => (
                      <option key={patient.id} value={patient.id}>
                        {patient.first_name} {patient.last_name} - {patient.phone}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              )}

              <HStack spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel color={textColor}>Call Type</FormLabel>
                  <Select
                    name="callType"
                    value={formData.callType}
                    onChange={handleInputChange}
                    borderColor={borderColor}
                  >
                    <option value="Inbound">Inbound</option>
                    <option value="Outbound">Outbound</option>
                  </Select>
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={textColor}>Call Date</FormLabel>
                  <Input
                    name="callDate"
                    type="date"
                    value={formData.callDate}
                    onChange={handleInputChange}
                    borderColor={borderColor}
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel color={textColor}>Call Time</FormLabel>
                  <Input
                    name="callTime"
                    type="time"
                    value={formData.callTime}
                    onChange={handleInputChange}
                    borderColor={borderColor}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel color={textColor}>Duration (minutes)</FormLabel>
                  <Input
                    name="duration"
                    type="number"
                    value={formData.duration}
                    onChange={handleInputChange}
                    borderColor={borderColor}
                    min="0"
                    max="300"
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel color={textColor}>Call Sentiment</FormLabel>
                <Select
                  name="sentiment"
                  value={formData.sentiment}
                  onChange={handleInputChange}
                  borderColor={borderColor}
                >
                  <option value="Positive">Positive</option>
                  <option value="Neutral">Neutral</option>
                  <option value="Negative">Negative</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Call Notes</FormLabel>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Brief notes about the call..."
                  borderColor={borderColor}
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Call Summary</FormLabel>
                <Textarea
                  name="callSummary"
                  value={formData.callSummary}
                  onChange={handleInputChange}
                  placeholder="Detailed summary of the conversation..."
                  borderColor={borderColor}
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <HStack>
                  <Switch
                    name="followUpRequired"
                    isChecked={formData.followUpRequired}
                    onChange={handleInputChange}
                    colorScheme="brand"
                  />
                  <Box>
                    <FormLabel color={textColor} mb={0}>Follow-up Required</FormLabel>
                    <FormHelperText>Check if this call requires a follow-up action</FormHelperText>
                  </Box>
                </HStack>
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              bg="brand.500"
              color="white"
              _hover={{ bg: "brand.600" }}
              isLoading={isLoading}
              loadingText="Logging..."
            >
              Log Call
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
