import React, { useState } from 'react';
import Login from './Login';
import CompanyManager from './CompanyManager';
import ShopManager from './ShopManager';
import PropertyManager from './PropertyManager';
import AgreementManager from './AgreementManager';
import SalesManager from './SalesManager';
import SalesReportManager from './SalesReportManager';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="w-full min-h-screen bg-[#090d16] text-slate-100 font-sans antialiased box-border">
      {!isLoggedIn ? (
        <div className="flex items-center justify-center min-h-screen bg-[#060911]">
          <Login onLoginSuccess={() => setIsLoggedIn(true)} />
        </div>
      ) : (
        <div className="w-full max-w-full box-border">

            <header className="w-full bg-[#111827]/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50 px-4 md:px-8 py-4 flex items-center justify-between shadow-lg shadow-black/20 box-border flex-nowrap gap-4">            
              <div className="flex items-center space-x-4 md:space-x-8 min-w-0 flex-1">
                <span className="text-xs md:text-sm font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-amber-500">
                AIRPORT PROPERTY 
      <br></br>MANAGEMENT SYSTEM
              </span>
                  <nav className="flex space-x-1 text-sm font-medium overflow-x-auto max-w-full py-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent pr-2 min-w-0 flex-1">
                  {['Home', 'Sales', 'Company', 'Shop', 'Agreement', 'Property', 'Reporting', 'Settings'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab.toLowerCase())}
                        className={`px-3 md:px-4 py-2 rounded-lg transition duration-200 whitespace-nowrap shrink-0 ${
                        activeTab === tab.toLowerCase()
                        ? 'bg-red-600/15 text-red-400 font-semibold border border-red-500/20'
                        : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>
            
            <button 
              onClick={() => setIsLoggedIn(false)} 
                    className="text-xs bg-slate-800 hover:bg-red-950/40 text-slate-400 hover:text-red-400 px-3.5 py-2 rounded-lg border border-slate-700/60 hover:border-red-900/50 transition duration-150 whitespace-nowrap shrink-0"            >
              Sign Out
            </button>
          </header>

          <main className="w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8 box-border">
            {activeTab === 'company' ? (
              <CompanyManager />
            ) : activeTab === 'shop' ? (
              <ShopManager />
            ) : activeTab === 'property' ? (
              <PropertyManager />
            ) : activeTab === 'agreement' ? (
              <AgreementManager /> 
            ) : activeTab === 'sales' ? (
              <SalesManager />  
            ) : activeTab === 'reporting' ? (
              <SalesReportManager />     
            ) : null}
            {['home', 'settings'].includes(activeTab) && (
              <div className="p-12 text-center bg-[#111827]/40 border border-slate-800/60 rounded-2xl text-slate-500 uppercase tracking-widest text-xs">
                {activeTab} Content Area
              </div>
            )}
          </main>
        </div>
      )}
    </div>
  );
}