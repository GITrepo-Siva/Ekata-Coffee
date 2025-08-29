
import React from 'react';

const CoffeeBeanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-brand-brown" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v1.618a4.5 4.5 0 00-3.143 4.882C6.63 12.016 8.21 13.5 10 13.5s3.37-1.484 4.143-2.999a4.5 4.5 0 00-3.143-4.882V4a1 1 0 00-1-1zm0 2.5a2.5 2.5 0 00-2.45 2.023A3.501 3.501 0 0110 11.5c1.186 0 2.254-.585 2.905-1.476A2.5 2.5 0 0010 5.5z" clipRule="evenodd" />
    <path d="M4.5 9.5a5.5 5.5 0 1111 0 5.5 5.5 0 01-11 0zM10 16a6.5 6.5 0 100-13 6.5 6.5 0 000 13z" />
  </svg>
);


const Header: React.FC = () => {
  return (
    <header className="bg-brand-cream shadow-md p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CoffeeBeanIcon />
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-brand-dark tracking-tight">
            Ekata Earth Dynamic Pricing Engine
          </h1>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium text-brand-brown bg-white border border-brand-brown rounded-lg hover:bg-brand-brown hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-brown transition-colors duration-200">
          Refresh Data
        </button>
      </div>
    </header>
  );
};

export default Header;