// components/Navbar.js
import React, { useState } from 'react';
import { Button } from '@shadcn/ui';
import { connectToMetaMask } from '../lib/metamask';

const Navbar = () => {
  const [userAddress, setUserAddress] = useState(null);

  const handleLogin = async () => {
    const address = await connectToMetaMask();
    if (address) {
      setUserAddress(address);
    }
  };

  return (
    <nav className="bg-gray-800 p-4 flex justify-between items-center">
      <h1 className="text-white text-xl">MetaMask Login</h1>
      <div>
        {userAddress ? (
          <span className="text-white">Connected: {userAddress}</span>
        ) : (
          <Button onClick={handleLogin} className="bg-blue-500 text-white">
            Connect Wallet
          </Button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
