import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export default function SalesReportManager() {
  const [reportDate, setReportDate] = useState('2026-07-07'); 
  const [reportMonth, setReportMonth] = useState('2026-07'); 
  const [invoiceCountMonth, setInvoiceCountMonth] = useState('2026-07'); 
  
  const [shopsList, setShopsList] = useState([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [selectedShopMonth, setSelectedShopMonth] = useState('2026-07');

  const [reportData, setReportData] = useState([]);
  const [currentView, setCurrentDateTimeView] = useState('Daily'); 
  const [pdfType, setPdfType] = useState('daily'); 
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    const fetchShops = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/sales/shops');
        if (res.ok) setShopsList(await res.json());
      } catch (err) {
        console.error("Failed to load shops", err);
      }
    };
    fetchShops();
  }, []);

  const fetchDailyReportData = async () => {
    setLoading(true);
    setMessage(null);
    setReportData([]);
    setCurrentDateTimeView(`Daily: ${reportDate}`);
    setPdfType('daily');
    try {
      const res = await fetch(`http://localhost:5000/api/sales/report?date=${reportDate}`);
      if (res.ok) setReportData(await res.json());
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection failed!' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyReportData = async () => {
    setLoading(true);
    setMessage(null);
    setReportData([]);
    setCurrentDateTimeView(`Monthly Total: ${reportMonth}`);
    setPdfType('monthly');
    try {
      const res = await fetch(`http://localhost:5000/api/sales/report-monthly?month=${reportMonth}`);
      if (res.ok) setReportData(await res.json());
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection failed!' });
    } finally {
      setLoading(false);
    }
  };

  const fetchShopwiseMonthlySummary = async () => {
    if (!selectedShopId) {
      alert("Please select a shop branch first! 🛒");
      return;
    }
    setLoading(true);
    setMessage(null);
    setReportData([]);
    
    const matchedName = shopsList.find(s => String(s.shopId) === String(selectedShopId))?.shopName || 'Shop';
    setCurrentDateTimeView(`Summary for: ${matchedName} (${selectedShopMonth})`);
    setPdfType('summary');

    try {
      const res = await fetch(`http://localhost:5000/api/sales/report-shop-monthly-summary?shopId=${selectedShopId}&month=${selectedShopMonth}`);
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
        if (data.length === 0) setMessage({ type: 'info', text: 'No summary records found for this shop in selected month.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to fetch data.' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection failed!' });
    } finally {
      setLoading(false);
    }
  };

  const fetchMonthlyInvoiceCountReport = async () => {
    setLoading(true);
    setMessage(null);
    setReportData([]);
    setCurrentDateTimeView(`Monthly Sales & Invoice Count Metrics (${invoiceCountMonth})`);
    setPdfType('invoiceCount');
    try {
      const res = await fetch(`http://localhost:5000/api/sales/report-monthly-invoice-count?month=${invoiceCountMonth}`);
      if (res.ok) setReportData(await res.json());
    } catch (err) {
      setMessage({ type: 'error', text: 'Server connection failed!' });
    } finally {
      setLoading(false);
    }
  };

  const downloadPDFReport = () => {
    if (reportData.length === 0) return;

    const doc = new jsPDF();
    let mainHeader = '';
    let titlePeriod = '';
    let tableColumns = [];
    let tableRows = [];

    if (pdfType === 'daily') {
      mainHeader = "Daily Sales Report";
      titlePeriod = `Report Date: ${reportDate}`;
      tableColumns = ["MIN Limit", "Company Name", "Shop Name", "Sale Amount", "Currency"];
      tableRows = reportData.map(item => [item.minLimit ? parseFloat(item.minLimit).toLocaleString() : '0', item.companyName || 'N/A', item.shopName || 'N/A', item.saleAmount ? parseFloat(item.saleAmount).toFixed(2) : '0.00', item.currency || 'USD']);
    } else if (pdfType === 'monthly') {
      mainHeader = "Monthly Sales Report";
      titlePeriod = `Report Month: ${reportMonth}`;
      tableColumns = ["MIN Limit", "Company Name", "Shop Name", "Sale Amount", "Currency"];
      tableRows = reportData.map(item => [item.minLimit ? parseFloat(item.minLimit).toLocaleString() : '0', item.companyName || 'N/A', item.shopName || 'N/A', item.saleAmount ? parseFloat(item.saleAmount).toFixed(2) : '0.00', item.currency || 'USD']);
    } else if (pdfType === 'summary') {
      mainHeader = "Shop Monthly Summary Report";
      titlePeriod = `Target Period: ${selectedShopMonth}`;
      tableColumns = ["Month", "Agreement ID", "Company Name", "Shop Name", "Last Date", "Last Invoice No", "Total Sale"];
      tableRows = reportData.map(item => [item.reportMonth || 'N/A', item.agreementId || 'N/A', item.companyName || 'N/A', item.shopName || 'N/A', item.lastDate || 'N/A', item.lastInvoiceNo || 'N/A', item.saleAmount ? parseFloat(item.saleAmount).toFixed(2) : '0.00']);
    } else if (pdfType === 'invoiceCount') {
      mainHeader = "Monthly Sales and Invoice Count Report";
      titlePeriod = `From Date: ${invoiceCountMonth}-01  To Date: ${invoiceCountMonth}-01`;
      tableColumns = ["Shop ID", "Shop Name", "Year", "Month", "Invoice Count", "Sale", "Currency"];
      tableRows = reportData.map(item => [item.shopId || 'N/A', item.shopName || 'N/A', item.reportYear || '2026', item.reportMonth || '7', item.invoiceCount || '0', item.saleAmount ? parseFloat(item.saleAmount).toFixed(2) : '0.00', item.currency || 'USD']);
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Airport & Aviation Services (Sri Lanka) Limited", 105, 15, { align: "center" });
    doc.text("Airport Property Management System", 105, 22, { align: "center" });
    doc.text(mainHeader, 105, 30, { align: "center" });
    doc.text(titlePeriod, 15, 40);

    autoTable(doc, {
      startY: 45,
      head: [tableColumns],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: [51, 65, 85] }
    });

    doc.save(`${mainHeader.replace(/\s+/g, '_')}.pdf`);
  };

  const downloadExcelReport = () => {
    if (reportData.length === 0) return;

    let mainHeader = '';
    let excelData = [];

    if (pdfType === 'daily' || pdfType === 'monthly') {
      mainHeader = pdfType === 'daily' ? "Daily_Sales_Report" : "Monthly_Sales_Report";
      excelData = reportData.map(item => ({
        "MIN Limit": item.minLimit ? parseFloat(item.minLimit) : 0,
        "Company Name": item.companyName || 'N/A',
        "Shop Name": item.shopName || 'N/A',
        "Sale Amount": item.saleAmount ? parseFloat(item.saleAmount) : 0.00,
        "Currency": item.currency || 'USD'
      }));
    } else if (pdfType === 'summary') {
      mainHeader = "Shop_Monthly_Summary_Report";
      excelData = reportData.map(item => ({
        "Month": item.reportMonth || 'N/A',
        "Agreement ID": item.agreementId || 'N/A',
        "Company Name": item.companyName || 'N/A',
        "Shop Name": item.shopName || 'N/A',
        "Last Date": item.lastDate || 'N/A',
        "Last Invoice No": item.lastInvoiceNo || 'N/A',
        "Total Sale": item.saleAmount ? parseFloat(item.saleAmount) : 0.00
      }));
    } else if (pdfType === 'invoiceCount') {
      mainHeader = "Monthly_Sales_and_Invoice_Count_Report";
      excelData = reportData.map(item => ({
        "Shop ID": item.shopId || 'N/A',
        "Shop Name": item.shopName || 'N/A',
        "Year": item.reportYear || '2026',
        "Month": item.reportMonth || '7',
        "Invoice Count": item.invoiceCount ? parseInt(item.invoiceCount) : 0,
        "Sale": item.saleAmount ? parseFloat(item.saleAmount) : 0.00,
        "Currency": item.currency || 'USD'
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sales Data");

    XLSX.writeFile(workbook, `${mainHeader}.xlsx`);
  };
  const cardClass = "bg-[#1e293b] border border-[#334155] rounded-xl p-5 shadow-md flex flex-col justify-between space-y-3 flex-1";
  const inputClass = "w-full bg-[#0f172a] border border-[#334155] hover:border-[#475569] p-2 rounded-lg text-slate-100 focus:outline-none focus:border-amber-500 text-xs transition duration-150";

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 text-xs text-slate-200 p-2 sm:p-4 md:p-6 bg-[#0f172a] rounded-xl">
      
      {message && (
        <div className={`w-full p-3 rounded-lg text-center border font-bold text-xs shadow-sm ${message.type === 'error' ? 'bg-red-950/80 border-red-800 text-red-400' : 'bg-slate-900 border-slate-700 text-cyan-400'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className={cardClass}>
          <div>
            <h3 className="text-sm font-extrabold text-amber-500 uppercase tracking-wider border-b border-[#334155] pb-2">Daily</h3>
          </div>
          <div className="space-y-3 pt-2">
            <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)} className={inputClass} />
            <button onClick={fetchDailyReportData} disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-2 rounded-lg text-xs uppercase transition">View daily</button>
          </div>
        </div>

        <div className={cardClass}>
          <div>
            <h3 className="text-sm font-extrabold text-cyan-400 uppercase tracking-wider border-b border-[#334155] pb-2">Monthly</h3>
          </div>
          <div className="space-y-3 pt-2">
            <input type="month" value={reportMonth} onChange={(e) => setReportMonth(e.target.value)} className={inputClass} />
            <button onClick={fetchMonthlyReportData} disabled={loading} className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold py-2 rounded-lg text-xs uppercase transition">View Monthly</button>
          </div>
        </div>

        <div className={cardClass}>
          <div>
            <h3 className="text-sm font-extrabold text-purple-400 uppercase tracking-wider border-b border-[#334155] pb-2">Shopwise Monthly</h3>
          </div>
          <div className="space-y-2 pt-1">
            <select value={selectedShopId} onChange={(e) => setSelectedShopId(e.target.value)} className={inputClass}>
              <option value="">-- Choose Shop ID --</option>
              {shopsList.map((s, i) => <option key={i} value={s.shopId}>{s.shopId}</option>)}
            </select>
            <input type="month" value={selectedShopMonth} onChange={(e) => setSelectedShopMonth(e.target.value)} className={inputClass} />
            <button onClick={fetchShopwiseMonthlySummary} disabled={loading} className="w-full bg-purple-700 hover:bg-purple-800 text-white font-extrabold py-2 rounded-lg text-xs uppercase transition">
            view shopwise monthly         </button>
          </div>
        </div>

        <div className={cardClass}>
          <div>
            <h3 className="text-sm font-extrabold text-pink-500 uppercase tracking-wider border-b border-[#334155] pb-2">Sales & Invoice Count</h3>
          </div>
          <div className="space-y-3 pt-2">
            <input type="month" value={invoiceCountMonth} onChange={(e) => setInvoiceCountMonth(e.target.value)} className={inputClass} />
            <button onClick={fetchMonthlyInvoiceCountReport} disabled={loading} className="w-full bg-pink-600 hover:bg-pink-700 text-white font-extrabold py-2 rounded-lg text-xs uppercase transition">view sales & invoice count</button>
          </div>
        </div>

      </div>

      <div className="border-b border-[#475569]/30 pb-2 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="text-[10px] text-slate-400 font-mono font-bold">Total Records: {reportData.length}</span>
            
            {/* 🚨 රෙකෝඩ්ස් තියෙනවා නම් විතරක් බටන්ස් යුගලය පෙන්වයි */}
            {reportData.length > 0 && (
              <div className="flex items-center space-x-2">
                
                {/* 🔴 PDF Download Button */}
                <button 
                  onClick={downloadPDFReport} 
                   Grandma-title="Download PDF Report"
                  className="bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-lg transition shadow-md flex items-center space-x-1 border border-rose-500/20 font-bold text-[10px] uppercase"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span>PDF</span>
                </button>

                {/* 🟢 Excel Download Button */}
                <button 
                  onClick={downloadExcelReport} 
                  title="Download Excel Report"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition shadow-md flex items-center space-x-1 border border-emerald-500/20 font-bold text-[10px] uppercase"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <span>Excel</span>
                </button>

              </div>
            )}
          </div>
        <div className="overflow-x-auto rounded-lg border border-[#334155]/60">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#334155] bg-[#0f172a] text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                {pdfType === 'summary' ? (
                  <>
                    <th className="p-3">Month</th>
                    <th className="p-3">Agreement ID</th>
                    <th className="p-3">Company Name</th>
                    <th className="p-3">Shop Name</th>
                    <th className="p-3">Last Date</th>
                    <th className="p-3">Last Invoice No</th>
                    <th className="p-3 text-right">Total Sale</th>
                  </>
                ) : pdfType === 'invoiceCount' ? (
                  <>
                    <th className="p-3">Shop ID</th>
                    <th className="p-3">Shop Name</th>
                    <th className="p-3">Year</th>
                    <th className="p-3">Month</th>
                    <th className="p-3 text-center">Invoice Count</th>
                    <th className="p-3 text-right">Sale</th>
                    <th className="p-3 text-center">Currency</th>
                  </>
                ) : (
                  <>
                    <th className="p-3">MIN Limit</th>
                    <th className="p-3">Company Name</th>
                    <th className="p-3">Shop Name</th>
                    <th className="p-3 text-right">
                      {pdfType === 'daily' ? 'Daily Sale Amount' : 'Monthly Accumulated Sale'}
                    </th>
                    <th className="p-3 text-center">Currency</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#334155]/50 text-slate-300 font-medium text-[11px]">
              {reportData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="text-center p-6 text-slate-500 font-bold uppercase tracking-widest bg-[#1e293b]">No records fetched yet</td>
                </tr>
              ) : (
                reportData.map((item, index) => (
                  <tr key={index} className="hover:bg-[#0f172a]/40 transition bg-[#1e293b]">
                    {pdfType === 'summary' ? (
                      <>
                        <td className="p-3 font-mono font-bold text-cyan-400 bg-cyan-950/10">{item.reportMonth}</td>
                        <td className="p-3 font-mono font-bold text-amber-500">{item.agreementId}</td>
                        <td className="p-3 font-semibold text-slate-200">{item.companyName || 'N/A'}</td>
                        <td className="p-3 text-amber-500 font-bold">{item.shopName}</td>
                        <td className="p-3 font-mono text-purple-400">{item.lastDate || 'N/A'}</td>
                        <td className="p-3 font-mono text-slate-400 truncate max-w-[120px]">{item.lastInvoiceNo || 'N/A'}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400">{Number(item.saleAmount).toFixed(2)}</td>
                      </>
                    ) : pdfType === 'invoiceCount' ? (
                      <>
                        <td className="p-3 font-mono font-bold text-amber-500">{item.shopId}</td>
                        <td className="p-3 font-semibold text-slate-200">{item.shopName}</td>
                        <td className="p-3 font-mono text-slate-400">{item.reportYear}</td>
                        <td className="p-3 font-mono text-slate-400 text-center">{item.reportMonth}</td>
                        <td className="p-3 text-center font-bold text-purple-400">{item.invoiceCount}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400">{Number(item.saleAmount).toFixed(2)}</td>
                        <td className="p-3 text-center"><span className="bg-[#0f172a] border border-[#334155] px-2 py-0.5 rounded text-[10px] text-slate-300 font-bold">{item.currency}</span></td>
                      </>
                    ) : (
                      <>
                        <td className="p-3 font-mono text-slate-400">{item.minLimit ? parseFloat(item.minLimit).toLocaleString() : '0'}</td>
                        <td className="p-3 font-semibold text-slate-200">{item.companyName || 'N/A'}</td>
                        <td className="p-3 text-amber-500 font-bold">{item.shopName}</td>
                        <td className="p-3 text-right font-mono font-bold text-emerald-400">{Number(item.saleAmount).toFixed(2)}</td>
                        <td className="p-3 text-center"><span className="bg-[#0f172a] border border-[#334155] px-2 py-0.5 rounded text-[10px] text-slate-300 font-bold">{item.currency || 'USD'}</span></td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}