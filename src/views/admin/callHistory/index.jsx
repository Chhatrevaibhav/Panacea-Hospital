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
  Input,
  InputGroup,
  InputLeftElement,
  SimpleGrid,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { 
  MdCall, 
  MdVisibility, 
  MdSearch, 
  MdDelete,
  MdThumbUp,
  MdThumbDown,
  MdThumbsUpDown,
  MdCallReceived,
  MdCallMade,
  MdDownload
} from "react-icons/md";
import { useDatabase } from "contexts/DatabaseContext";

export default function CallHistory() {
  const [calls, setCalls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCall, setSelectedCall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  
  // Modal states
  const { isOpen: isDetailsOpen, onOpen: onDetailsOpen, onClose: onDetailsClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  
  const { callService, isInitialized } = useDatabase();
  const toast = useToast();

  // Chakra Color Mode
  const textColor = useColorModeValue("secondaryGray.900", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const bgColor = useColorModeValue("white", "navy.700");
  const searchBg = useColorModeValue("gray.50", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const sectionBg = useColorModeValue("gray.50", "gray.700");
  const cardBg = useColorModeValue("white", "gray.600");

  // Load calls from database
  useEffect(() => {
    const loadCalls = async () => {
      if (!isInitialized) return;
      
      try {
        setLoading(true);
        setError(null);
        const callsData = callService.getAllCalls();
        setCalls(callsData);
      } catch (err) {
        console.error('Error loading calls:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadCalls();
  }, [isInitialized, callService]);

  // Filter calls based on search term and tab
  const filteredCalls = calls.filter(call => {
    const matchesSearch = call.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         call.call_summary.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 0) return matchesSearch; // All
    if (activeTab === 1) return matchesSearch && call.call_type === 'Inbound';
    if (activeTab === 2) return matchesSearch && call.call_type === 'Outbound';
    if (activeTab === 3) return matchesSearch && call.sentiment === 'Positive';
    if (activeTab === 4) return matchesSearch && call.sentiment === 'Negative';
    if (activeTab === 5) return matchesSearch && call.sentiment === 'Neutral';
    if (activeTab === 6) return matchesSearch && call.follow_up_required === true;
    
    return matchesSearch;
  });

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case "Positive":
        return "green";
      case "Negative":
        return "red";
      case "Neutral":
        return "blue";
      default:
        return "gray";
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case "Positive":
        return MdThumbUp;
      case "Negative":
        return MdThumbDown;
      case "Neutral":
        return MdThumbsUpDown;
      default:
        return MdThumbsUpDown;
    }
  };

  const getCallTypeIcon = (callType) => {
    return callType === 'Inbound' ? MdCallReceived : MdCallMade;
  };

  const handleViewDetails = (call) => {
    setSelectedCall(call);
    onDetailsOpen();
  };

  const handleDelete = (call) => {
    setSelectedCall(call);
    onDeleteOpen();
  };

  const confirmDelete = async () => {
    if (selectedCall) {
      try {
        await callService.deleteCall(selectedCall.id);
        setCalls(calls.filter(c => c.id !== selectedCall.id));
        onDeleteClose();
        setSelectedCall(null);
        toast({
          title: 'Call Deleted',
          description: 'Call record has been deleted successfully.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete call record.',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  // Get call statistics
  const stats = {
    total: calls.length,
    inbound: calls.filter(call => call.call_type === 'Inbound').length,
    outbound: calls.filter(call => call.call_type === 'Outbound').length,
    positive: calls.filter(call => call.sentiment === 'Positive').length,
    negative: calls.filter(call => call.sentiment === 'Negative').length,
    neutral: calls.filter(call => call.sentiment === 'Neutral').length,
    followUpRequired: calls.filter(call => call.follow_up_required === true).length,
  };

  // Show loading state
  if (loading) {
    return (
      <Box pt={{ base: "130px", md: "80px", xl: "80px" }} display="flex" justifyContent="center" alignItems="center" minH="50vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text color={textColor}>Loading call history...</Text>
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
            <Text fontWeight="bold">Error loading call history</Text>
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
          <Heading size="lg" mb={2} color={textColor}>Call History</Heading>
          <Text color="secondaryGray.600">View and analyze patient call logs and conversation history.</Text>
        </Box>

        {/* Statistics */}
        <SimpleGrid columns={{ base: 2, md: 4, lg: 7 }} spacing={4}>
          <Box p={4} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Stat>
              <StatLabel color={textColor}>Total Calls</StatLabel>
              <StatNumber color={textColor}>{stats.total}</StatNumber>
            </Stat>
          </Box>
          <Box p={4} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Stat>
              <StatLabel color={textColor}>Inbound</StatLabel>
              <StatNumber color="blue.500">{stats.inbound}</StatNumber>
            </Stat>
          </Box>
          <Box p={4} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Stat>
              <StatLabel color={textColor}>Outbound</StatLabel>
              <StatNumber color="green.500">{stats.outbound}</StatNumber>
            </Stat>
          </Box>
          <Box p={4} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Stat>
              <StatLabel color={textColor}>Positive</StatLabel>
              <StatNumber color="green.500">{stats.positive}</StatNumber>
            </Stat>
          </Box>
          <Box p={4} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Stat>
              <StatLabel color={textColor}>Negative</StatLabel>
              <StatNumber color="red.500">{stats.negative}</StatNumber>
            </Stat>
          </Box>
          <Box p={4} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Stat>
              <StatLabel color={textColor}>Neutral</StatLabel>
              <StatNumber color="blue.500">{stats.neutral}</StatNumber>
            </Stat>
          </Box>
          <Box p={4} bg={cardBg} borderRadius="lg" border="1px solid" borderColor={borderColor}>
            <Stat>
              <StatLabel color={textColor}>Follow-up</StatLabel>
              <StatNumber color="orange.500">{stats.followUpRequired}</StatNumber>
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
              placeholder="Search calls..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={searchBg}
              borderColor={borderColor}
            />
          </InputGroup>
          <Button
            leftIcon={<Icon as={MdDownload} />}
            colorScheme="brand"
            variant="outline"
          >
            Export
          </Button>
        </HStack>

        {/* Tabs */}
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>All ({calls.length})</Tab>
            <Tab>Inbound ({stats.inbound})</Tab>
            <Tab>Outbound ({stats.outbound})</Tab>
            <Tab>Positive ({stats.positive})</Tab>
            <Tab>Negative ({stats.negative})</Tab>
            <Tab>Neutral ({stats.neutral})</Tab>
            <Tab>Follow-up ({stats.followUpRequired})</Tab>
          </TabList>

          <TabPanels>
            <TabPanel px={0}>
              {/* Calls Table */}
              <Box bg={bgColor} borderRadius="lg" p={6} boxShadow="sm">
                <Table variant="simple" size="md">
                  <Thead>
                    <Tr>
                      <Th color={textColor} fontWeight="600">Patient</Th>
                      <Th color={textColor} fontWeight="600">Type</Th>
                      <Th color={textColor} fontWeight="600">Date & Time</Th>
                      <Th color={textColor} fontWeight="600">Duration</Th>
                      <Th color={textColor} fontWeight="600">Sentiment</Th>
                      <Th color={textColor} fontWeight="600">Follow-up</Th>
                      <Th color={textColor} fontWeight="600" textAlign="center">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {filteredCalls.map((call) => (
                      <Tr key={call.id} _hover={{ bg: hoverBg }}>
                        <Td>
                          <Text fontWeight="600" color={textColor}>{call.patient_name}</Text>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Icon as={getCallTypeIcon(call.call_type)} color={call.call_type === 'Inbound' ? 'blue.500' : 'green.500'} />
                            <Text color={textColor}>{call.call_type}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <VStack align="start" spacing={1}>
                            <Text color={textColor}>{new Date(call.call_date).toLocaleDateString()}</Text>
                            <Text fontSize="sm" color="secondaryGray.600">{call.call_time}</Text>
                          </VStack>
                        </Td>
                        <Td color={textColor}>{call.duration} min</Td>
                        <Td>
                          <HStack spacing={2}>
                            <Icon as={getSentimentIcon(call.sentiment)} color={`${getSentimentColor(call.sentiment)}.500`} />
                            <Badge colorScheme={getSentimentColor(call.sentiment)} variant="subtle">
                              {call.sentiment}
                            </Badge>
                          </HStack>
                        </Td>
                        <Td>
                          {call.follow_up_required ? (
                            <Badge colorScheme="orange" variant="subtle">Required</Badge>
                          ) : (
                            <Badge colorScheme="green" variant="subtle">Completed</Badge>
                          )}
                        </Td>
                        <Td>
                          <HStack spacing={2} justify="center">
                            <Button
                              size="sm"
                              colorScheme="blue"
                              variant="outline"
                              onClick={() => handleViewDetails(call)}
                              aria-label="View details"
                            >
                              <Icon as={MdVisibility} />
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => handleDelete(call)}
                              aria-label="Delete call"
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

      {/* Call Details Modal */}
      <Modal isOpen={isDetailsOpen} onClose={onDetailsClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader color={textColor}>Call Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedCall && (
              <VStack spacing={4} align="stretch">
                <Box p={4} bg={sectionBg} borderRadius="lg">
                  <Text fontWeight="bold" color={textColor} mb={2}>Patient Information</Text>
                  <Text color={textColor}>Name: {selectedCall.patient_name}</Text>
                  <Text color={textColor}>Patient ID: #{selectedCall.patient_id}</Text>
                </Box>
                <Box p={4} bg={sectionBg} borderRadius="lg">
                  <Text fontWeight="bold" color={textColor} mb={2}>Call Details</Text>
                  <Text color={textColor}>Type: {selectedCall.call_type}</Text>
                  <Text color={textColor}>Date: {new Date(selectedCall.call_date).toLocaleDateString()}</Text>
                  <Text color={textColor}>Time: {selectedCall.call_time}</Text>
                  <Text color={textColor}>Duration: {selectedCall.duration} minutes</Text>
                  <Text color={textColor}>Sentiment: <Badge colorScheme={getSentimentColor(selectedCall.sentiment)}>{selectedCall.sentiment}</Badge></Text>
                  <Text color={textColor}>Follow-up Required: <Badge colorScheme={selectedCall.follow_up_required ? "orange" : "green"}>{selectedCall.follow_up_required ? "Yes" : "No"}</Badge></Text>
                </Box>
                {selectedCall.notes && (
                  <Box p={4} bg={sectionBg} borderRadius="lg">
                    <Text fontWeight="bold" color={textColor} mb={2}>Notes</Text>
                    <Text color={textColor}>{selectedCall.notes}</Text>
                  </Box>
                )}
                {selectedCall.call_summary && (
                  <Box p={4} bg={sectionBg} borderRadius="lg">
                    <Text fontWeight="bold" color={textColor} mb={2}>Call Summary</Text>
                    <Text color={textColor}>{selectedCall.call_summary}</Text>
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
            <Text>Are you sure you want to delete this call record? This action cannot be undone.</Text>
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
    </Box>
  );
}