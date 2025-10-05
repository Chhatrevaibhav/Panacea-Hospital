import React, { createContext, useContext, useState } from 'react';

const PatientModalContext = createContext();

export const usePatientModal = () => {
  const context = useContext(PatientModalContext);
  if (!context) {
    throw new Error('usePatientModal must be used within a PatientModalProvider');
  }
  return context;
};

export const PatientModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <PatientModalContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
    </PatientModalContext.Provider>
  );
};
