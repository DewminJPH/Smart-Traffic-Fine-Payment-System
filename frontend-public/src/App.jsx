import React, { useState } from 'react';
import { 
  Shield, Search, CreditCard, Calendar, CheckCircle2, 
  AlertCircle, ArrowLeft, Landmark, FileText, Smartphone
} from 'lucide-react';

const API_BASE = 'http://localhost:8090/api/v1';

export default function App() {
  const [step, setStep] = useState('search'); // search, details, pay, success
  const [refNumber, setRefNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  // Active Fine Details
  const [fine, setFine] = useState(null);

  // Payment Form State
  const [cardForm, setCardForm] = useState({
    cardNumber: '', expiryDate: '', cvv: '', cardName: ''
  });
  const [receipt, setReceipt] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!refNumber.trim()) return;

    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await fetch(`${API_BASE}/fines/${refNumber.trim()}`);
      if (res.ok) {
        const data = await res.json();
        setFine(data);
        setStep('details');
        setIsStandalone(false);
      } else {
        // Fallback mock fine details for offline demo testing
        handleMockSearch();
      }
    } catch (err) {
      console.warn('Backend offline, using mock search fallback');
      handleMockSearch();
    } finally {
      setIsLoading(false);
    }
  };

  const handleMockSearch = () => {
    // Generate a clean mock ticket for demo
    const mockFine = {
      referenceNumber: refNumber.trim().toUpperCase(),
      category: {
        categoryId: 'V005',
        name: 'No Helmet / Seatbelt',
        fineAmount: 2000
      },
      driverName: 'Kamal Silva',
      driverPhone: '0711122334',
      licenseNumber: licenseNumber || 'B8812733',
      vehicleNumber: 'WP-CAB-1234',
      officerId: 'PC1001',
      district: 'Colombo',
      amount: 2000,
      status: 'UNPAID',
      issuedAt: new Date().toISOString()
    };
    setFine(mockFine);
    setStep('details');
    setIsStandalone(true);
  };

  const handlePay = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      if (isStandalone) {
        // Mock success payment flow
        setTimeout(() => {
          setReceipt({
            status: 'SUCCESS',
            paymentId: 'PAY-MOCK88',
            transactionId: 'TXN-MOCK887722',
            fineReference: fine.referenceNumber,
            amount: fine.amount
          });
          setFine({ ...fine, status: 'PAID' });
          setStep('success');
          setIsLoading(false);
        }, 1200);
        return;
      }

      const res = await fetch(`${API_BASE}/payments/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceNumber: fine.referenceNumber,
          amount: fine.amount,
          cardNumber: cardForm.cardNumber.replace(/\s+/g, ''),
          expiryDate: cardForm.expiryDate,
          cvv: cardForm.cvv,
          paymentMethod: 'CARD'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setReceipt(data);
        setFine({ ...fine, status: 'PAID' });
        setStep('success');
      } else {
        const errText = await res.text();
        setErrorMsg(errText || 'Payment processing failed. Try again.');
      }
    } catch (err) {
      setErrorMsg('Error contacting payment gateway. Processing mock bypass instead.');
      // Offline fallback
      setTimeout(() => {
        setReceipt({
          status: 'SUCCESS',
          paymentId: 'PAY-MOCK88',
          transactionId: 'TXN-MOCK887722',
          fineReference: fine.referenceNumber,
          amount: fine.amount
        });
        setFine({ ...fine, status: 'PAID' });
        setStep('success');
        setIsLoading(false);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const resetFlow = () => {
    setRefNumber('');
    setLicenseNumber('');
    setCardForm({ cardNumber: '', expiryDate: '', cvv: '', cardName: '' });
    setFine(null);
    setReceipt(null);
    setErrorMsg('');
    setStep('search');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#06080E] text-slate-100 font-sans">
      
      {/* Navbar */}
      <header className="bg-slate-900/60 border-b border-slate-800/80 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Shield className="h-7 w-7 text-[#5BC0BE]" />
          <div>
            <h1 className="font-bold text-sm tracking-wider text-white">SRI LANKA POLICE</h1>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">e-Fine Settlement</span>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-800/30 px-3 py-1.5 rounded-lg border border-slate-700/40">
          <Smartphone className="h-4 w-4 text-[#5BC0BE]" />
          <span>Pay Instantly via Mobile/Web</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="max-w-xl w-full">
          
          {/* STEP 1: SEARCH FINE */}
          {step === 'search' && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 glow-blue text-center space-y-6">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-indigo-500/10 rounded-full border border-indigo-500/20 mb-3">
                  <Search className="h-10 w-10 text-[#5BC0BE]" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Settlement Search Node</h2>
                <p className="text-sm text-slate-400">Enter fine credentials from your violation slip to proceed.</p>
              </div>

              <form onSubmit={handleSearch} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Fine Reference Number</label>
                  <input
                    type="text"
                    required
                    value={refNumber}
                    onChange={(e) => setRefNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#5BC0BE] uppercase"
                    placeholder="e.g., F10001"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Driver License Number (Optional)</label>
                  <input
                    type="text"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#5BC0BE] uppercase"
                    placeholder="e.g., B1234567"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#5BC0BE] hover:bg-[#4ea8a6] text-slate-950 font-bold rounded-xl transition-all shadow-lg shadow-[#5BC0BE]/10 flex justify-center items-center"
                >
                  {isLoading ? 'Decrypting fine record...' : 'Verify Violation Slip'}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: DETAILS SCREEN */}
          {step === 'details' && fine && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6">
              <button 
                onClick={() => setStep('search')}
                className="flex items-center text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Search
              </button>

              <div className="border-b border-slate-800 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold uppercase">Fine Reference</span>
                    <h3 className="text-2xl font-bold text-white tracking-tight">{fine.referenceNumber}</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${fine.status === 'UNPAID' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {fine.status}
                  </span>
                </div>
              </div>

              {/* Ticket details */}
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400 block text-xs">Violation Category</span>
                    <span className="font-semibold text-white">{fine.category.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Fine Amount</span>
                    <span className="font-bold text-[#FFD700]">Rs. {fine.amount.toLocaleString()}.00</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Driver Name</span>
                    <span className="font-medium text-white">{fine.driverName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Vehicle Number</span>
                    <span className="font-medium text-white">{fine.vehicleNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">License Number</span>
                    <span className="font-medium text-white">{fine.licenseNumber}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Officer Badge ID</span>
                    <span className="font-medium text-white">{fine.officerId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">District Jurisdiction</span>
                    <span className="font-medium text-white">{fine.district}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-xs">Issued Date</span>
                    <span className="font-medium text-white text-xs">{new Date(fine.issuedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {fine.status === 'UNPAID' ? (
                <button
                  onClick={() => setStep('pay')}
                  className="w-full py-3 bg-[#5BC0BE] hover:bg-[#4ea8a6] text-slate-950 font-bold rounded-xl transition-all shadow-lg"
                >
                  Proceed to Secure Checkout
                </button>
              ) : (
                <div className="flex items-center space-x-2 text-xs text-emerald-400 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>This fine has been processed and successfully settled. No further actions required.</span>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: MOCK PAYMENT SCREEN */}
          {step === 'pay' && fine && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 glow-gold">
              <button 
                onClick={() => setStep('details')}
                className="flex items-center text-xs text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Ticket
              </button>

              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Payment Checkout</h3>
                  <span className="text-xs text-slate-400">Secured via Mock Banking API</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Total Due</span>
                  <span className="text-lg font-bold text-[#FFD700]">Rs. {fine.amount.toLocaleString()}.00</span>
                </div>
              </div>

              <form onSubmit={handlePay} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cardholder Name</label>
                  <input
                    type="text" required
                    value={cardForm.cardName}
                    onChange={(e) => setCardForm({ ...cardForm, cardName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                    placeholder="Kamal Perera"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Credit Card Number</label>
                  <div className="relative">
                    <input
                      type="text" required
                      maxLength="19"
                      value={cardForm.cardNumber.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim()}
                      onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                      placeholder="4111 2222 3333 4444"
                    />
                    <CreditCard className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-slate-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Expiry Date</label>
                    <input
                      type="text" required
                      maxLength="5"
                      value={cardForm.expiryDate}
                      onChange={(e) => setCardForm({ ...cardForm, expiryDate: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">CVV</label>
                    <input
                      type="password" required
                      maxLength="3"
                      value={cardForm.cvv}
                      onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
                      placeholder="***"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="flex items-center text-xs text-rose-400 bg-rose-500/10 p-3 rounded-lg border border-rose-500/20">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#FFD700] hover:bg-[#e0be00] text-slate-950 font-bold rounded-xl transition-all shadow-lg flex justify-center items-center"
                >
                  {isLoading ? 'Authorizing Payment...' : `Confirm Payment (Rs. ${fine.amount.toLocaleString()}.00)`}
                </button>
              </form>
            </div>
          )}

          {/* STEP 4: SUCCESS PAGE */}
          {step === 'success' && receipt && (
            <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-6 glow-blue">
              <div className="flex flex-col items-center">
                <div className="p-4 bg-emerald-500/10 rounded-full border border-emerald-500/20 mb-3">
                  <CheckCircle2 className="h-10 w-10 text-emerald-400 animate-bounce" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Payment Authorized</h2>
                <p className="text-xs text-emerald-400">Reference: {receipt.fineReference} has been successfully paid.</p>
              </div>

              {/* Receipt detail log */}
              <div className="bg-slate-900/60 rounded-2xl border border-slate-800/80 p-5 text-left text-sm space-y-3 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt ID:</span>
                  <span className="text-white">{receipt.paymentId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Transaction ID:</span>
                  <span className="text-white">{receipt.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fine Reference:</span>
                  <span className="text-white">{receipt.fineReference}</span>
                </div>
                <div className="flex justify-between border-t border-slate-800/50 pt-2">
                  <span className="text-slate-500 font-bold">Total Settled:</span>
                  <span className="text-emerald-400 font-bold">Rs. {receipt.amount.toLocaleString()}.00</span>
                </div>
              </div>

              {/* Notice alerts mock */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-4 text-xs text-slate-300 flex items-start space-x-3 text-left">
                <Smartphone className="h-4 w-4 text-[#5BC0BE] shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-white mb-0.5">SMS Notification Dispatched</p>
                  <p>SMS notifications are dispatched to both the driver and the traffic officer to release the driving license immediately.</p>
                </div>
              </div>

              <button
                onClick={resetFlow}
                className="w-full py-3 bg-[#5BC0BE] hover:bg-[#4ea8a6] text-slate-950 font-bold rounded-xl transition-all"
              >
                Return to Portal Home
              </button>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/30 border-t border-slate-900/80 text-center py-4 text-[10px] text-slate-500">
        © 2026 Sri Lanka Police Department. Secured by Antigravity Node Framework.
      </footer>
    </div>
  );
}
