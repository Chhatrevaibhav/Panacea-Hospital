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
} from '@chakra-ui/react';
import { useDatabase } from 'contexts/DatabaseContext';

export default function ScheduleAppointmentModal({ isOpen, onClose, patientId = null, patientName = null, onAppointmentCreated = null }) {
  const [formData, setFormData] = useState({
    patientId: patientId || '',
    patientName: patientName || '',
    appointmentDate: '',
    appointmentTime: '',
    duration: 30,
    type: '',
    doctor: 'Dr. Smith',
    notes: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { appointmentService, patientService, isInitialized } = useDatabase();
  
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    console.log('Form Data:', formData);
    console.log('Patient ID from props:', patientId);
    console.log('Patient Name from props:', patientName);
    
    // Validate required fields
    const requiredFields = ['patientId', 'appointmentDate', 'appointmentTime', 'type'];
    const missingFields = requiredFields.filter(field => {
      const value = formData[field];
      const isEmpty = !value || (typeof value === 'string' && !value.trim());
      console.log(`Field ${field}:`, value, 'isEmpty:', isEmpty);
      return isEmpty;
    });
    
    console.log('Missing fields:', missingFields);
    
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
      // Create appointment
      const newAppointment = await appointmentService.createAppointment({
        patientId: parseInt(formData.patientId),
        patientName: formData.patientName,
        appointmentDate: formData.appointmentDate,
        appointmentTime: formData.appointmentTime,
        duration: parseInt(formData.duration),
        type: formData.type,
        doctor: formData.doctor,
        notes: formData.notes,
      });
      
      toast({
        title: 'Appointment Scheduled',
        description: `Appointment scheduled for ${formData.patientName} on ${new Date(formData.appointmentDate).toLocaleDateString()} at ${formData.appointmentTime}.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Reset form and close modal
      setFormData({
        patientId: '',
        patientName: '',
        appointmentDate: '',
        appointmentTime: '',
        duration: 30,
        type: '',
        doctor: 'Dr. Smith',
        notes: '',
      });
      
      // Call the callback to refresh the appointments list
      if (onAppointmentCreated) {
        onAppointmentCreated();
      }
      
      onClose();
      
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to schedule appointment. Please try again.',
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
        <ModalHeader color={textColor}>Schedule New Appointment</ModalHeader>
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
                  <FormLabel color={textColor}>Appointment Date</FormLabel>
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
                  <FormLabel color={textColor}>Appointment Time</FormLabel>
                  <Input
                    name="appointmentTime"
                    type="time"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                    borderColor={borderColor}
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4} w="100%">
                <FormControl isRequired>
                  <FormLabel color={textColor}>Appointment Type</FormLabel>
                  <Select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    placeholder="Select appointment type"
                    borderColor={borderColor}
                  >
                    <option value="General Checkup">General Checkup</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Consultation">Consultation</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Specialist">Specialist</option>
                    <option value="Lab Work">Lab Work</option>
                    <option value="Vaccination">Vaccination</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel color={textColor}>Duration (minutes)</FormLabel>
                  <Select
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    borderColor={borderColor}
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={45}>45 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel color={textColor}>Doctor</FormLabel>
                <Select
                  name="doctor"
                  value={formData.doctor}
                  onChange={handleInputChange}
                  borderColor={borderColor}
                >
                  <option value="Dr. Smith">Dr. Smith</option>
                  <option value="Dr. Johnson">Dr. Johnson</option>
                  <option value="Dr. Williams">Dr. Williams</option>
                  <option value="Dr. Brown">Dr. Brown</option>
                  <option value="Dr. Davis">Dr. Davis</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel color={textColor}>Notes</FormLabel>
                <Textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes or special instructions..."
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
              bg="brand.500"
              color="white"
              _hover={{ bg: "brand.600" }}
              isLoading={isLoading}
              loadingText="Scheduling..."
            >
              Schedule Appointment
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
