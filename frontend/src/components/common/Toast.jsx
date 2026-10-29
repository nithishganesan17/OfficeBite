import React from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Toast = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-md shadow-xl rounded-2xl bg-white border border-[#E8E2D5] p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isSuccess ? 'bg-[#EBF5F0] text-[#197A50]' : 'bg-[#FEF3EB] text-[#F28C45]'
        }`}
      >
        {isSuccess ? <CheckCircle2 className="w-5 h-5" /> : <Info className="w-5 h-5" />}
      </div>
      <div className="flex-1 pr-2">
        <p className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">
          {isSuccess ? 'OfficeBite Notification' : 'Information'}
        </p>
        <p className="text-sm font-medium text-[#292524] mt-0.5">{toastMessage.message}</p>
      </div>
    </div>
  );
};
