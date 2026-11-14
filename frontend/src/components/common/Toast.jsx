import React from 'react';
import { CheckCircle2, Info } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Toast = () => {
  const { toastMessage } = useCart();

  if (!toastMessage) return null;

  const isSuccess = toastMessage.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-bounce-in max-w-md shadow-2xl rounded-2xl bg-[#1A1A1A] border border-white/10 p-4 flex items-center gap-3 text-white">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
          isSuccess ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30' : 'bg-amber-500/20 text-amber-400'
        }`}
      >
        {isSuccess ? <CheckCircle2 className="w-5 h-5 stroke-[2.5]" /> : <Info className="w-5 h-5" />}
      </div>
      <div className="flex-1 pr-2">
        <p className="text-[10px] font-bold text-white/50 uppercase tracking-wider">
          {isSuccess ? 'OfficeBite Notification' : 'Information'}
        </p>
        <p className="text-sm font-semibold text-white mt-0.5">{toastMessage.message}</p>
      </div>
    </div>
  );
};
