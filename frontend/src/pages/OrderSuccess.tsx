import axios from "axios";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { utilsService } from "../main";
import toast from "react-hot-toast";

const OrderSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const sessionId = params.get("session_id");

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) return;

      try {
        await axios.post(`${utilsService}/api/payment/stripe/verify`, {
          sessionId,
        });
        navigate(`/paymentsuccess/${sessionId}`);
      } catch (error) {
        toast.error("Stripe verification failed");
        console.log(error);
      }
    };

    verifyPayment();
  }, [sessionId, navigate]);

  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        <p className="text-on-surface-variant font-medium animate-pulse">Verifying payment...</p>
      </div>
    </div>
  );
};

export default OrderSuccess;
