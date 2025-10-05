import React from "react";
import { Box, Heading, Text } from "@chakra-ui/react";

export default function Reminders() {
  return (
    <Box pt={{ base: "130px", md: "80px", xl: "80px" }}>
      <Heading size="lg" mb="2">Reminders</Heading>
      <Text color="secondaryGray.600">Configure automated call reminders.</Text>
    </Box>
  );
}


