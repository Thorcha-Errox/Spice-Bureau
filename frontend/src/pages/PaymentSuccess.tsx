import { useNavigate, useParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { BiCheckCircle } from "react-icons/bi";
import { BsArrowRight } from "react-icons/bs";

const PaymentSuccess = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();

  const { fetchCart } = useAppData();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);
  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 bg-surface">
      <div className="w-full max-w-lg relative">
        <div className="rounded-[40px] bg-surface-container-lowest p-8 md:p-12 shadow-level-2 border border-outline-variant/30 text-center relative z-10 overflow-hidden">
          <div className="relative mb-8 flex justify-center">
            <div className="h-24 w-24 rounded-full bg-secondary/10 flex items-center justify-center text-secondary relative animate-bounce-slow">
              <div className="absolute inset-0 rounded-full border-4 border-secondary/20 animate-ping" />
              <BiCheckCircle size={56} />
            </div>
          </div>

          <h1 className="font-headline-lg text-3xl md:text-4xl text-on-surface mb-2">Order Confirmed!</h1>
          <p className="font-body-md text-on-surface-variant mb-8 max-w-xs mx-auto">
            Your payment was successful and your delicious meal is being prepared.
          </p>

          {paymentId && (
            <div className="rounded-2xl bg-surface-container-low p-4 mb-8 border border-outline-variant/20 inline-block w-full">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1 text-left">Transaction Reference</p>
              <div className="flex items-center justify-between">
                <code className="font-mono text-xs text-primary break-all">{paymentId}</code>
                <button
                  className="p-1 hover:bg-surface-container-high rounded text-on-surface-variant transition-colors"
                  onClick={() => {
                    navigator.clipboard.writeText(paymentId);
                    toast.success("ID Copied!");
                  }}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <button
              className="group flex items-center justify-center gap-2 rounded-2xl bg-primary py-4 font-bold text-white shadow-lg transition-all hover:bg-primary-container hover:-translate-y-1 active:translate-y-0"
              onClick={() => navigate("/orders")}
            >
              Track Order <BsArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
            </button>
            <button
              className="group flex items-center justify-center gap-2 rounded-2xl bg-surface-container-high py-4 font-bold text-on-surface transition-all hover:bg-surface-container-highest hover:-translate-y-1 active:translate-y-0"
              onClick={() => navigate("/")}
            >
              Order More <BsArrowRight className="transition-transform group-hover:translate-x-1" size={18} />
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center gap-2 text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Estimated Delivery: 30-45 Mins
          </div>
        </div>
        <div className="absolute -top-10 -right-10 h-40 w-40 bg-primary/10 rounded-full blur-3xl -z-0 animate-pulse" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-secondary/10 rounded-full blur-3xl -z-0 animate-pulse-slow" />
      </div>
    </div>
  );
};

export default PaymentSuccess;
