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
  Textarea,
  useColorModeValue,
  VStack,
  HStack,
  Text,
  useToast,
  Box,
} from '@chakra-ui/react';
import { useDatabase } from 'contexts/DatabaseContext';

export default function RescheduleAppointmentModal({ isOpen, onClose, appointment, onAppointmentRescheduled = null }) {
  const [formData, setFormData] = useState({
    appointmentDate: '',
    appointmentTime: '',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { appointmentService, isInitialized } = useDatabase();
  
  // Chakra Color Mode
  const textColor = useColorModeValue('secondaryGray.900', 'white');
  const bgColor = useColorModeValue('white', 'navy.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  // Initialize form data when appointment changes
  useEffect(() => {
    if (appointment) {
      setFormData({
        appointmentDate: appointment.appointment_date || '',
        appointmentTime: appointment.appointment_time || '',
        notes: '',
      });
    }
  }, [appointment]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Reschedule form submitted:', { appointment, formData });
    
    if (!appointment) {
      console.error('No appointment provided to reschedule modal');
      toast({
        title: 'Error',
        description: 'No appointment selected for rescheduling.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Validate required fields
    if (!formData.appointmentDate || !formData.appointmentTime) {
      toast({
        title: 'Missing Required Fields',
        description: 'Please select both date and time for the rescheduled appointment.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!isInitialized || !appointmentService) {
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
      // Reschedule appointment
      const rescheduledAppointment = await appointmentService.rescheduleAppointment(
        appointment.id,
        formData.appointmentDate,
        formData.appointmentTime,
        formData.notes
      );
      
      toast({
        title: 'Appointment Rescheduled',
        description: `${appointment.patient_name}'s appointment has been rescheduled to ${new Date(formData.appointmentDate).toLocaleDateString()} at ${formData.appointmentTime}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form
      setFormData({
        appointmentDate: '',
        appointmentTime: '',
        notes: '',
      });
      
      // Call the callback to refresh the appointments list
      if (onAppointmentRescheduled) {
        onAppointmentRescheduled();
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to reschedule appointment. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!appointment) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent bg={bgColor}>
        <ModalHeader color={textColor}>
          {appointment.status === 'Rescheduled' ? 'Reschedule Again' : 'Reschedule Appointment'}
        </ModalHeader>
        <ModalCloseButton />
        <form onSubmit={handleSubmit}>
          <ModalBody>
            <VStack spacing={4}>
              {/* Current Appointment Info */}
              <Box p={4} bg="gray.50" borderRadius="lg" w="100%">
                <Text fontWeight="bold" color={textColor} mb={2}>
                  {appointment.status === 'Rescheduled' ? 'Previously Rescheduled Appointment' : 'Current Appointment'}
                </Text>
                <Text color={textColor}>Patient: {appointment.patient_name}</Text>
                <Text color={textColor}>Date: {new Date(appointment.appointment_date).toLocaleDateString()}</Text>
                <Text color={textColor}>Time: {appointment.appointment_time}</Text>
                <Text color={textColor}>Type: {appointment.type}</Text>
                <Text color={textColor}>Doctor: {appointment.doctor}</Text>
                <Text color={textColor}>Status: <Text as="span" fontWeight="bold" color={appointment.status === 'Rescheduled' ? 'orange.500' : 'blue.500'}>{appointment.status}</Text></Text>
                {appointment.notes && appointment.notes.includes('Rescheduled:') && (
                  <Text color={textColor} fontSize="sm" mt={2}>
                    Previous Notes: {appointment.notes}
                  </Text>
                )}
              </Box>

              {/* New Date and Time */}
              <HStack spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel color={textColor}>New Appointment Date</FormLabel>
                  <Input
                    name="appointmentDate"
                    type="date"
                    value={formData.appointmentDate}
                    onChange={handleInputChange}
                    borderColor={borderColor}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel color={textColor}>New Appointment Time</FormLabel>
                  <Input
                    name="appointmentTime"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    borderColor={borderColor}
                  />
                </FormControl>
              </HStack>

              {/* Reschedule Notes */}
              <FormControl>
                <FormLabel color={textColor}>Reschedule Notes</FormLabel>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Reason for rescheduling or additional notes..."
                  borderColor={borderColor}
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              bg="orange.500"
              color="white"
              _hover={{ bg: "orange.600" }}
              isLoading={isLoading}
              loadingText="Rescheduling..."
            >
              Reschedule Appointment
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
