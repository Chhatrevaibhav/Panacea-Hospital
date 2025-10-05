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
} from "@chakra-ui/react";
import { MdCall, MdEvent, MdEdit, MdDelete, MdVisibility, MdSearch, MdPhone } from "react-icons/md";
import { useDatabase } from "contexts/DatabaseContext";
import { useToast } from "@chakra-ui/react";
import ScheduleAppointmentModal from "components/modals/ScheduleAppointmentModal";
import LogCallModal from "components/modals/LogCallModal";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientForAction, setSelectedPatientForAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const { isOpen: isScheduleOpen, onOpen: onScheduleOpen, onClose: onScheduleClose } = useDisclosure();
  const { isOpen: isLogCallOpen, onOpen: onLogCallOpen, onClose: onLogCallClose } = useDisclosure();
  
  const { patientService, isInitialized } = useDatabase();
  const toast = useToast();

  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "navy.700");
  const searchBg = useColorModeValue("gray.50", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const sectionBg = useColorModeValue("gray.50", "gray.700");
  const cardBg = useColorModeValue("white", "gray.600");

  // Load patients from database
  useEffect(() => {
    const loadPatients = async () => {
      if (!isInitialized) return;
      
      try {
        setLoading(true);
        setError(null);
        const patientsData = patientService.getAllPatients();
        
        // Transform database data to match component expectations
        const transformedPatients = patientsData.map(patient => ({
          id: patient.id,
          name: `${patient.first_name} ${patient.last_name}`,
          phone: patient.phone,
          email: patient.email,
          status: patient.status,
          lastVisit: patient.updated_at ? new Date(patient.updated_at).toISOString().split('T')[0] : 'N/A',
          // Include all database fields for details modal
          first_name: patient.first_name,
          last_name: patient.last_name,
          date_of_birth: patient.date_of_birth,
          gender: patient.gender,
          partner_name: patient.partner_name,
          address: patient.address,
          emergency_contact: patient.emergency_contact,
          emergency_phone: patient.emergency_phone,
          medical_history: patient.medical_history,
          created_at: patient.created_at,
          updated_at: patient.updated_at
        }));
        
        setPatients(transformedPatients);
      } catch (err) {
        console.error('Error loading patients:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, [isInitialized, patientService]);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm)
  );

  const handleCall = (patient) => {
    // Set the selected patient and open call modal
    setSelectedPatientForAction(patient);
    onLogCallOpen();
  };

  const handleAppointment = (patient) => {
    // Set the selected patient and open appointment modal
    setSelectedPatientForAction(patient);
    onScheduleOpen();
  };

  const handleEdit = (patient) => {
    // Implement edit functionality
    console.log("Editing patient:", patient.name);
    // You can open an edit modal here
  };

  const refreshPatients = async () => {
    try {
      const patientsData = patientService.getAllPatients();
      
      // Transform database data to match component expectations
      const transformedPatients = patientsData.map(patient => ({
        id: patient.id,
        name: `${patient.first_name} ${patient.last_name}`,
        phone: patient.phone,
        email: patient.email,
        status: patient.status,
        lastVisit: patient.updated_at ? new Date(patient.updated_at).toISOString().split('T')[0] : 'N/A',
        // Include all database fields for details modal
        first_name: patient.first_name,
        last_name: patient.last_name,
        date_of_birth: patient.date_of_birth,
        gender: patient.gender,
        partner_name: patient.partner_name,
        address: patient.address,
        emergency_contact: patient.emergency_contact,
        emergency_phone: patient.emergency_phone,
        medical_history: patient.medical_history,
        created_at: patient.created_at,
        updated_at: patient.updated_at
      }));
      
      setPatients(transformedPatients);
    } catch (err) {
      console.error('Error refreshing patients:', err);
    }
  };

  const handleViewDetails = (patient) => {
    setSelectedPatient(patient);
    onDetailsOpen();
  };

  const handleDelete = (patient) => {
    setSelectedPatient(patient);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (selectedPatient) {
      try {
        await patientService.deletePatient(selectedPatient.id);
        setPatients(patients.filter(p => p.id !== selectedPatient.id));
        onDeleteClose();
        setSelectedPatient(null);
      } catch (error) {
        console.error('Error deleting patient:', error);
        // Handle error - could show toast notification
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "green";
      case "Inactive":
        return "red";
      default:
        return "gray";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }} display="flex" justifyContent="center" alignItems="center" minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text color={textColor}>Loading patients...</Text>
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
            <Text fontWeight="bold">Error loading patients</Text>
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
          <Heading size="lg" mb={2} color={textColor}>Patients</Heading>
          <Text color="secondaryGray.600">Manage patient records and details.</Text>
        </Box>

        {/* Search Bar */}
        <Box>
          <InputGroup maxW="400px">
            <InputLeftElement pointerEvents="none">
              <Icon as={MdSearch} color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search patients by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={searchBg}
              borderColor={borderColor}
            />
          </InputGroup>
        </Box>

        {/* Patients Table */}
        <Box bg={bgColor} borderRadius="lg" p={6} boxShadow="sm">
          <Table variant="simple" size="md">
            <Thead>
              <Tr>
                <Th color={textColor} fontWeight="600">Name</Th>
                <Th color={textColor} fontWeight="600">Phone</Th>
                <Th color={textColor} fontWeight="600">Status</Th>
                <Th color={textColor} fontWeight="600">Last Visit</Th>
                <Th color={textColor} fontWeight="600" textAlign="center">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredPatients.map((patient) => (
                <Tr key={patient.id} _hover={{ bg: hoverBg }}>
                  <Td>
                    <Text fontWeight="600" color={textColor}>{patient.name}</Text>
                  </Td>
                  <Td>
                    <HStack>
                      <Icon as={MdPhone} color="green.500" />
                      <Text color={textColor}>{patient.phone}</Text>
                    </HStack>
                  </Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(patient.status)} variant="subtle">
                      {patient.status}
                    </Badge>
                  </Td>
                  <Td color={textColor}>{patient.lastVisit}</Td>
                  <Td>
                    <HStack spacing={2} justify="center">
                      <Button
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                        onClick={() => handleCall(patient)}
                        aria-label="Call patient"
                      >
                        <Icon as={MdCall} />
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="green"
                        variant="outline"
                        onClick={() => handleAppointment(patient)}
                        aria-label="Schedule appointment"
                      >
                        <Icon as={MdEvent} />
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="purple"
                        variant="outline"
                        onClick={() => handleEdit(patient)}
                        aria-label="Edit patient"
                      >
                        <Icon as={MdEdit} />
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => handleDelete(patient)}
                        aria-label="Delete patient"
                      >
                        <Icon as={MdDelete} />
                      </Button>
                      <Button
                        size="sm"
                        colorScheme="gray"
                        variant="outline"
                        onClick={() => handleViewDetails(patient)}
                        aria-label="View patient details"
                      >
                        <Icon as={MdVisibility} />
                      </Button>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>

      {/* Patient Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="full">
        <ModalOverlay />
        <ModalContent bg={bgColor} m={0} borderRadius={0} maxW="100vw" maxH="100vh">
          <ModalHeader color={textColor} fontSize="2xl" fontWeight="bold" py={6} px={8}>
            <HStack justify="space-between" w="100%" align="center">
              <Text>Patient Details</Text>
              <HStack spacing={4} align="center">
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={onDetailsClose}
                  px={6}
                  h="45px"
                  fontSize="sm"
                  fontWeight="600"
                >
                  Close
                </Button>
                <ModalCloseButton size="lg" position="relative" top={0} right={0} />
              </HStack>
            </HStack>
          </ModalHeader>
          <ModalBody px={8} pb={8} maxH="calc(100vh - 120px)" overflowY="auto">
            {selectedPatient && (
              <Box maxW="1400px" mx="auto">
                {/* Top Row - Personal Information */}
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6} mb={6}>
                  <Box p={6} bg={sectionBg} borderRadius="lg">
                    <Text fontSize="lg" fontWeight="bold" color={textColor} mb={4}>
                      Personal Information
                    </Text>
                    <VStack spacing={3} align="stretch">
                      <Box>
                        <Text fontWeight="600" color={textColor} fontSize="sm" mb={1}>Name</Text>
                        <Text fontSize="md">{selectedPatient.first_name} {selectedPatient.last_name}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="600" color={textColor} fontSize="sm" mb={1}>Phone</Text>
                        <HStack>
                          <Icon as={MdPhone} color="green.500" />
                          <Text fontSize="md">{selectedPatient.phone}</Text>
                        </HStack>
                      </Box>
                      <Box>
                        <Text fontWeight="600" color={textColor} fontSize="sm" mb={1}>Email</Text>
                        <Text fontSize="md">{selectedPatient.email}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="600" color={textColor} fontSize="sm" mb={1}>Date of Birth</Text>
                        <Text fontSize="md">{selectedPatient.date_of_birth}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="600" color={textColor} fontSize="sm" mb={1}>Gender</Text>
                        <Text fontSize="md" textTransform="capitalize">{selectedPatient.gender}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="600" color={textColor} fontSize="sm" mb={1}>Partner Name</Text>
                        <Text fontSize="md">{selectedPatient.partner_name || 'Not provided'}</Text>
                      </Box>
                    </VStack>
                  </Box>

                  <Box p={6} bg={sectionBg} borderRadius="lg">
                    <Text fontSize="lg" fontWeight="bold" color={textColor} mb={4}>
                      Status & Visit
                    </Text>
                    <VStack spacing={3} align="stretch">
                      <Box>
                        <Text fontWeight="600" color={textColor} fontSize="sm" mb={1}>Status</Text>
                        <Badge colorScheme={getStatusColor(selectedPatient.status)} variant="subtle" fontSize="sm" px={2} py={1}>
                          {selectedPatient.status}
                        </Badge>
                      </Box>
                      <Box>
                        <Text fontWeight="600" color={textColor} fontSize="sm" mb={1}>Last Visit</Text>
                        <Text fontSize="md">{selectedPatient.updated_at ? new Date(selectedPatient.updated_at).toLocaleDateString() : 'N/A'}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="600" color={textColor} fontSize="sm" mb={1}>Patient ID</Text>
                        <Text fontSize="md">#{selectedPatient.id.toString().padStart(4, '0')}</Text>
                      </Box>
                      <Box>
                        <Text fontWeight="600" color={textColor} fontSize="sm" mb={1}>Address</Text>
                        <Text fontSize="md">{selectedPatient.address || 'Not provided'}</Text>
                      </Box>
                    </VStack>
                  </Box>

                  <Box p={6} bg={sectionBg} borderRadius="lg">
                    <Text fontSize="lg" fontWeight="bold" color={textColor} mb={4}>
                      Quick Actions
                    </Text>
                    <VStack spacing={3}>
                      <Button
                        colorScheme="blue"
                        variant="outline"
                        size="sm"
                        w="100%"
                        leftIcon={<Icon as={MdCall} />}
                        onClick={() => handleCall(selectedPatient)}
                      >
                        Call Patient
                      </Button>
                      <Button
                        colorScheme="green"
                        variant="outline"
                        size="sm"
                        w="100%"
                        leftIcon={<Icon as={MdEvent} />}
                        onClick={() => handleAppointment(selectedPatient)}
                      >
                        Schedule Appointment
                      </Button>
                      <Button
                        colorScheme="purple"
                        variant="outline"
                        size="sm"
                        w="100%"
                        leftIcon={<Icon as={MdEdit} />}
                        onClick={() => handleEdit(selectedPatient)}
                      >
                        Edit Patient
                      </Button>
                    </VStack>
                  </Box>
                </SimpleGrid>

                {/* Bottom Row - Medical History and Appointments */}
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  <Box p={6} bg={sectionBg} borderRadius="lg">
                    <Text fontSize="lg" fontWeight="bold" color={textColor} mb={4}>
                      Medical History
                    </Text>
                    <VStack spacing={3} align="stretch">
                      <Box p={3} bg={cardBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                        <Text fontWeight="600" color={textColor} fontSize="sm" mb={1}>Medical History</Text>
                        <Text fontSize="sm" color="secondaryGray.600">{selectedPatient.medical_history || 'No medical history recorded'}</Text>
                      </Box>
                      <Box p={3} bg={cardBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                        <Text fontWeight="600" color={textColor} fontSize="sm" mb={1}>Emergency Contact</Text>
                        <Text fontSize="sm" color="secondaryGray.600">
                          {selectedPatient.emergency_contact ? 
                            `${selectedPatient.emergency_contact} (${selectedPatient.emergency_phone})` : 
                            'No emergency contact provided'
                          }
                        </Text>
                      </Box>
                      <Box p={3} bg={cardBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                        <Text fontWeight="600" color={textColor} fontSize="sm" mb={1}>Created</Text>
                        <Text fontSize="sm" color="secondaryGray.600">
                          {selectedPatient.created_at ? new Date(selectedPatient.created_at).toLocaleDateString() : 'N/A'}
                        </Text>
                      </Box>
                    </VStack>
                  </Box>

                  <Box p={6} bg={sectionBg} borderRadius="lg">
                    <Text fontSize="lg" fontWeight="bold" color={textColor} mb={4}>
                      Recent Appointments
                    </Text>
                    <VStack spacing={3} align="stretch">
                      <Box p={3} bg={cardBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="600" color={textColor} fontSize="sm">General Checkup</Text>
                            <Text fontSize="xs" color="secondaryGray.600">Dr. Smith</Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Text fontSize="sm" color={textColor}>{selectedPatient.lastVisit}</Text>
                            <Badge colorScheme="green" variant="subtle" fontSize="xs">Completed</Badge>
                          </VStack>
                        </HStack>
                      </Box>
                      <Box p={3} bg={cardBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="600" color={textColor} fontSize="sm">Follow-up Visit</Text>
                            <Text fontSize="xs" color="secondaryGray.600">Dr. Johnson</Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Text fontSize="sm" color={textColor}>2024-01-05</Text>
                            <Badge colorScheme="green" variant="subtle" fontSize="xs">Completed</Badge>
                          </VStack>
                        </HStack>
                      </Box>
                      <Box p={3} bg={cardBg} borderRadius="md" border="1px solid" borderColor={borderColor}>
                        <HStack justify="space-between">
                          <VStack align="start" spacing={1}>
                            <Text fontWeight="600" color={textColor} fontSize="sm">Annual Physical</Text>
                            <Text fontSize="xs" color="secondaryGray.600">Dr. Smith</Text>
                          </VStack>
                          <VStack align="end" spacing={1}>
                            <Text fontSize="sm" color={textColor}>2023-12-15</Text>
                            <Badge colorScheme="green" variant="subtle" fontSize="xs">Completed</Badge>
                          </VStack>
                        </HStack>
                      </Box>
                    </VStack>
                  </Box>
                </SimpleGrid>
              </Box>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Confirm Delete</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to delete {selectedPatient?.name}? This action cannot be undone.</Text>
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
        patientId={selectedPatientForAction?.id}
        patientName={selectedPatientForAction?.name}
        onAppointmentCreated={refreshPatients}
      />

      {/* Log Call Modal */}
      <LogCallModal 
        isOpen={isLogCallOpen} 
        onClose={onLogCallClose}
        patientId={selectedPatientForAction?.id}
        patientName={selectedPatientForAction?.name}
        onCallLogged={refreshPatients}
      />
    </Box>
  );
}


