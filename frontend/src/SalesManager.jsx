import React, { useState, useEffect } from 'react';

export default function SalesManager() {
  const [weeklySales, setWeeklySales] = useState([]);
  const [shopsList, setShopsList] = useState([]);
  const [companiesList, setCompaniesList] = useState([]); 
  
  //DUAL FILTERS STATES
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState('');
  const [selectedShopFilter, setSelectedShopFilter] = useState('');
  
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);

  //Fetch Live Table Data
  const fetchWeeklySales = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/sales/recent');
      if (res.ok) setWeeklySales(await res.json());
    } catch (err) {
      console.error("Failed to load logs", err);
      setMessage({ type: 'error', text: 'Server connection failed!' });
    } finally {
      setLoading(false);
    }
  };

  //Load Initial Dropdowns and Table Logs
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const shopsRes = await fetch('http://localhost:5000/api/sales/shops');
        const compsRes = await fetch('http://localhost:5000/api/sales/companies'); 
        
        if (shopsRes.ok) setShopsList(await shopsRes.json());
        if (compsRes.ok) setCompaniesList(await compsRes.json());
        
        await fetchWeeklySales();
      } catch (err) {
        console.error("Failed to load master filters", err);
      }
    };
    loadInitialData();
  }, []);

  //Delete Action
  const handleDelete = async (dayId) => {
    if (!window.confirm(`Are you sure you want to delete Log #${dayId}?`)) return;
    try {
      const response = await fetch(`http://localhost:5000/api/sales/delete/${dayId}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Log deleted successfully!' });
        await fetchWeeklySales();
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection failed!' });
    }
  };

  const handleCompanyFilterChange = (e) => {
    setSelectedCompanyFilter(e.target.value);
    setSelectedShopFilter(''); 
  };

  //Dynamic Dropdown Logic
  const availableShopsForDropdown = selectedCompanyFilter
    ? shopsList.filter(shop => String(shop.companyId) === String(selectedCompanyFilter))
    : shopsList;

  //MULTI-FILTER LOGIC
  const filteredSales = weeklySales.filter(sale => {
    const matchesCompany = selectedCompanyFilter 
      ? shopsList.some(shop => String(shop.shopId) === String(sale.shopId) && String(shop.companyId) === String(selectedCompanyFilter))
      : true;

    const matchesShop = selectedShopFilter 
      ? String(sale.shopId) === String(selectedShopFilter)
      : true;

    return matchesCompany && matchesShop;
  });

  return (
    <div className="w-full max-w-full mx-auto space-y-6 text-xs text-slate-200 p-2 sm:p-4 md:p-6 bg-[#0f172a] rounded-xl">
      
      {message && (
        <div className="w-full p-3 rounded-lg text-center border font-bold text-xs bg-emerald-950/80 border-emerald-800 text-emerald-400">
          {message.text}
        </div>
      )}

      <div className="bg-[#1e293b]/40 border border-[#334155] rounded-2xl p-5 shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-extrabold text-amber-500 uppercase tracking-wider">Live Sales Transaction Terminal</h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 justify-end w-full lg:w-auto">
          
          <div className="flex flex-col space-y-1 min-w-[160px]">
            <label className="text-slate-400 font-bold text-[10px] uppercase">Corporate Company</label>
            <select value={selectedCompanyFilter} onChange={handleCompanyFilterChange} className="bg-[#0f172a] border border-[#334155] p-2 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500">
              <option value="">-- All Companies --</option>
              {companiesList.map((c, i) => <option key={i} value={c.companyId}>{c.companyName}</option>)}
            </select>
          </div>

          <div className="flex flex-col space-y-1 min-w-[160px]">
            <label className="text-slate-400 font-bold text-[10px] uppercase">Tenant Shop</label>
            <select value={selectedShopFilter} onChange={(e) => setSelectedShopFilter(e.target.value)} className="bg-[#0f172a] border border-[#334155] p-2 rounded-lg text-slate-100 text-xs focus:outline-none focus:border-amber-500">
              <option value="">-- All Shops --</option>
              {availableShopsForDropdown.map((s, i) => <option key={i} value={s.shopId}>{s.shopName}</option>)}
            </select>
          </div>

          <button onClick={fetchWeeklySales} type="button" className="bg-cyan-600 hover:bg-cyan-700 text-slate-100 font-extrabold px-4 py-2 rounded-lg text-xs uppercase tracking-wider transition h-[34px] self-end">
            {loading ? 'Syncing...' : 'Refresh Logs'}
          </button>
        </div>
      </div>

      {/* LEDGER TABLE PANEL */}
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-4 shadow-inner space-y-3">
        <div className="flex justify-between items-center border-b border-[#475569]/30 pb-2">
          <h4 className="text-cyan-400 font-extrabold text-xs uppercase tracking-wide">Live Transaction Ledger</h4>
          <span className="text-[10px] text-slate-400 font-mono font-bold">Records matching filters: {filteredSales.length}</span>
        </div>
        
        <div className="overflow-x-auto w-full rounded-lg border border-[#334155]/60">
          <table className="w-full text-left border-collapse whitespace-nowrap table-auto">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0f172a] text-slate-400 font-bold text-[10px] uppercase tracking-wider sticky top-0">
                <th className="p-3 sticky left-0 bg-[#0f172a] z-10">Actions</th>
                <th className="p-3">dayId</th>
                <th className="p-3">shopId</th>
                <th className="p-3">Company Name</th>
                <th className="p-3">CONCESSIONAR_NAME</th>
                <th className="p-3">shopName</th>
                <th className="p-3">LOCATION</th>
                <th className="p-3">INVOICE_NUMBER</th>
                <th className="p-3">TRANSACTION_DATE</th>
                <th className="p-3">TRANSACTION_TIME</th>
                <th className="p-3">PRODUCT_NAME</th>
                <th className="p-3">PRODUCT_CATEGORY</th>
                <th className="p-3">PRODUCT_SUB_CATEGORY</th>
                <th className="p-3">BRAND_NAME</th>
                <th className="p-3">QUANTITY</th>
                <th className="p-3">UNIT_PRICE</th>
                <th className="p-3">TOTAL_BEFORE_DISCOUNT</th>
                <th className="p-3">DISCOUNT_AMOUNT</th>
                <th className="p-3">DISCOUNT_TYPE</th>
                <th className="p-3">TOTAL_AFTER_DISCOUNT</th>
                <th className="p-3">SALES_TAX_%</th>
                <th className="p-3">SALES_TAX</th>
                <th className="p-3">NET_SALES</th>
                <th className="p-3">MINUS_TAX</th>
                <th className="p-3">PAYMENT_METHOD</th>
                <th className="p-3">CURRENCY</th>
                <th className="p-3">ACTUAL_PAYMENT_CURRENCY</th>
                <th className="p-3">TRANSACTION_TYPE</th>
                <th className="p-3">VOID_CANCELATION_TYPE</th>
                <th className="p-3">FLIGHT</th>
                <th className="p-3">FLIGHT_DATE_TIME</th>
                <th className="p-3">AIRPORT_ORG</th>
                <th className="p-3">AIRPORT_DES</th>
                <th className="p-3">AIRPORT_DES2</th>
                <th className="p-3">AIRPORT_DES3</th>
                <th className="p-3">PASSENGER_ID_NAME</th>
                <th className="p-3">NATIONALITY</th>
                <th className="p-3">PASSPORT_ID</th>
                <th className="p-3">NATIONAL_ID</th>
                <th className="p-3">BIRTHDATE</th>
                <th className="p-3">GENDER</th>
                <th className="p-3">currentDateTime</th>
                <th className="p-3">dbn</th>
                <th className="p-3">tillNo</th>
                <th className="p-3">is_duplicate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/50 text-slate-300 font-mono text-[11px]">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan="45" className="text-center p-6 text-slate-500 font-bold uppercase tracking-widest bg-[#1e293b]">
                    No records found matching criteria
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => (
                  <tr key={sale.dayId} className="hover:bg-[#0f172a]/40 transition bg-[#1e293b]">
                    <td className="p-3 sticky left-0 bg-[#1e293b] shadow-[2px_0_5px_rgba(0,0,0,0.3)] z-10 text-center">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => setSelectedSale(sale)} className="bg-cyan-900/60 hover:bg-cyan-800 border border-cyan-700 text-cyan-300 px-1.5 py-0.5 rounded text-[9px] font-bold transition">
                          View
                        </button>
                        <button onClick={() => handleDelete(sale.dayId)} className="text-red-400 hover:text-red-300 p-0.5">
                          
                        </button>
                      </div>
                    </td>
                    <td className="p-3 text-slate-400 font-bold">#{sale.dayId}</td>
                    <td className="p-3 text-amber-500 font-bold">{sale.shopId}</td>
                    <td className="p-3 font-bold text-cyan-400 bg-cyan-950/20">{sale.db_company_name || "Not Linked"}</td>
                    <td className="p-3 italic">{sale.CONCESSIONAR_NAME || '-'}</td>
                    
                    <td className="p-3 font-semibold text-slate-100">{sale.shopName || '-'}</td>
                    
                    <td className="p-3 Grandma">{sale.LOCATION || '-'}</td>
                    <td className="p-3 text-amber-400 font-bold">{sale.INVOICE_NUMBER || '-'}</td>
                    <td className="p-3">{sale.TRANSACTION_DATE?new Date(sale.TRANSACTION_DATE).toLocaleDateString('en-CA'):'-'}</td>
                    <td className="p-3">{sale.TRANSACTION_TIME || '-'}</td>
                    <td className="p-3 text-slate-200">{sale.PRODUCT_NAME || '-'}</td>
                    <td className="p-3 text-slate-400">{sale.PRODUCT_CATEGORY || '-'}</td>
                    <td className="p-3 text-slate-400">{sale.PRODUCT_SUB_CATEGORY || '-'}</td>
                    <td className="p-3">{sale.BRAND_NAME || '-'}</td>
                    <td className="p-3 text-right font-bold text-purple-400">{sale.QUANTITY ? Number(sale.QUANTITY).toFixed(0) : '0'}</td>
                    <td className="p-3 text-right">{sale.UNIT_PRICE ? Number(sale.UNIT_PRICE).toFixed(2) : '0.00'}</td>
                    <td className="p-3 text-right">{sale.TOTAL_AMOUNT_BEFORE_DISCOUNT ? Number(sale.TOTAL_AMOUNT_BEFORE_DISCOUNT).toFixed(2) : '0.00'}</td>
                    <td className="p-3 text-right text-red-400">{sale.DISCOUNT_AMOUNT ? Number(sale.DISCOUNT_AMOUNT).toFixed(2) : '0.00'}</td>
                    <td className="p-3">{sale.DISCOUNT_TYPE || '-'}</td>
                    <td className="p-3 text-right">{sale.TOTAL_AMOUNT_AFTER_DISCOUNT ? Number(sale.TOTAL_AMOUNT_AFTER_DISCOUNT).toFixed(2) : '0.00'}</td>
                    <td className="p-3 text-right">{sale.SALES_TAX_PERCENTAGE ? Number(sale.SALES_TAX_PERCENTAGE).toFixed(2) : '0.00'}</td>
                    <td className="p-3 text-right">{sale.SALES_TAX ? Number(sale.SALES_TAX).toFixed(2) : '0.00'}</td>
                    <td className="p-3 text-right font-bold text-emerald-400 bg-emerald-950/10">{sale.NET_SALES ? Number(sale.NET_SALES).toFixed(2) : '0.00'}</td>
                    <td className="p-3 text-right text-orange-400">{sale.MINUS_TAX ? Number(sale.MINUS_TAX).toFixed(2) : '0.00'}</td>
                    <td className="p-3 text-center text-slate-400 font-sans">{sale.PAYMENT_METHOD || '-'}</td>
                    <td className="p-3 text-center"><span className="bg-[#0f172a] border border-[#334155] px-1 rounded text-[10px] font-bold">{sale.CURRENCY || 'USD'}</span></td>
                    <td className="p-3 text-center">{sale.ACTUAL_PAYMENT_CURRENCY_TYPE || '-'}</td>
                    <td className="p-3 text-center">{sale.TRANSACTION_TYPE || '-'}</td>
                    <td className="p-3 text-red-400">{sale.VOID_CANCELATION_TYPE || '-'}</td>
                    <td className="p-3 text-amber-500 font-bold">{sale.FLIGHT || '-'}</td>
                    <td className="p-3 text-slate-400">{sale.FLIGHT_DATE_TIME || '-'}</td>
                    <td className="p-3">{sale.AIRPORT_ORG || '-'}</td>
                    <td className="p-3">{sale.AIRPORT_DES || '-'}</td>
                    <td className="p-3">{sale.AIRPORT_DES2 || '-'}</td>
                    <td className="p-3">{sale.AIRPORT_DES3 || '-'}</td>
                    <td className="p-3 text-slate-300 font-sans">{sale.PASSENGER_ID_NAME || '-'}</td>
                    <td className="p-3 text-slate-400">{sale.NATIONALITY || '-'}</td>
                    <td className="p-3">{sale.PASSPORT_ID || '-'}</td>
                    <td className="p-3">{sale.NATIONAL_ID || '-'}</td>
                    <td className="p-3 text-slate-500">{sale.BIRTHDATE || '-'}</td>
                    <td className="p-3 text-slate-400">{sale.GENDER || '-'}</td>
                    <td className="p-3 text-slate-500 text-[10px]">{sale.currentDateTime || '-'}</td>
                    <td className="p-3 text-slate-400">{sale.dbn || '-'}</td>
                    <td className="p-3 text-slate-400">{sale.tillNo || '-'}</td>
                    <td className="p-3 text-center">{sale.is_duplicate ? "Yes" : "No"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedSale && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#1e293b] border border-[#475569]/50 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="fixed bg-[#1e293b] max-w-2xl w-full pr-12 border-b border-[#334155] pb-3 flex justify-between items-center z-10">
              <h3 className="text-sm font-extrabold text-amber-500 uppercase tracking-wider font-mono">Deep-Audit Full Logs: #{selectedSale.dayId}</h3>
              <button onClick={() => setSelectedSale(null)} className="text-slate-400 hover:text-slate-100 font-bold text-sm bg-[#0f172a] px-2 py-1 rounded-lg border border-[#334155]">✕ Close</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-[11px] font-mono pt-12">
              {Object.keys(selectedSale).map((key) => {
                let displayKey = key;
                let displayValue = selectedSale[key];
                
                if(key === 'SHOP_NAME') {
                  displayValue = selectedSale.SHOP_NAME || 'N/A';
                }
                if(key === 'TRANSACTION_DATE' && selectedSale[key]) {
                  displayValue = new Date(selectedSale[key]).toLocaleDateString('en-CA');
                }
                return (
                  <div key={key} className="flex justify-between py-1 border-b border-[#334155]/30 overflow-hidden">
                    <span className="text-slate-400 truncate pr-2">{key}:</span>
                    <span className="font-bold text-slate-200 text-right max-w-[60%] truncate">
                      {typeof selectedSale[key] === 'object' ? JSON.stringify(selectedSale[key]) : String(displayValue ?? 'NULL')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}