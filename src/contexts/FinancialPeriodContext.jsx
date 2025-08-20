import React, { createContext, useContext, useState } from 'react';

const FinancialPeriodContext = createContext();

export const useFinancialPeriod = () => {
  const context = useContext(FinancialPeriodContext);
  if (!context) {
    throw new Error('useFinancialPeriod must be used within a FinancialPeriodProvider');
  }
  return context;
};

export const FinancialPeriodProvider = ({ children }) => {
  const [financialPeriods, setFinancialPeriods] = useState([
    {
      Id: 1,
      OrganId: 0,
      Title: "دوره 402",
      Description: "",
      DateTimeStart: Date,
      DateTimeEnd: Date,
      AccessWorkGroupId: 0,
    },
  ]);

  const addFinancialPeriod = (financialPeriodData) => {
    const newFinancialPeriod = {
      Id: Math.max(...financialPeriods.map(w => w.Id)) + 1,
      OrganId: 1,
      Title: '',
      Description: '',
      DateTimeStart: new Date(),
      DateTimeEnd: new Date(),
      AccessWorkGroupId: '',
      ...financialPeriodData
    };
    setFinancialPeriods(prev => [...prev, newFinancialPeriod]);
    return newFinancialPeriod;
  };

  const updateFinancialPeriod = (id, updatedFinancialPeriod) => {
    setFinancialPeriods(prev => prev.map(financialPeriod => 
      financialPeriod.Id === id ? { ...financialPeriod, ...updatedFinancialPeriod } : financialPeriod
    ));
  };

  const deleteFinancialPeriod = (id) => {
    setFinancialPeriods(prev => prev.map(financialPeriod =>
      financialPeriod.Id === id ? { ...financialPeriod, isDeleted: true } : financialPeriod
    ));
  };

  const getFinancialPeriodById = (id) => {
    return financialPeriods.find(financialPeriod => financialPeriod.Id === id && !financialPeriod.isDeleted);
  };

  const getActiveFinancialPeriods = () => {
    return financialPeriods.filter(financialPeriod => !financialPeriod.isDeleted);
  };

  const value = {
    financialPeriods,
    addFinancialPeriod,
    updateFinancialPeriod,
    deleteFinancialPeriod,
    getFinancialPeriodById,
    getActiveFinancialPeriods,
  };

  return (
    <FinancialPeriodContext.Provider value={value}>
      {children}
    </FinancialPeriodContext.Provider>
  );
};
