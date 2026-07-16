import React, { useState, useEffect } from 'react';

export default function AgreementManager() {
  //Main Agreement States
  const [editMode, setEditMode] = useState(false); 
  const [selectedAgreementId, setSelectedAgreementId] = useState(null); 

  const [companyId, setCompanyId] = useState('');
  const [propertyID, setPropertyID] = useState('');
  const [shopId, setShopId] = useState(''); 
  const [startDate, setStartDate] = useState('2026-06-17');
  const [endDate, setEndDate] = useState('2026-06-17');
  const [minimumSTOLevel, setMinimumSTOLevel] = useState('');
  const [confeeRate, setConfeeRate] = useState(''); 
  const [BankDepositAmount, setBankDepositAmount] = useState('');
  const [agreementStatus, setAgreementStatus] = useState('Active');
  const [locationId, setLocationId] = useState('');
  const [category, setCategory] = useState('');

  //Dynamic Lists States
  const [depositPaymentMethod, setDepositPaymentMethod] = useState('');
  const [depositType, setDepositType] = useState('');
  const [depositExpiryDate, setDepositExpiryDate] = useState('2026-06-17');
  const [depositList, setDepositList] = useState([]); 

  const [rentalType, setRentalType] = useState('');
  const [rentalMonthlyAmount, setRentalMonthlyAmount] = useState('');
  const [rentalYear, setRentalYear] = useState('');
  const [rentalList, setRentalList] = useState([]); 

  // Database Data Lists
  const [agreements, setAgreements] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [allShops, setAllShops] = useState([]); 
  const [filteredShops, setFilteredShops] = useState([]); 
  const [properties, setProperties] = useState([]);
  const [message, setMessage] = useState(null);

  // Inline Editing States
  const [editingRowId, setEditingRowId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [locationsFilterList, setLocationsFilterList] = useState([]);
  const [selectedFilterLocationId, setSelectedFilterLocationId] = useState('');

  //Load All Data
  const loadInitialData = async () => {
    try {
      const resAgreements = await fetch('http://localhost:5000/api/agreements');
      setAgreements(await resAgreements.json());
      
      const resCompanies = await fetch('http://localhost:5000/api/companies');
      setCompanies(await resCompanies.json());

      const resShops = await fetch('http://localhost:5000/api/shops'); 
      setAllShops(await resShops.json());

      const resProperties = await fetch('http://localhost:5000/api/properties');
      setProperties(await resProperties.json());
    } catch (err) {
      console.error("Data loading failed:", err);
    }
  };
  
  const fetchSavedLocations = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/properties/unique-locations');
      if (res.ok) {
        const data = await res.json();
        setLocationsFilterList(data); 
      }
    } catch (err) {
      console.error("Failed to load unique locations from backend", err);
    }
  };

  useEffect(() => { 
    loadInitialData();
    fetchSavedLocations(); 
  }, []);

  const handleCompanyChange = (selectedCompanyId) => {
    setCompanyId(selectedCompanyId);
    setShopId(''); 

    if (!selectedCompanyId) {
      setFilteredShops([]);
      return;
    }

    const shopsForCompany = allShops.filter(shop => {
      const shopCompanyId = shop.companyId || shop.companyID;
      return String(shopCompanyId) === String(selectedCompanyId);
    });

    setFilteredShops(shopsForCompany);
  };

  const addDepositRow = () => {
    if (!depositPaymentMethod || !BankDepositAmount) return;
    setDepositList([...depositList, {
      paymentMethod: depositPaymentMethod,
      type: depositType,
      amount: BankDepositAmount || '0',
      currency: 'LKR',
      expiryDate: depositExpiryDate
    }]);
  };

  const addRentalRow = () => {
    if (!rentalMonthlyAmount || !rentalYear) return;
    setRentalList([...rentalList, {
      year: rentalYear,
      monthlyRental: rentalMonthlyAmount,
      currency: 'LKR',
      conRate: confeeRate || 0
    }]);
    setRentalMonthlyAmount('');
  };

  const handleAddAgreement = async (e) => {
    e.preventDefault();
    if (!companyId || !propertyID) {
      setMessage({ type: 'error', text: 'Please select Main Company and Property Name!' });
      return;
    }
    setMessage(null);

    const payload = { 
      companyId, propertyID, shopId: shopId || null, startDate, endDate, 
      minimumSTOLevel: minimumSTOLevel || 0, confeeRate: confeeRate || 0, 
      BankDepositAmount: BankDepositAmount || '0', agreementStatus, 
      locationId: locationId || null, STOCurrency: 'LKR', stoCurrency: 'LKR',
      deposits: depositList, rentals: rentalList 
    };

    try {
      const url = editMode ? `http://localhost:5000/api/agreements/${selectedAgreementId}` : 'http://localhost:5000/api/agreements';
      const method = editMode ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: editMode ? 'Agreement updated successfully!' : 'Agreement registered successfully!' });
        handleClear();
        loadInitialData();
        fetchSavedLocations();
      } else {
        const errorText = typeof data.message === 'object' ? JSON.stringify(data.message) : (data.message || 'Failed to save!');
        setMessage({ type: 'error', text: errorText });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection failed!' });
    }
  };

  const handleEdit = (ag) => {
    const currentId = ag.agreementId || ag.agreementID;
    setEditingRowId(currentId);
    setEditMode(true);
    setSelectedAgreementId(currentId);
    
    setEditFormData({
      companyId: ag.companyId || '',
      propertyID: ag.propertyID || '',
      shopId: ag.shopId || '',
      locationId: ag.locationId || '',
      startDate: ag.startDate ? ag.startDate.split('T')[0] : '2026-06-17',
      endDate: ag.endDate ? ag.endDate.split('T')[0] : '2026-06-17',
      minimumSTOLevel: ag.minimumSTOLevel || '',
      confeeRate: ag.confeeRate || '',
      BankDepositAmount: ag.BankDepositAmount || '',
      agreementStatus: ag.agreementStatus || 'Active'
    });
  };

  const handleInlineInputChange = (e, fieldName) => {
    setEditFormData({
      ...editFormData,
      [fieldName]: e.target.value
    });
  };

  const handleInlineUpdateSubmit = async (id) => {
    setMessage(null);
    try {
      const response = await fetch(`http://localhost:5000/api/agreements/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData)
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Agreement updated successfully!' });
        setEditingRowId(null); 
        loadInitialData(); 
        fetchSavedLocations();    
      } else {
        const errorText = typeof data.message === 'object' ? JSON.stringify(data.message) : (data.message || 'Failed to update!');
        setMessage({ type: 'error', text: errorText });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection failed!' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this agreement?")) return;
    try {
      const response = await fetch(`http://localhost:5000/api/agreements/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setMessage({ type: 'success', text: 'Agreement deleted successfully!' });
        loadInitialData();
        fetchSavedLocations();
        if (selectedAgreementId === id) handleClear();
      } else {
        setMessage({ type: 'error', text: 'Failed to delete agreement!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection failed!' });
    }
  };

  const handleClear = () => {
    setEditMode(false);
    setSelectedAgreementId(null);
    setCompanyId(''); setPropertyID(''); setShopId(''); setMinimumSTOLevel(''); setConfeeRate(''); setBankDepositAmount(''); setLocationId('');
    setStartDate('2026-06-17'); setEndDate('2026-06-17'); setAgreementStatus('Active'); setCategory('');
    setDepositList([]); setRentalList([]); setFilteredShops([]);
  };

  const filteredAgreements = selectedFilterLocationId
    ? agreements.filter(ag => String(ag.locationId || ag.LOCATIONID) === String(selectedFilterLocationId))
    : agreements;

  const cardClass = "bg-[#1e293b] border border-[#334155] rounded-xl p-5 space-y-4 shadow-md";
  const inputClass = "flex-1 bg-[#0f172a] border border-[#334155] hover:border-[#475569] p-2 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs transition duration-150";
  const labelClass = "w-40 text-slate-300 font-semibold tracking-wide text-xs";

  return (
    <div className="w-full max-w-full xl:max-w-[1600px] mx-auto space-y-6 text-xs text-slate-200 p-3 md:p-6 bg-[#0f172a] rounded-xl">
      
      {message && (
        <div className={`w-full p-3 rounded-lg text-center border font-bold text-xs shadow-sm ${message.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400' : 'bg-red-950/80 border-red-800 text-red-400'}`}>
          {typeof message.text === 'object' ? JSON.stringify(message.text) : message.text}
        </div>
      )}

      {/* FORM SECTION */}
      <div className="bg-[#1e293b]/40 border border-[#334155] rounded-2xl p-6 space-y-6 shadow-lg">
        <div className="flex justify-between items-center border-b border-[#334155] pb-4">
          <h3 className="text-base font-extrabold text-amber-500 uppercase tracking-wider">
            {editMode ? 'Update Agreement' : 'Add Agreement'}
          </h3>
          <span className="text-cyan-400 font-bold text-[11px]">Fill All Fields before Save</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/*COMPANY PROFILE */}
          <div className={cardClass}>
            <h4 className="text-amber-500 font-extrabold tracking-wider text-xs border-b border-[#475569]/30 pb-2 uppercase">Company Profile</h4>
        
            <div className="flex items-center">
              <label className={labelClass}>Main Company</label>
              <select value={companyId} onChange={(e) => handleCompanyChange(e.target.value)} className={inputClass} required>
                <option value="">-- Select Company --</option>
                {companies.map((c, index) => (
                  <option key={c.companyID || c.companyId || index} value={c.companyID || c.companyId}>{c.companyName}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className={labelClass}>Shop Name</label>
              <select value={shopId} onChange={(e) => setShopId(e.target.value)} className={inputClass}>
                <option value="">-- Select Shop --</option>
                {filteredShops.map((s, index) => (
                  <option key={s.shopId || s.shopID || index} value={s.shopId || s.shopID}>{s.shopName}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className={labelClass}>Category</label>
              <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass} placeholder="Eg: Retail" />
            </div>

            {/*Location ID Dropdown Filter */}
            <div className="flex items-center">
              <label className={labelClass}>Location ID</label>
              <select 
                value={locationId} 
                onChange={(e) => setLocationId(e.target.value)} 
                className={inputClass}
                required
              >
                <option value="">-- Select Location ID --</option>
                {locationsFilterList.map((locId, i) => (
                  <option key={i} value={locId}>
                    {locId}
                  </option>
                ))}
              </select>
            </div> 
          </div>

          {/*AGREEMENT INFO */}
          <div className={cardClass}>
            <h4 className="text-amber-500 font-extrabold tracking-wider text-xs border-b border-[#475569]/30 pb-2 uppercase">Agreement Info</h4>
            
            <div className="flex items-center">
              <label className={labelClass}>Agreement ID</label>
              <input type="text" value={selectedAgreementId || 'Auto Generated'} disabled className="flex-1 bg-[#0f172a]/60 border border-[#334155] p-2 rounded-lg text-slate-500 font-mono font-bold cursor-not-allowed text-xs" />
            </div>

            <div className="flex items-center">
              <label className={labelClass}>Property Name</label>
              <select value={propertyID} onChange={(e) => setPropertyID(e.target.value)} className={inputClass} required>
                <option value="">-- Select Property --</option>
                {properties.map((p, index) => (
                  <option key={p.propertyID || index} value={p.propertyID}>{p.PropertyName}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className={labelClass}>Agreement Starts on</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
            </div>
            
            <div className="flex items-center">
              <label className={labelClass}>Agreement Ends On</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
            </div>

            <div className="flex items-center">
              <label className={labelClass}>Minimum STO Level</label>
              <div className="flex-1 flex">
                <input type="number" value={minimumSTOLevel} onChange={(e) => setMinimumSTOLevel(e.target.value)} className="flex-1 bg-[#0f172a] border border-[#334155] p-2 rounded-l-lg text-slate-100 focus:outline-none focus:border-amber-500 text-xs" placeholder="Eg: 100" />
                <span className="bg-[#334155] text-slate-300 px-3 py-2 rounded-r-lg font-bold border-y border-r border-[#475569] text-[10px] flex items-center">LKR</span>
              </div>
            </div>
          </div>

          {/*DEPOSITS */}
          <div className={cardClass}>
            <h4 className="text-amber-500 font-extrabold tracking-wider text-xs border-b border-[#475569]/30 pb-2 uppercase">Deposits</h4>
            
            <div className="flex items-center">
              <label className={labelClass}>Payment Method</label>
              <select value={depositPaymentMethod} onChange={(e) => setDepositPaymentMethod(e.target.value)} className={inputClass}>
                <option value="">-- Select Method --</option>
                <option value="Bank Guarantee">Bank Guarantee</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className={labelClass}>Deposit Type</label>
              <select value={depositType} onChange={(e) => setDepositType(e.target.value)} className={inputClass}>
                <option value="">-- Select Type --</option>
                <option value="Security">Security Deposit</option>
                <option value="Rent Advance">Rent Advance</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className={labelClass}>Bank Deposit</label>
              <div className="flex-1 flex">
                <input type="number" value={BankDepositAmount} onChange={(e) => setBankDepositAmount(e.target.value)} className="flex-1 bg-[#0f172a] border border-[#334155] p-2 rounded-l-lg text-slate-100 focus:outline-none focus:border-amber-500 text-xs" placeholder="Eg: 50000" />
                <span className="bg-[#334155] text-slate-300 px-3 py-2 rounded-r-lg font-bold border-y border-r border-[#475569] text-[10px] flex items-center">LKR</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className={labelClass}>Expiry Date</label>
              <input type="date" value={depositExpiryDate} onChange={(e) => setDepositExpiryDate(e.target.value)} className={inputClass} />
              <button type="button" onClick={addDepositRow} className="bg-cyan-600 hover:bg-cyan-500 text-white font-extrabold px-3 py-2 rounded-lg text-xs transition shadow-md">+</button>
            </div>
          </div>

          {/*RENTALS CON RATE */}
          <div className={cardClass}>
            <h4 className="text-amber-500 font-extrabold tracking-wider text-xs border-b border-[#475569]/30 pb-2 uppercase">Rentals Con Rate</h4>
            
            <div className="flex items-center">
              <label className={labelClass}>Rental Type</label>
              <select value={rentalType} onChange={(e) => setRentalType(e.target.value)} className={inputClass}>
                <option value="">-- Select Rental Type --</option>
                <option value="Fixed">Fixed Monthly</option>
              </select>
            </div>

            <div className="flex items-center">
              <label className={labelClass}>Monthly Amount</label>
              <div className="flex-1 flex">
                <input type="number" value={rentalMonthlyAmount} onChange={(e) => setRentalMonthlyAmount(e.target.value)} className="flex-1 bg-[#0f172a] border border-[#334155] p-2 rounded-l-lg text-slate-100 focus:outline-none focus:border-amber-500 text-xs" placeholder="Eg: 25000" />
                <span className="bg-[#334155] text-slate-300 px-3 py-2 rounded-r-lg font-bold border-y border-r border-[#475569] text-[10px] flex items-center">LKR</span>
              </div>
            </div>

            <div className="flex items-center">
              <label className={labelClass}>Confee Rate %</label>
              <input type="number" value={confeeRate} onChange={(e) => setConfeeRate(e.target.value)} className={inputClass} placeholder="Eg: 5" />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 border-t border-[#334155] pt-4">
          <button type="button" onClick={handleClear} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-6 py-2 rounded-lg shadow-sm transition duration-150">
            {editMode ? 'Cancel' : 'Clear'}
          </button>
          <button type="submit" onClick={handleAddAgreement} className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-6 py-2 rounded-lg shadow-md transition duration-150">
            {editMode ? 'Update Agreement' : 'Save Agreement'}
          </button>
        </div>
      </div>

      {/* DATA TABLE & FILTER SECTION */}
      <div className="w-full bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden shadow-xl mt-6">
        <div className="bg-[#1e293b] px-4 py-4 border-b border-[#334155] flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div className="flex flex-col space-y-1">
            <h4 className="font-extrabold text-slate-100 uppercase tracking-wider text-[11px]">All Agreement Details</h4>
            <span className="text-[10px] text-slate-400 font-mono font-bold">Total: {filteredAgreements.length} Records</span>
          </div>

          {/* Location Dropdown Filter UI */}
          <div className="flex items-center space-x-2 bg-[#0f172a] border border-[#334155] px-3 py-1.5 rounded-xl shadow-inner max-w-xs w-full sm:w-64">
            <span className="text-slate-400 font-bold text-[10px] uppercase whitespace-nowrap">Filter LOC:</span>
            <select 
              value={selectedFilterLocationId} 
              onChange={(e) => setSelectedFilterLocationId(e.target.value)} 
              className="bg-transparent text-slate-100 text-xs focus:outline-none w-full cursor-pointer font-bold text-cyan-400"
            >
              <option value="" className="bg-[#0f172a] text-slate-300">-- All Locations --</option>
              {locationsFilterList.map((locId, i) => (
                <option key={i} value={locId} className="bg-[#0f172a] text-slate-100 font-mono">
                  {locId}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap text-[11px]">
            <thead>
              <tr className="bg-[#0f172a] border-b border-[#334155] text-slate-400 font-bold tracking-wider uppercase text-[10px]">
                <th className="p-3 border-r border-[#334155] text-center">Agreement ID</th>
                <th className="p-3 border-r border-[#334155] text-center">Company ID</th>
                <th className="p-3 border-r border-[#334155] text-center">Property ID</th>
                <th className="p-3 border-r border-[#334155] text-center">Shop ID</th>
                <th className="p-3 border-r border-[#334155] text-center">Location ID</th>
                <th className="p-3 border-r border-[#334155] text-center">Start Date</th>
                <th className="p-3 border-r border-[#334155] text-center">End Date</th>
                <th className="p-3 border-r border-[#334155] text-center">Min STO Level</th>
                <th className="p-3 border-r border-[#334155] text-center">Confee Rate</th>
                <th className="p-3 border-r border-[#334155] text-center">Bank Deposit</th>
                <th className="p-3 border-r border-[#334155] text-center">Status</th>
                <th className="p-3 text-center w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/60">
              {filteredAgreements.length === 0 ? (
                <tr>
                  <td colSpan="12" className="p-6 text-center text-slate-400 font-bold uppercase bg-[#1e293b]">No records found.</td>
                </tr>
              ) : (
                filteredAgreements.map((ag, idx) => {
                  const currentAgId = ag.agreementId || ag.agreementID;
                  const isRowEditing = editingRowId === currentAgId; 
                  const inlineInputClass = "w-full bg-[#0f172a] border border-[#475569] p-1 rounded text-slate-100 text-[11px] focus:outline-none focus:border-amber-500 font-mono";

                  return (
                    <tr key={currentAgId || idx} className={`text-slate-200 border-b border-[#334155]/40 transition-colors duration-150 ${isRowEditing ? 'bg-[#0f172a]/70 border-amber-500/50' : 'bg-[#1e293b] hover:bg-[#334155]/40'}`}>
                      <td className="p-2 border-r border-[#334155] text-center font-mono font-bold text-amber-500 bg-[#0f172a]/20">{currentAgId}</td>
                      <td className="p-2 border-r border-[#334155]">
                        {isRowEditing ? (
                          <select value={editFormData.companyId} onChange={(e) => handleInlineInputChange(e, 'companyId')} className={inlineInputClass}>
                            {companies.map((c, i) => <option key={i} value={c.companyID || c.companyId}>{c.companyName}</option>)}
                          </select>
                        ) : (
                          <span className="font-semibold text-slate-300">{companies.find(c => String(c.companyID || c.companyId) === String(ag.companyId))?.companyName || ag.companyId}</span>
                        )}
                      </td>
                      <td className="p-2 border-r border-[#334155]">
                        {isRowEditing ? (
                          <select value={editFormData.propertyID} onChange={(e) => handleInlineInputChange(e, 'propertyID')} className={inlineInputClass}>
                            {properties.map((p, i) => <option key={i} value={p.propertyID}>{p.PropertyName}</option>)}
                          </select>
                        ) : (
                          <span className="text-slate-300">{properties.find(p => String(p.propertyID) === String(ag.propertyID))?.PropertyName || ag.propertyID}</span>
                        )}
                      </td>
                      <td className="p-2 border-r border-[#334155] text-center">
                        {isRowEditing ? (
                          <select value={editFormData.shopId} onChange={(e) => handleInlineInputChange(e, 'shopId')} className={inlineInputClass}>
                            <option value="">-- None --</option>
                            {allShops.map((s, i) => <option key={i} value={s.shopId || s.shopID}>{s.shopName}</option>)}
                          </select>
                        ) : (
                          <span className="font-mono text-slate-400">{ag.shopId === 0 || !ag.shopId ? '-' : allShops.find(s => String(s.shopId || s.shopID) === String(ag.shopId))?.shopName || ag.shopId}</span>
                        )}
                      </td>
                      <td className="p-2 border-r border-[#334155] text-center">
                        {isRowEditing ? (
                          <select value={editFormData.locationId} onChange={(e) => handleInlineInputChange(e, 'locationId')} className={inlineInputClass}>
                            <option value="">-- None --</option>
                            {locationsFilterList.map((locId, i) => <option key={i} value={locId}>{locId}</option>)}
                          </select>
                        ) : (
                          <span className="font-mono font-bold text-cyan-400">{ag.locationId || '-'}</span>
                        )}
                      </td>
                      <td className="p-2 border-r border-[#334155] text-center">
                        {isRowEditing ? (
                          <input type="date" value={editFormData.startDate} onChange={(e) => handleInlineInputChange(e, 'startDate')} className={inlineInputClass} />
                        ) : (
                          <span className="font-mono text-slate-300">{ag.startDate ? ag.startDate.split('T')[0] : ''}</span>
                        )}
                      </td>
                      <td className="p-2 border-r border-[#334155] text-center">
                        {isRowEditing ? (
                          <input type="date" value={editFormData.endDate} onChange={(e) => handleInlineInputChange(e, 'endDate')} className={inlineInputClass} />
                        ) : (
                          <span className="font-mono text-slate-300">{ag.endDate ? ag.endDate.split('T')[0] : ''}</span>
                        )}
                      </td>
                      <td className="p-2 border-r border-[#334155]">
                        {isRowEditing ? (
                          <input type="number" value={editFormData.minimumSTOLevel} onChange={(e) => handleInlineInputChange(e, 'minimumSTOLevel')} className={inlineInputClass} />
                        ) : (
                          <div className="text-right font-mono text-amber-500 font-bold pr-2">{ag.minimumSTOLevel ? parseFloat(ag.minimumSTOLevel).toLocaleString() : 0} <span className="text-[9px] text-slate-500 font-normal">LKR</span></div>
                        )}
                      </td>
                      <td className="p-2 border-r border-[#334155]">
                        {isRowEditing ? (
                          <input type="number" value={editFormData.confeeRate} onChange={(e) => handleInlineInputChange(e, 'confeeRate')} className={inlineInputClass} />
                        ) : (
                          <div className="text-right font-mono text-cyan-400 font-bold pr-2">{ag.confeeRate || 0}%</div>
                        )}
                      </td>
                      <td className="p-2 border-r border-[#334155]">
                        {isRowEditing ? (
                          <input type="number" value={editFormData.BankDepositAmount} onChange={(e) => handleInlineInputChange(e, 'BankDepositAmount')} className={inlineInputClass} />
                        ) : (
                          <div className="text-center font-mono text-emerald-400 font-extrabold">{parseFloat(ag.BankDepositAmount || 0).toLocaleString()} <span className="text-[9px] text-slate-500 font-normal">LKR</span></div>
                        )}
                      </td>
                      <td className="p-2 border-r border-[#334155] text-center">
                        {isRowEditing ? (
                          <select value={editFormData.agreementStatus} onChange={(e) => handleInlineInputChange(e, 'agreementStatus')} className={inlineInputClass}>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={ag.agreementStatus === 'Active' ? 'text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/30 font-extrabold text-[9px]' : 'text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/30 font-extrabold text-[9px]'}>
                            {ag.agreementStatus || 'Active'}
                          </span>
                        )}
                      </td>
                      <td className="p-2 text-center bg-[#0f172a]/10">
                        {isRowEditing ? (
                          <div className="flex items-center justify-center space-x-1.5">
                            <button type="button" onClick={() => handleInlineUpdateSubmit(currentAgId)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] px-2 py-1 rounded shadow-sm">Save</button>
                            <button type="button" onClick={() => setEditingRowId(null)} className="bg-slate-700 hover:bg-slate-600 text-slate-300 font-bold text-[10px] px-1.5 py-1 rounded">Cancel</button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <button type="button" onClick={() => handleEdit(ag)} className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded transition">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                              </svg>
                            </button>
                            <button type="button" onClick={() => handleDelete(currentAgId)} className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}