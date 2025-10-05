import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeDatabase } from '../database/database.js';
import patientService from '../services/patientService.js';
import appointmentService from '../services/appointmentService.js';
import callService from '../services/callService.js';

const DatabaseContext = createContext();

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};

export const DatabaseProvider = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initDatabase = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Initialize database (localStorage)
        initializeDatabase();
        
        setIsInitialized(true);
        console.log('Database initialized successfully');
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    // Small delay to ensure localStorage is available
    setTimeout(initDatabase, 100);
  }, []);

  const value = {
    isInitialized,
    loading,
    error,
    patientService,
    appointmentService,
    callService
  };

  return (
    <DatabaseContext.Provider value={value}>
      {children}
    </DatabaseContext.Provider>
  );
};
