import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Icon,
  useColorModeValue,
  Badge,
  HStack,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react";
import { 
  MdEvent, 
  MdEdit, 
  MdDelete, 
  MdVisibility, 
  MdSearch, 
  MdAdd,
  MdPhone,
  MdCheckCircle,
  MdCancel,
  MdSchedule,
  MdRefresh
} from "react-icons/md";
import { useDatabase } from "contexts/DatabaseContext";
import ScheduleAppointmentModal from "components/modals/ScheduleAppointmentModal";
import RescheduleAppointmentModal from "components/modals/RescheduleAppointmentModal";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Modal states
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isScheduleOpen, onOpen: onScheduleOpen, onClose: onScheduleClose } = useDisclosure();
  const { isOpen: isRescheduleOpen, onOpen: onRescheduleOpen, onClose: onRescheduleClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const { appointmentService, patientService, isInitialized } = useDatabase();
  const toast = useToast();

  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "navy.700");
  const searchBg = useColorModeValue("gray.50", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const sectionBg = useColorModeValue("gray.50", "gray.700");
  const cardBg = useColorModeValue("white", "gray.600");

  // Load appointments from database
  useEffect(() => {
    const loadAppointments = async () => {
      if (!isInitialized) return;
      
      try {
        setLoading(true);
        setError(null);
        const appointmentsData = appointmentService.getAllAppointments();
        setAppointments(appointmentsData);
      } catch (err) {
        console.error('Error loading appointments:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [isInitialized, appointmentService]);

  // Filter appointments based on search term and tab
  const filteredAppointments = appointments.filter(appointment => {
    const matchesSearch = appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         appointment.doctor.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 0) return matchesSearch; // All
    if (activeTab === 1) return matchesSearch && appointment.status === 'Scheduled';
    if (activeTab === 2) return matchesSearch && appointment.status === 'Completed';
    if (activeTab === 3) return matchesSearch && appointment.status === 'Cancelled';
    if (activeTab === 4) return matchesSearch && appointment.status === 'Rescheduled';
    
    return matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "Scheduled":
        return "blue";
      case "Completed":
        return "green";
      case "Cancelled":
        return "red";
      case "Rescheduled":
        return "orange";
      default:
        return "gray";
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    onDetailsOpen();
  };

  const handleScheduleAppointment = () => {
    onScheduleOpen();
  };

  const refreshAppointments = async () => {
    try {
      const appointmentsData = appointmentService.getAllAppointments();
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Error refreshing appointments:', err);
    }
  };

  const handleReschedule = (appointment) => {
    console.log('Reschedule button clicked for appointment:', appointment);
    setSelectedAppointment(appointment);
    onRescheduleOpen();
  };

  const handleDelete = (appointment) => {
    setSelectedAppointment(appointment);
    onDeleteOpen();
  };

  const handleCancel = async (appointment) => {
    try {
      await appointmentService.cancelAppointment(appointment.id, 'Appointment cancelled by user');
      const updatedAppointments = appointments.map(apt => 
        apt.id === appointment.id ? { ...apt, status: 'Cancelled' } : apt
      );
      setAppointments(updatedAppointments);
      toast({
        title: 'Appointment Cancelled',
        description: `${appointment.patient_name}'s appointment has been cancelled.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel appointment.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleComplete = async (appointment) => {
    try {
      await appointmentService.completeAppointment(appointment.id, 'Appointment completed successfully');
      const updatedAppointments = appointments.map(apt => 
        apt.id === appointment.id ? { ...apt, status: 'Completed' } : apt
      );
      setAppointments(updatedAppointments);
      toast({
        title: 'Appointment Completed',
        description: `${appointment.patient_name}'s appointment has been marked as completed.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to complete appointment.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const confirmDelete = async () => {
    if (selectedAppointment) {
      try {
        await appointmentService.deleteAppointment(selectedAppointment.id);
        setAppointments(appointments.filter(apt => apt.id !== selectedAppointment.id));
        onDeleteClose();
        setSelectedAppointment(null);
        toast({
          title: 'Appointment Deleted',
          description: 'Appointment has been deleted successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete appointment.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Get appointment statistics
  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(apt => apt.status === 'Scheduled').length,
    completed: appointments.filter(apt => apt.status === 'Completed').length,
    cancelled: appointments.filter(apt => apt.status === 'Cancelled').length,
    rescheduled: appointments.filter(apt => apt.status === 'Rescheduled').length,
  };

  // Show loading state
  if (loading) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }} display="flex" justifyContent="center" alignItems="center" minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text color={textColor}>Loading appointments...</Text>
        </VStack>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
        <Alert status="error">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Error loading appointments</Text>
            <Text fontSize="sm">{error}</Text>
          </Box>
        </Alert>
      </Box>
    );
  }

  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2} color={textColor}>Appointments</Heading>
          <Text color="secondaryGray.600">Schedule and manage patient appointments.</Text>
        </Box>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 2, md: 5 }} spacing={4}>
          <Box p={4} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Stat>
              <StatLabel color={textColor}>Total</StatLabel>
              <StatNumber color={textColor}>{stats.total}</StatNumber>
            </Stat>
          </Box>
          <Box p={4} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Stat>
              <StatLabel color={textColor}>Scheduled</StatLabel>
              <StatNumber color="blue.500">{stats.scheduled}</StatNumber>
            </Stat>
          </Box>
          <Box p={4} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Stat>
              <StatLabel color={textColor}>Completed</StatLabel>
              <StatNumber color="green.500">{stats.completed}</StatNumber>
            </Stat>
          </Box>
          <Box p={4} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Stat>
              <StatLabel color={textColor}>Cancelled</StatLabel>
              <StatNumber color="red.500">{stats.cancelled}</StatNumber>
            </Stat>
          </Box>
          <Box p={4} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Stat>
              <StatLabel color={textColor}>Rescheduled</StatLabel>
              <StatNumber color="orange.500">{stats.rescheduled}</StatNumber>
            </Stat>
          </Box>
        </SimpleGrid>

        {/* Search and Actions */}
        <HStack spacing={4} justify="space-between">
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={searchBg}
              borderColor={borderColor}
            />
          </InputGroup>
          <Button
            leftIcon={<Icon as={MdAdd} />}
            colorScheme="brand"
            onClick={handleScheduleAppointment}
          >
            Schedule Appointment
          </Button>
        </HStack>

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>All ({appointments.length})</Tab>
            <Tab>Scheduled ({stats.scheduled})</Tab>
            <Tab>Completed ({stats.completed})</Tab>
            <Tab>Cancelled ({stats.cancelled})</Tab>
            <Tab>Rescheduled ({stats.rescheduled})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              {/* Appointments Table */}
              <Box bg={bgColor} borderRadius="lg" p={6} boxShadow="sm">
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th color={textColor} fontWeight="600">Patient</Th>
                      <Th color={textColor} fontWeight="600">Date & Time</Th>
                      <Th color={textColor} fontWeight="600">Type</Th>
                      <Th color={textColor} fontWeight="600">Doctor</Th>
                      <Th color={textColor} fontWeight="600">Status</Th>
                      <Th color={textColor} fontWeight="600" textAlign="center">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredAppointments.map((appointment) => (
                      <Tr key={appointment.id} _hover={{ bg: hoverBg }}>
                        <Td>
                          <Text fontWeight="600" color={textColor}>{appointment.patient_name}</Text>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text color={textColor}>{new Date(appointment.appointment_date).toLocaleDateString()}</Text>
                            <Text fontSize="sm" color="secondaryGray.600">{appointment.appointment_time}</Text>
                          </VStack>
                        </Td>
                        <Td color={textColor}>{appointment.type}</Td>
                        <Td color={textColor}>{appointment.doctor}</Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(appointment.status)} variant="subtle">
                            {appointment.status}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2} justify="center">
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => handleViewDetails(appointment)}
                              aria-label="View details"
                            >
                              <Icon as={MdVisibility} />
                            </Button>
                            {(appointment.status === 'Scheduled' || appointment.status === 'Rescheduled') && (
                              <>
                                <Button
                                  size="sm"
                                  colorScheme="green"
                                  variant="outline"
                                  onClick={() => handleComplete(appointment)}
                                  aria-label="Complete appointment"
                                >
                                  <Icon as={MdCheckCircle} />
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="orange"
                                  variant="outline"
                                  onClick={() => handleReschedule(appointment)}
                                  aria-label="Reschedule appointment"
                                >
                                  <Icon as={MdRefresh} />
                                </Button>
                                <Button
                                  size="sm"
                                  colorScheme="yellow"
                                  variant="outline"
                                  onClick={() => handleCancel(appointment)}
                                  aria-label="Cancel appointment"
                                >
                                  <Icon as={MdCancel} />
                                </Button>
                              </>
                            )}
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => handleDelete(appointment)}
                              aria-label="Delete appointment"
                            >
                              <Icon as={MdDelete} />
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Appointment Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Appointment Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedAppointment && (
              <VStack spacing={4} align="stretch">
                <Box p={4} bg={sectionBg} borderRadius="lg">
                  <Text fontWeight="bold" color={textColor} mb={2}>Patient Information</Text>
                  <Text color={textColor}>Name: {selectedAppointment.patient_name}</Text>
                  <Text color={textColor}>Patient ID: #{selectedAppointment.patient_id}</Text>
                </Box>
                <Box p={4} bg={sectionBg} borderRadius="lg">
                  <Text fontWeight="bold" color={textColor} mb={2}>Appointment Details</Text>
                  <Text color={textColor}>Date: {new Date(selectedAppointment.appointment_date).toLocaleDateString()}</Text>
                  <Text color={textColor}>Time: {selectedAppointment.appointment_time}</Text>
                  <Text color={textColor}>Duration: {selectedAppointment.duration} minutes</Text>
                  <Text color={textColor}>Type: {selectedAppointment.type}</Text>
                  <Text color={textColor}>Doctor: {selectedAppointment.doctor}</Text>
                  <Text color={textColor}>Status: <Badge colorScheme={getStatusColor(selectedAppointment.status)}>{selectedAppointment.status}</Badge></Text>
                </Box>
                {selectedAppointment.notes && (
                  <Box p={4} bg={sectionBg} borderRadius="lg">
                    <Text fontWeight="bold" color={textColor} mb={2}>Notes</Text>
                    <Text color={textColor}>{selectedAppointment.notes}</Text>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDetailsClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete this appointment? This action cannot be undone.</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onDeleteClose}>
              Cancel
            </Button>
            <Button colorScheme="red" onClick={confirmDelete}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Schedule Appointment Modal */}
      <ScheduleAppointmentModal 
        isOpen={isScheduleOpen} 
        onClose={onScheduleClose}
        onAppointmentCreated={refreshAppointments}
      />

      {/* Reschedule Appointment Modal */}
      <RescheduleAppointmentModal 
        isOpen={isRescheduleOpen} 
        onClose={onRescheduleClose}
        appointment={selectedAppointment}
        onAppointmentRescheduled={refreshAppointments}
      />
    </Box>
  );
}