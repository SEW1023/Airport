import React, { useState, useEffect } from 'react';

export default function PropertyManager() {
  const [propertyName, setPropertyName] = useState('');
  const [sqft, setSqft] = useState('');
  const [locationId, setLocationId] = useState('');
  const [leased, setLeased] = useState('No');   
  const [proposedProperty, setProposedProperty] = useState('');
  const [chartColor, setChartColor] = useState('#000000');

  const [properties, setProperties] = useState([]);
  const [message, setMessage] = useState(null);
  const [editingId, setEditingId] = useState(null); 
  const [editForm, setEditForm] = useState({ PropertyName: '', sqft: '', locationId: '', leased: 'No', proposedProperty: '', chartColor: '#000000' });

  const fetchProperties = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/properties');
      const data = await response.json();
      setProperties(data);
    } catch (err) {
      console.error("Failed to fetch properties:", err);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!propertyName) return;
    setMessage(null);

    try {
      const response = await fetch('http://localhost:5000/api/properties/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ PropertyName: propertyName, sqft, locationId, leased, proposedProperty, chartColor }) 
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Property added successfully!' });
        setPropertyName('');
        setSqft('');
        setLocationId('');
        setLeased('No');
        setProposedProperty('');
        setChartColor('#000000');
        fetchProperties();
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add property!' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection failed!' });
    }
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete property "${name}"?`);
    if (!confirmDelete) return;

    setMessage(null);
    try {
      const response = await fetch(`http://localhost:5000/api/properties/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Property record removed!' });
        fetchProperties(); 
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to delete property!' });
    }
  };

  const startEditing = (prop) => {
    const currentId = prop.propertyId || prop.propertyID;
    setEditingId(currentId);
    setEditForm({
      PropertyName: prop.PropertyName || '',
      sqft: prop.sqft || '',
      locationId: prop.locationId || prop.LOCATIONID || '',
      leased: prop.leased || 'No',
      proposedProperty: prop.proposedProperty || '',
      chartColor: prop.chartColor || '#000000'
    });
  };
  
  const handleUpdate = async (id) => {
    setMessage(null);
    try {
      const response = await fetch(`http://localhost:5000/api/properties/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Property updated successfully!' });
        setEditingId(null); 
        fetchProperties(); 
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update property!' });
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

      {/*PROPERTY PROFILE REGISTRATION FORM */}
      <div className="bg-[#1e293b]/40 border border-[#334155] rounded-2xl p-4 sm:p-6 space-y-6 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#334155] pb-4 gap-2">
          <h3 className="text-base font-extrabold text-amber-500 uppercase tracking-wider">Property Profile</h3>
          <span className="text-cyan-400 font-bold text-[11px]">Manage airport real estate and locations</span>
        </div>
        
        <form onSubmit={handleAdd} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/*LOCATION & GEOMETRY */}
          <div className={cardClass}>
            <h4 className="text-amber-500 font-extrabold tracking-wider text-xs border-b border-[#475569]/30 pb-2 uppercase">Spatial Metrics</h4>
            
            <div className={formRowClass}>
              <label className={labelClass}>Property Name / No</label>
              <input type="text" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} className={inputClass} placeholder="Eg: Terminal 1 - Shop A" required />
            </div>

            <div className={formRowClass}>
              <label className={labelClass}>Area (Sqft)</label>
              <input type="number" value={sqft} onChange={(e) => setSqft(e.target.value)} className={inputClass} placeholder="Eg: 1250" />
            </div>

            <div className={formRowClass}>
              <label className={labelClass}>Location ID</label>
              <input type="text" value={locationId} onChange={(e) => setLocationId(e.target.value)} className={inputClass} placeholder="Eg: LOC-099" />
            </div>
          </div>

          {/*LEASE LOGISTICS & SCHEMATICS */}
          <div className={cardClass}>
            <h4 className="text-amber-500 font-extrabold tracking-wider text-xs border-b border-[#475569]/30 pb-2 uppercase">Status & Layout</h4>
            
            <div className={formRowClass}>
              <label className={labelClass}>Leased Status</label>
              <select value={leased} onChange={(e) => setLeased(e.target.value)} className={inputClass}>
                <option value="No">No (Available)</option>
                <option value="Yes">Yes (Leased)</option>
              </select>
            </div>

            <div className={formRowClass}>
              <label className={labelClass}>Proposed Property</label>
              <input type="text" value={proposedProperty} onChange={(e) => setProposedProperty(e.target.value)} className={inputClass} placeholder="Proposed alternate use" />
            </div>

            <div className={formRowClass}>
              <label className={labelClass}>Chart Color</label>
              <div className="flex items-center space-x-3 w-full">
                <input type="color" value={chartColor} onChange={(e) => setChartColor(e.target.value)} className="w-12 h-8 bg-transparent cursor-pointer rounded-lg border border-[#334155]" />
                <span className="font-mono text-xs text-slate-400 uppercase bg-[#0f172a] px-2 py-1 rounded border border-[#334155]">{chartColor}</span>
              </div>
            </div>
            
            {/* BUTTONS ROW */}
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={() => { setPropertyName(''); setSqft(''); setLocationId(''); setLeased('No'); setProposedProperty(''); setChartColor('#000000'); }} className="bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold px-5 py-2 rounded-lg shadow-sm transition duration-150 text-xs">
                Clear
              </button>
              <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold px-6 py-2 rounded-lg shadow-md transition duration-150 text-xs">
                Add Property
              </button>
            </div>
          </div>
        </form>
      </div>

      {/*PROPERTY LISTING DATA TABLE */}
      <div className="w-full bg-[#1e293b] border border-[#334155] rounded-2xl overflow-hidden shadow-xl mt-6">
        <div className="bg-[#1e293b] px-4 py-4 border-b border-[#334155] flex justify-between items-center">
          <h4 className="font-extrabold text-slate-100 uppercase tracking-wider text-[11px]">Airport Property Registry</h4>
          <span className="text-[10px] text-slate-400 font-mono font-bold">Total: {properties.length} Active Records</span>
        </div>
        
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse whitespace-nowrap text-[11px]">
            <thead>
              <tr className="bg-[#0f172a] border-b border-[#334155] text-slate-400 font-bold tracking-wider uppercase text-[10px]">
                <th className="p-3 border-r border-[#334155] text-center">Property Name</th>
                <th className="p-3 border-r border-[#334155] text-center">Area (Sqft)</th>
                <th className="p-3 border-r border-[#334155] text-center">Location ID</th>
                <th className="p-3 border-r border-[#334155] text-center w-28">Leased</th>
                <th className="p-3 border-r border-[#334155] text-center">Proposed Property</th>
                <th className="p-3 border-r border-[#334155] text-center w-24">Color</th>
                <th className="p-3 text-center w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/60">
              {properties.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-400 font-bold uppercase bg-[#1e293b]">No property infrastructure records available.</td>
                </tr>
              ) : (
                properties.map((prop, index) => {
                  const currentPropId = prop.propertyId || prop.propertyID;
                  const isEditing = editingId === currentPropId;
                  return (
                    <tr key={currentPropId || index} className="bg-[#1e293b] hover:bg-[#334155]/40 text-slate-200 text-center border-b border-[#334155]/40 transition-colors duration-150">
                      
                      <td className="p-3 border-r border-[#334155] font-semibold text-slate-100">
                        {isEditing ? (
                          <input type="text" value={editForm.PropertyName} onChange={(e) => setEditForm({ ...editForm, PropertyName: e.target.value })} className={`${tableInputClass} w-full`} />
                        ) : prop.PropertyName}
                      </td>

                      <td className="p-3 border-r border-[#334155] text-right font-mono text-amber-400 font-bold pr-6">
                        {isEditing ? (
                          <input type="number" value={editForm.sqft} onChange={(e) => setEditForm({ ...editForm, sqft: e.target.value })} className={`${tableInputClass} w-24 text-center`} />
                        ) : (prop.sqft ? parseFloat(prop.sqft).toLocaleString() : '0')}
                      </td>

                      <td className="p-3 border-r border-[#334155] text-slate-300 font-mono">
                        {isEditing ? (
                          <input type="text" value={editForm.locationId} onChange={(e) => setEditForm({ ...editForm, locationId: e.target.value })} className={`${tableInputClass} w-full`} />
                        ) : prop.locationId || '-'}
                      </td>

                      <td className="p-3 border-r border-[#334155] text-center">
                        {isEditing ? (
                          <select 
                            value={editForm.leased} 
                            onChange={(e) => setEditForm({ ...editForm, leased: e.target.value })} 
                            className={`${tableInputClass} bg-[#0f172a] px-1`}
                          >
                            <option value="No">No</option>
                            <option value="Yes">Yes</option>
                          </select>
                        ) : (
                          <span className={prop.leased === 'Yes' 
                            ? 'text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/30 font-extrabold text-[10px]' 
                            : 'text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/30 font-extrabold text-[10px]'}
                          >
                            {prop.leased === 'Yes' ? 'Leased 🔴' : 'Available 🟢'}
                          </span>
                        )}
                      </td>

                      <td className="p-3 border-r border-[#334155] text-slate-300">
                        {isEditing ? (
                          <input type="text" value={editForm.proposedProperty} onChange={(e) => setEditForm({ ...editForm, proposedProperty: e.target.value })} className={`${tableInputClass} w-full`} />
                        ) : prop.proposedProperty || '-'}
                      </td>

                      <td className="p-3 border-r border-[#334155] text-center">
                        {isEditing ? (
                          <input type="color" value={editForm.chartColor} onChange={(e) => setEditForm({ ...editForm, chartColor: e.target.value })} className="w-10 h-6 cursor-pointer rounded border border-[#334155]" />
                        ) : (
                          <div className="flex items-center justify-center space-x-2">
                            <span className="w-3.5 h-3.5 rounded-full border border-[#475569]/65 inline-block shadow" style={{ backgroundColor: prop.chartColor || '#000000' }}></span>
                            <span className="font-mono text-[10px] text-slate-400 uppercase">{prop.chartColor || '#000000'}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-2.5 text-center bg-[#0f172a]/20">
                        <div className="flex items-center justify-center space-x-2.5">
                          {isEditing ? (
                            <>
                              <button type="button" onClick={() => handleUpdate(currentPropId)} className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg shadow transition duration-150">Save</button>
                              <button type="button" onClick={() => setEditingId(null)} className="bg-slate-600 hover:bg-slate-500 text-white font-bold px-2.5 py-1 rounded-lg shadow transition duration-150">Cancel</button>
                            </>
                          ) : (
                            <>
                              <button 
                                type="button" 
                                onClick={() => startEditing(prop)} 
                                className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition transform hover:scale-115 active:scale-95"
                                title="Edit Property"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                                </svg>
                              </button>

                              <button 
                                type="button" 
                                onClick={() => handleDelete(currentPropId, prop.PropertyName)} 
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition transform hover:scale-115 active:scale-95"
                                title="Delete Property"
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