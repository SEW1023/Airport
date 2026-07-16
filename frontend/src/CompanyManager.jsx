import React, { useState, useEffect } from 'react';
import { validateName, validateEmail, validatePhone, validateLength } from './utils/validationCore';

export default function CompanyManager() {
  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [companies, setCompanies] = useState([]);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null); 
  const [editForm, setEditForm] = useState({ companyName: '', address: '', contact: '', email: '', Status: '' });

  const fetchCompanies = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/companies');
      const data = await response.json();
      setCompanies(data); 
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage(null);

    const errorMsg = validateName(companyName, "Company Name") || 
                      validateEmail(email) || 
                      validatePhone(contact) || 
                      validateLength(address, 200, "Address");

    if (errorMsg) {
      setMessage({ type: 'error', text: errorMsg });
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, address, contact, email }) 
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Company profile added successfully!' });
        setCompanyId('');
        setCompanyName('');
        setAddress('');
        setContact('');
        setEmail('');
        fetchCompanies(); 
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add company!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection failed!' });
    }
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete "${name}"?`);
    if (!confirmDelete) return;

    setMessage(null);
    try {
      const response = await fetch(`http://localhost:5000/api/companies/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Company removed successfully!' });
        fetchCompanies(); 
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete company!' });
    }
  };

  const startEditing = (comp) => {
    const currentCompId = comp.companyID || comp.companyId;
    setEditingId(currentCompId);
    setEditForm({
      companyName: comp.companyName || '',
      address: comp.address || '',
      contact: comp.contact || '',
      email: comp.email || '',
      Status: comp.Status || 'Active'
    });
  };
  
  const handleUpdate = async (id) => {
    setMessage(null);

    const errorMsg = validateName(editForm.companyName, "Company Name") || 
                      validateEmail(editForm.email) || 
                      validatePhone(editForm.contact) || 
                      validateLength(editForm.address, 200, "Address");

    if (errorMsg) {
      setMessage({ type: 'error', text: errorMsg });
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/companies/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Company changes saved successfully!' });
        setEditingId(null); 
        fetchCompanies(); 
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update company!' });
    }
  };

  const cardClass = "bg-[#1e293b] border border-[#334155] rounded-xl p-4 sm:p-5 space-y-4 shadow-md";
  const inputClass = "w-full bg-[#0f172a] border border-[#334155] hover:border-[#475569] p-2 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 text-xs transition duration-150";
  const tableInputClass = "bg-[#0f172a] border border-[#475569] px-2 py-1 rounded text-slate-100 focus:outline-none focus:border-amber-500 text-xs font-medium";
  const labelClass = "w-full sm:w-32 text-slate-300 font-semibold tracking-wide text-xs mb-1 sm:mb-0";
  const formRowClass = "flex flex-col sm:flex-row sm:items-center";

  return (
    <div className="w-full max-w-full xl:max-w-[1600px] mx-auto space-y-6 text-xs text-slate-200 p-2 sm:p-4 md:p-6 bg-[#0f172a] rounded-xl">
      
      {message && message.text && (
        <div className={`w-full p-3 rounded-lg text-center border font-bold text-xs shadow-sm ${message.type === 'success' ? 'bg-emerald-950/80 border-emerald-800 text-emerald-400' : 'bg-red-950/80 border-red-800 text-red-400'}`}>
          {message.text}
        </div>
      )}

      {/*CORPORATE REGISTRATION FORM */}
      <div className="bg-[#1e293b]/40 border border-[#334155] rounded-2xl p-4 sm:p-6 space-y-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#334155] pb-4 gap-2">
          <h3 className="text-base font-extrabold text-amber-500 uppercase tracking-wider">Company Profile</h3>
          <span className="text-cyan-400 font-bold text-[11px]">Register and manage main parent corporations</span>
        </div>
        
        <form onSubmit={handleAdd} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/*IDENTITY PARAMETERS */}
          <div className={cardClass}>
            <h4 className="text-amber-500 font-extrabold tracking-wider text-xs border-b border-[#475569]/30 pb-2 uppercase">Corporate Identity</h4>
            
            <div className={formRowClass}>
              <label className={labelClass}>Company ID</label>
              <input type="text" value={companyId} placeholder="Auto Generated by DB" disabled className="w-full bg-[#0f172a]/60 border border-[#334155] p-2 rounded-lg text-slate-500 font-mono font-bold cursor-not-allowed text-xs" />
            </div>

            <div className={formRowClass}>
              <label className={labelClass}>Company Name</label>
              <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} className={inputClass} placeholder="Eg: Emirates Aviation Group" required />
            </div>

            <div className={formRowClass}>
              <label className={labelClass}>Corporate Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="info@company.com" />
            </div>
          </div>

          {/*LOGISTICS & CONTACT PROFILE */}
          <div className={cardClass}>
            <h4 className="text-amber-500 font-extrabold tracking-wider text-xs border-b border-[#475569]/30 pb-2 uppercase">Logistics & Contact</h4>
            
            <div className={formRowClass}>
              <label className={labelClass}>Headquarters Address</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={inputClass} placeholder="Street, City, Country" />
            </div>

            <div className={formRowClass}>
              <label className={labelClass}>Contact Hotline</label>
              <input type="text" value={contact} onChange={(e) => setContact(e.target.value)} className={inputClass} placeholder=" eg: 0XX XXXX XXX" />
            </div>
            
            {/* BUTTONS STACK */}
            <div className="flex justify-end space-x-3 pt-5">
              <button type="button" onClick={() => { setCompanyName(''); setAddress(''); setContact(''); setEmail(''); }} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-5 py-2 rounded-lg shadow-sm transition duration-150 text-xs">
                Clear
              </button>
              <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-6 py-2 rounded-lg shadow-md transition duration-150 text-xs">
                Add Company
              </button>
            </div>
          </div>
        </form>
      </div>

      {/*CORPORATE LEDGER TABLE */}
      <div className="w-full bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden shadow-xl mt-6">
        <div className="bg-[#1e293b] px-4 py-4 border-b border-[#334155] flex justify-between items-center">
          <h4 className="font-extrabold text-slate-100 uppercase tracking-wider text-[11px]">Registered Corporate Ledger</h4>
          <span className="text-[10px] text-slate-400 font-mono font-bold">Total: {companies.length} Corporations</span>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap text-[11px]">
            <thead>
              <tr className="bg-[#0f172a] border-b border-[#334155] text-slate-400 font-bold tracking-wider uppercase text-[10px]">
                <th className="p-3 border-r border-[#334155] text-center">Company Name</th>
                <th className="p-3 border-r border-[#334155] text-center">Headquarters Address</th>
                <th className="p-3 border-r border-[#334155] text-center">Contact Phone</th>
                <th className="p-3 border-r border-[#334155] text-center">Official e-Mail</th>
                <th className="p-3 border-r border-[#334155] text-center">Status</th>
                <th className="p-3 border-r border-[#334155] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/60">
              {companies.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-6 text-center text-slate-400 font-bold uppercase bg-[#1e293b]">No corporate records synchronized.</td>
                </tr>
              ) : (
                companies.map((comp, index) => {
                  const currentCompId = comp.companyID || comp.companyId;
                  const isEditing = editingId === currentCompId;
                  return (
                    <tr key={currentCompId || index} className="bg-[#1e293b] text-center hover:bg-[#334155]/40 text-slate-200 border-b border-[#334155]/40 transition-colors duration-150">
                      
                      <td className="p-3 border-r border-[#334155] font-semibold text-slate-100">
                        {isEditing ? (
                          <input type="text" value={editForm.companyName} onChange={(e) => setEditForm({ ...editForm, companyName: e.target.value })} className={`${tableInputClass} w-full`} />
                        ) : comp.companyName}
                      </td>

                      <td className="p-3 border-r border-[#334155] text-slate-300">
                        {isEditing ? (
                          <input type="text" value={editForm.address} onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} className={`${tableInputClass} w-full`} />
                        ) : comp.address || '-'}
                      </td>

                      <td className="p-3 border-r border-[#334155] text-slate-300 font-mono">
                        {isEditing ? (
                          <input type="text" value={editForm.contact} onChange={(e) => setEditForm({ ...editForm, contact: e.target.value })} className={`${tableInputClass} w-full`} />
                        ) : comp.contact || '-'}
                      </td>

                      <td className="p-3 border-r border-[#334155] text-slate-300 font-mono">
                        {isEditing ? (
                          <input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className={`${tableInputClass} w-full`} />
                        ) : comp.email || '-'}
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
                          <span className={comp.Status === 'Active' 
                            ? 'text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-extrabold text-[10px]' 
                            : 'text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/30 font-extrabold text-[10px]'}
                          >
                            {comp.Status || 'Active'}
                          </span>
                        )}
                      </td>

                      <td className="p-2.5 text-center bg-[#0f172a]/20">
                        <div className="flex items-center justify-center space-x-2.5">
                          {isEditing ? (
                            <>
                              <button type="button" onClick={() => handleUpdate(currentCompId)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg shadow transition duration-150">Save</button>
                              <button type="button" onClick={() => setEditingId(null)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold px-2.5 py-1 rounded-lg shadow transition duration-150">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button 
                                type="button" 
                                onClick={() => startEditing(comp)} 
                                className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition transform hover:scale-115 active:scale-95"
                                title="Edit Corporation"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                </svg>
                              </button>

                              <button 
                                type="button" 
                                onClick={() => handleDelete(currentCompId, comp.companyName)} 
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition transform hover:scale-115 active:scale-95"
                                title="Delete Corporation"
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