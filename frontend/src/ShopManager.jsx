import React, { useState, useEffect } from 'react';
import { validateName, validateEmail, validatePhone, validateLength } from './utils/validationCore';

export default function ShopManager() {
  const [companyId, setCompanyId] = useState('');
  const [shopName, setShopName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [integrationType, setIntegrationType] = useState('');   
  const [lastDocCount, setLastDocCount] = useState('');

  const [companies, setCompanies] = useState([]);
  const [shops, setShops] = useState([]);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null); 

  const [editForm, setEditForm] = useState({ shopName: '', companyId: '', contact: '', email: '', integrationType: '', lastDocCount: '', Status: 'Active' });

  const fetchData = async () => {
    try {
      const shopResponse = await fetch('http://localhost:5000/api/shops');
      const shopData = await shopResponse.json();
      setShops(shopData);

      const compResponse = await fetch('http://localhost:5000/api/companies');
      const compData = await compResponse.json();
      setCompanies(compData);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!shopName || !companyId) return;
    setMessage(null);

    const errorMsg = validateName(shopName, "Shop Name") || 
                      validateEmail(email) || 
                      validatePhone(contact) || 
                      validateLength(lastDocCount, 200, "Last Document Count");

    if (errorMsg) {
      setMessage({ type: 'error', text: errorMsg });
      return;
    }
    try {
      const response = await fetch('http://localhost:5000/api/shops', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopName, companyId, contact, email, integrationType, lastDocCount }) 
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Shop registered successfully!' });
        setCompanyId('');
        setShopName('');
        setContact('');
        setEmail('');
        setIntegrationType('');
        setLastDocCount('');
        fetchData();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add shop!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection failed!' });
    }
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete shop "${name}"?`);
    if (!confirmDelete) return;

    setMessage(null);
    try {
      const response = await fetch(`http://localhost:5000/api/shops/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Shop deleted successfully!' });
        fetchData(); 
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete shop!' });
    }
  };

  const startEditing = (shop) => {
    const currentId = shop.shopId || shop.shopID;
    setEditingId(currentId);
    setEditForm({
      shopName: shop.shopName || '',
      companyId: shop.companyId || shop.companyID || '',
      contact: shop.contact || '',
      email: shop.email || '',
      Status: shop.Status || 'Active',
      integrationType: shop.integrationType || '',
      lastDocCount: shop.lastDocCount || ''
    });
  };
  
  const handleUpdate = async (id) => {
    if (!id) {
      setMessage({ type: 'error', text: 'Invalid Shop ID!' });
      return;
    }
    setMessage(null);

    const errorMsg = validateName(editForm.shopName, "Shop Name") || 
                      validateEmail(editForm.email) || 
                      validatePhone(editForm.contact) || 
                      validateLength(editForm.address, 200, "Address");

    if (errorMsg) {
      setMessage({ type: 'error', text: errorMsg });
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/shops/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Shop updated successfully!' });
        setEditingId(null); 
        fetchData(); 
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update shop!' });
    }
  };

  const cardClass = "bg-[#1e293b] border border-[#334155] rounded-xl p-4 sm:p-5 space-y-4 shadow-md";
  const inputClass = "w-full bg-[#0f172a] border border-[#334155] hover:border-[#475569] p-2 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs transition duration-150";
  const tableInputClass = "bg-[#0f172a] border border-[#475569] px-2 py-1 rounded text-slate-100 focus:outline-none focus:border-amber-500 text-xs font-medium";
  const labelClass = "w-full sm:w-32 text-slate-300 font-semibold tracking-wide text-xs mb-1 sm:mb-0";
  const formRowClass = "flex flex-col sm:flex-row sm:items-center";

  return (
    <div className="w-full max-w-full xl:max-w-[1600px] mx-auto space-y-6 text-xs text-slate-200 p-2 sm:p-4 md:p-6 bg-[#0f172a] rounded-xl">
      
      {message && (
        <div className={`w-full p-3 rounded-lg text-center border font-bold text-xs shadow-sm ${message.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400' : 'bg-red-950/80 border-red-800 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/* SECTION 1: SHOP REGISTRATION FORM CARD */}
      <div className="bg-[#1e293b]/40 border border-[#334155] rounded-2xl p-4 sm:p-6 space-y-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#334155] pb-4 gap-2">
          <h3 className="text-base font-extrabold text-amber-500 uppercase tracking-wider">Shop Profile</h3>
          <span className="text-cyan-400 font-bold text-[11px]">Register and manage sub-shops</span>
        </div>
        
        <form onSubmit={handleAdd} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT SIDE: PRIMARY INFO */}
          <div className={cardClass}>
            <h4 className="text-amber-500 font-extrabold tracking-wider text-xs border-b border-[#475569]/30 pb-2 uppercase">Primary Info</h4>
            
            <div className={formRowClass}>
              <label className={labelClass}>Main Company</label>
              <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={inputClass} required>
                <option value="">-- Select Company --</option>
                {companies.map(c => (
                  <option key={c.companyID || c.companyId} value={c.companyID || c.companyId}>{c.companyName}</option>
                ))}
              </select>
            </div>

            <div className={formRowClass}>
              <label className={labelClass}>Shop Name</label>
              <input type="text" value={shopName} onChange={(e) => setShopName(e.target.value)} className={inputClass} placeholder=" " required />
            </div>

            <div className={formRowClass}>
              <label className={labelClass}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="shop@airport.com" />
            </div>
          </div>

          {/*METRICS & SYSTEM INTEGRATION */}
          <div className={cardClass}>
            <h4 className="text-amber-500 font-extrabold tracking-wider text-xs border-b border-[#475569]/30 pb-2 uppercase">System Parameters</h4>
            
            <div className={formRowClass}>
              <label className={labelClass}>Integration</label>
              <input type="text" value={integrationType} onChange={(e) => setIntegrationType(e.target.value)} placeholder="POS / Manual / API" className={inputClass} />
            </div>

            <div className={formRowClass}>
              <label className={labelClass}>Contact No</label>
              <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} className={inputClass} placeholder="0XX XXX XXXX" />
            </div>

            <div className={formRowClass}>
              <label className={labelClass}>Doc Count</label>
              <input type="number" value={lastDocCount} onChange={(e) => setLastDocCount(e.target.value)} className={inputClass} placeholder="" />
            </div>
            
            {/* FORM ACTIONS */}
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => { setShopName(''); setCompanyId(''); setContact(''); setEmail(''); setIntegrationType(''); setLastDocCount(''); }} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-5 py-2 rounded-lg shadow-sm transition duration-150 text-xs">
                Clear
              </button>
              <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-6 py-2 rounded-lg shadow-md transition duration-150 text-xs">
                Add Shop
              </button>
            </div>
          </div>
        </form>
      </div>

      {/*SHOP LIST DATA TABLE */}
      <div className="w-full bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden shadow-xl mt-6">
        <div className="bg-[#1e293b] px-4 py-4 border-b border-[#334155] flex justify-between items-center">
          <h4 className="font-extrabold text-slate-100 uppercase tracking-wider text-[11px]">Registered Shop Registry</h4>
          <span className="text-[10px] text-slate-400 font-mono font-bold">Total: {shops.length} Shops</span>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap text-[11px]">
            <thead>
              <tr className="bg-[#0f172a] border-b border-[#334155] text-slate-400 font-bold tracking-wider uppercase text-[10px]">
                <th className="p-3 border-r border-[#334155] text-center">Shop Name</th>
                <th className="p-3 border-r border-[#334155] text-center">Main Company</th>
                <th className="p-3 border-r border-[#334155] text-center">Contact</th>
                <th className="p-3 border-r border-[#334155] text-center">e-Mail</th>
                <th className="p-3 border-r border-[#334155] text-center">Integration</th>
                <th className="p-3 border-r border-[#334155] text-center">Doc Count</th>
                <th className="p-3 border-r border-[#334155] text-center w-24">Status</th>
                <th className="p-3 text-center w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/60">
              {shops.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-slate-400 font-bold uppercase bg-[#1e293b]">No shop records found in database.</td>
                </tr>
              ) : (
                shops.map((shop, index) => {
                  const currentShopId = shop.shopId || shop.shopID; 
                  const isEditing = editingId === currentShopId;
                  return (
                    <tr key={currentShopId || index} className="bg-[#1e293b] text-center hover:bg-[#334155]/40 text-slate-200 border-b border-[#334155]/40 transition-colors duration-150">
                      
                      <td className="p-3 border-r border-[#334155] font-semibold text-slate-100">
                        {isEditing ? (
                          <input type="text" value={editForm.shopName} onChange={(e) => setEditForm({ ...editForm, shopName: e.target.value })} className={`${tableInputClass} w-full`} />
                        ) : shop.shopName}
                      </td>

                      <td className="p-3 border-r border-[#334155] text-amber-400 font-bold">
                        {isEditing ? (
                          <select value={editForm.companyId} onChange={(e) => setEditForm({ ...editForm, companyId: e.target.value })} className={`${tableInputClass} w-full bg-[#0f172a]`}>
                            {companies.map(c => (
                              <option key={c.companyID || c.companyId} value={c.companyID || c.companyId} className="bg-[#0f172a]">{c.companyName}</option>
                            ))}
                          </select>
                        ) : shop.companyName || 'Unknown'}
                      </td>

                      <td className="p-3 border-r border-[#334155] text-slate-300 font-mono">
                        {isEditing ? (
                          <input type="text" value={editForm.contact} onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })} className={`${tableInputClass} w-full`} />
                        ) : shop.contact || '-'}
                      </td>

                      <td className="p-3 border-r border-[#334155] text-slate-300 font-mono">
                        {isEditing ? (
                          <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={`${tableInputClass} w-full`} />
                        ) : shop.email || '-'}
                      </td>

                      <td className="p-3 border-r border-[#334155] text-cyan-400 font-medium">
                        {isEditing ? (
                          <input type="text" value={editForm.integrationType} onChange={(e) => setEditForm({ ...editForm, integrationType: e.target.value })} className={`${tableInputClass} w-full`} />
                        ) : shop.integrationType || '-'}
                      </td>

                      <td className="p-3 border-r border-[#334155] text-right font-mono text-slate-100 font-bold pr-6">
                        {isEditing ? (
                          <input type="number" value={editForm.lastDocCount} onChange={(e) => setEditForm({ ...editForm, lastDocCount: e.target.value })} className={`${tableInputClass} w-24 text-center`} />
                        ) : (shop.lastDocCount !== null && shop.lastDocCount !== undefined ? shop.lastDocCount.toLocaleString() : '0')}
                      </td>

                      <td className="p-3 border-r border-[#334155] text-center">
                        {isEditing ? (
                          <select 
                            value={editForm.Status} 
                            onChange={(e) => setEditForm({ ...editForm, Status: e.target.value })} 
                            className={`${tableInputClass} bg-[#0f172a] px-1`}
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        ) : (
                          <span className={shop.Status === 'Active' 
                            ? 'text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-extrabold text-[10px]' 
                            : 'text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/30 font-extrabold text-[10px]'}
                          >
                            {shop.Status || 'Active'}
                          </span>
                        )}
                      </td>

                      <td className="p-2.5 text-center bg-[#0f172a]/20">
                        <div className="flex items-center justify-center space-x-2.5">
                          {isEditing ? (
                            <>
                              <button type="button" onClick={() => handleUpdate(currentShopId)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg shadow transition duration-150">Save</button>
                              <button type="button" onClick={() => setEditingId(null)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold px-2.5 py-1 rounded-lg shadow transition duration-150">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button 
                                type="button" 
                                onClick={() => startEditing(shop)} 
                                className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition transform hover:scale-115 active:scale-95"
                                title="Edit Shop"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                </svg>
                              </button>

                              <button 
                                type="button" 
                                onClick={() => handleDelete(currentShopId, shop.shopName)} 
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition transform hover:scale-115 active:scale-95"
                                title="Delete Shop"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
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