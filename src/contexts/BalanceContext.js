import React, { createContext, useState, useContext, useEffect } from "react";

const BalanceContext = createContext();

export const BalanceProvider = ({ children }) => {
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchInitialBalance = async () => {
      try {
        const response = await fetch("preferences.json");
        const data = await response.json();
        setBalance(Number(data.balance) || 5000);
      } catch (error) {
        console.error("Error fetching initial balance:", error);
        setBalance(5000);
      }
    };

    fetchInitialBalance();
  }, []);

  const updateBalance = async (amount) => {
    const newBalance = Math.round((balance + amount) * 100) / 100;
    setBalance(newBalance);
    return newBalance;
  };

  const resetBalance = async () => {
    try {
      const response = await fetch("preferences.json");
      const data = await response.json();
      setBalance(Number(data.balance) || 5000);
    } catch (error) {
      console.error("Error resetting balance:", error);
      setBalance(5000);
    }
  };

  return (
    <BalanceContext.Provider value={{ balance, updateBalance, resetBalance }}>
      {children}
    </BalanceContext.Provider>
  );
};

export const useBalance = () => {
  const context = useContext(BalanceContext);
  if (context === undefined) {
    throw new Error("useBalance must be used within a BalanceProvider");
  }
  return context;
};

export default BalanceProvider;
