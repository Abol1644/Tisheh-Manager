import React, { createContext, useContext, useState } from 'react';

const WorkGroupContext = createContext();

export const useWorkGroups = () => {
  const context = useContext(WorkGroupContext);
  if (!context) {
    throw new Error('useWorkGroups must be used within a WorkGroupProvider');
  }
  return context;
};

export const WorkGroupProvider = ({ children }) => {
  const [workGroups, setWorkGroups] = useState([
    {
      id: 1,
      parentId: 0,
      organId: 1,
      title: "مدیر سیستم",
      description: "گروه مدیریت سیستم",
      isDeleted: false,
    },
    {
      id: 2,
      parentId: 0,
      organId: 1,
      title: "فروش",
      description: "گروه فروش",
      isDeleted: false,
    },
    {
      id: 3,
      parentId: 0,
      organId: 1,
      title: "توزیع",
      description: "گروه توزیع",
      isDeleted: false,
    },
  ]);

  const addWorkGroup = (workGroupData) => {
    const newWorkGroup = {
      id: Math.max(...workGroups.map(w => w.id)) + 1,
      parentId: 0,
      organId: 1,
      title: '',
      description: '',
      isDeleted: false,
      ...workGroupData
    };
    setWorkGroups(prev => [...prev, newWorkGroup]);
    return newWorkGroup;
  };

  const updateWorkGroup = (id, updatedWorkGroup) => {
    setWorkGroups(prev => prev.map(workGroup => 
      workGroup.id === id ? { ...workGroup, ...updatedWorkGroup } : workGroup
    ));
  };

  const deleteWorkGroup = (id) => {
    setWorkGroups(prev => prev.map(workGroup =>
      workGroup.id === id ? { ...workGroup, isDeleted: true } : workGroup
    ));
  };

  const getWorkGroupById = (id) => {
    return workGroups.find(workGroup => workGroup.id === id && !workGroup.isDeleted);
  };

  const getActiveWorkGroups = () => {
    return workGroups.filter(workGroup => !workGroup.isDeleted);
  };

  const value = {
    workGroups,
    addWorkGroup,
    updateWorkGroup,
    deleteWorkGroup,
    getWorkGroupById,
    getActiveWorkGroups,
  };

  return (
    <WorkGroupContext.Provider value={value}>
      {children}
    </WorkGroupContext.Provider>
  );
};
