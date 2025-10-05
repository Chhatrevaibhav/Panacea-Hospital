// Simple utility to test database functionality
export const testDatabase = () => {
  try {
    // Test localStorage availability
    if (typeof localStorage === 'undefined') {
      console.error('localStorage is not available');
      return false;
    }

    // Test database initialization
    const testKey = 'hospital_patients_db';
    const testData = JSON.parse(localStorage.getItem(testKey) || '[]');
    console.log('Database test - Current patients:', testData.length);
    
    // Test data structure
    if (testData.length > 0) {
      const samplePatient = testData[0];
      const requiredFields = ['id', 'first_name', 'last_name', 'email', 'phone', 'status'];
      const hasAllFields = requiredFields.every(field => field in samplePatient);
      
      if (!hasAllFields) {
        console.error('Database test failed - Missing required fields');
        return false;
      }
    }

    console.log('Database test passed');
    return true;
  } catch (error) {
    console.error('Database test failed:', error);
    return false;
  }
};

// Auto-run test when module loads
if (typeof window !== 'undefined') {
  setTimeout(() => {
    testDatabase();
  }, 1000);
}
