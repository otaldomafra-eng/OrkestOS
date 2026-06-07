import { AppContext } from './AppContext';

export const AppProvider = ({ children }) => {
  const value = {
    toggleTaskCompletion: async () => console.log('TODO: toggleTaskCompletion'),
    handleCompleteHabit: async () => console.log('TODO: handleCompleteHabit'),
    clearAllData: () => console.log('TODO: clearAllData'),
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
