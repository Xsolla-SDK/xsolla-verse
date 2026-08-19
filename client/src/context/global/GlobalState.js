import React, { useState } from 'react';
import GlobalContext from './globalContext';

const GlobalState = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [email, setEmail] = useState(null);
  const [chipsAmount, setChipsAmount] = useState(null);
  const [tables, setTables] = useState(null);
  const [players, setPlayers] = useState(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [feePool, setFeePool] = useState(null);
  const [stakedXsolla, setStakedXsolla] = useState(0);
  const [walletXsolla, setWalletXsolla] = useState(0);

  return (
    <GlobalContext.Provider
      value={{
        isLoading,
        setIsLoading,
        userName,
        setUserName,
        email,
        setEmail,
        chipsAmount,
        setChipsAmount,
        id,
        setId,
        tables,
        setTables,
        players,
        setPlayers,
        walletAddress,
        setWalletAddress,
        feePool,
        setFeePool,
        stakedXsolla,
        setStakedXsolla,
        walletXsolla,
        setWalletXsolla,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalState;
