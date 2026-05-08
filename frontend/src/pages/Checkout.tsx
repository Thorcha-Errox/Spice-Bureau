import { useEffect, useState } from "react";
import { useAppData } from "../context/AppContext";
import axios from "axios";
import { restaurantService, utilsService } from "../main";
import { useLocation, useNavigate } from "react-router-dom";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import toast from "react-hot-toast";
import { BiCreditCard, BiLoader } from "react-icons/bi";
import LoadingSpinner from "../components/LoadingSpinner";


interface Address {
  _id: string;
  formattedAddress: string;
  mobile: number;
}

const Checkout = () => {
  const { cart, subTotal, quantity } = useAppData();
  const location = useLocation();
  const note = location.state?.note || "";

  const [addresses, setAddresses] = useState<Address[]>([]);

  const [selectedAddressId, setselectedAddressId] = useState<string | null>(
    null
  );

  const [loadingAddress, setLoadingAddress] = useState(true);

  const [loadingRazorpay, setLoadingRazorpay] = useState(false);
  const [loadingStripe, setLoadingStripe] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!cart || cart.length === 0) {
        setLoadingAddress(false);
        return;
      }

      try {
        const { data } = await axios.get(
          `${restaurantService}/api/address/all`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setAddresses(data || []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingAddress(false);
      }
    };

    fetchAddresses();
  }, [cart]);

  const navigate = useNavigate();

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] item-center justify-center">
        <p className="text-gray-500 text-lg">Your cart is empty</p>
      </div>
    );
  }

  const restaurant = cart[0]?.restaurantId as IRestaurant;

  if (!restaurant) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500 text-lg">Unable to load checkout details. Please try again later.</p>
      </div>
    );
  }

  const deliveryFee = subTotal < 250 ? 49 : 0;

  const platformFee = 7;

  const grandTotal = subTotal + deliveryFee + platformFee;

  const createOrder = async (paymentMethod: "razorpay" | "stripe") => {
    if (!selectedAddressId) return null;

    setCreatingOrder(true);
    try {
      const { data } = await axios.post(
        `${restaurantService}/api/order/new`,
        {
          paymentMethod,
          addressId: selectedAddressId,
          note,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      return data;
    } catch (error) {
      toast.error("Failed to create Order");
    } finally {
      setCreatingOrder(false);
    }
  };

  const payWithRazorpay = async () => {
    try {
      setLoadingRazorpay(true);

      const order = await createOrder("razorpay");
      if (!order) return;

      const { orderId, amount } = order;

      const { data } = await axios.post(`${utilsService}/api/payment/create`, {
        orderId,
      });

      const { razorpayOrderId, key } = data;

      const options = {
        key,
        amount: amount * 100,
        currency: "INR",
        name: "Spice Bureau",
        description: "Food Order Payment",
        order_id: razorpayOrderId,

        handler: async (response: any) => {
          try {
            await axios.post(`${utilsService}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId,
            });

            navigate("/paymentsuccess/" + response.razorpay_payment_id);
          } catch (error) {
            toast.error("Payment verification failed");
          }
        },
        theme: {
          color: "#E23744",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.log(error);
      toast.error("Payment Failed please refresh page");
    } finally {
      setLoadingRazorpay(false);
    }
  };

  const payWithStripe = async () => {
    try {
      setLoadingStripe(true);
      const order = await createOrder("stripe");
      if (!order) return;

      const { orderId } = order;

      const { data } = await axios.post(
        `${utilsService}/api/payment/stripe/create`,
        { orderId }
      );

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Failed to create payment session");
      }
    } catch (error) {
      console.log(error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setLoadingStripe(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="mb-10 text-center md:text-left">
        <h1 className="font-headline-lg text-on-surface text-3xl md:text-4xl">Checkout</h1>
        <p className="font-body-md text-on-surface-variant mt-2">
          Securely complete your order from <span className="font-semibold text-primary">{restaurant.name}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-8">
          <div className="rounded-3xl bg-surface-container-lowest p-6 shadow-level-1 border border-outline-variant/30 flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h2 className="font-headline-md text-xl text-on-surface">{restaurant.name}</h2>
              <p className="text-sm text-on-surface-variant mt-1">{restaurant.autoLocation.formattedAddress}</p>
            </div>
          </div>
          <div className="rounded-3xl bg-surface-container-lowest p-8 shadow-level-1 border border-outline-variant/30">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="h-2 w-8 rounded-full bg-primary" />
                <h3 className="font-headline-md text-xl">Delivery Address</h3>
              </div>
              <button onClick={() => navigate("/address")} className="text-primary font-bold text-sm hover:underline">
                Add New Address
              </button>
            </div>

            {loadingAddress ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : addresses.length === 0 ? (
              <div className="text-center py-12 bg-surface-container-low rounded-3xl border border-dashed border-outline">
                <p className="text-on-surface-variant mb-4">No saved addresses found</p>
                <button
                  onClick={() => navigate("/address")}
                  className="bg-primary text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg hover:shadow-primary/20 transition-all"
                >
                  Create Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {addresses.map((add) => (
                  <label
                    key={add._id}
                    className={`relative flex flex-col gap-3 rounded-2xl border-2 p-5 cursor-pointer transition-all duration-300 ${selectedAddressId === add._id
                        ? "border-primary bg-primary/5 shadow-md"
                        : "border-outline-variant/30 hover:border-outline hover:bg-surface-container-low"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className={`p-2 rounded-xl ${selectedAddressId === add._id ? 'bg-primary text-white' : 'bg-surface-container text-on-surface-variant'}`}>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <input
                        type="radio"
                        className="hidden"
                        checked={selectedAddressId === add._id}
                        onChange={() => setselectedAddressId(add._id)}
                      />
                      {selectedAddressId === add._id && (
                        <div className="h-6 w-6 bg-primary rounded-full flex items-center justify-center text-white">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-bold text-on-surface line-clamp-2 leading-relaxed">
                        {add.formattedAddress}
                      </p>
                      <p className="text-xs text-on-surface-variant mt-2 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        +91 {add.mobile}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8 lg:sticky lg:top-24">
          <div className="rounded-3xl bg-surface-container-lowest p-8 shadow-level-2 border border-outline-variant/30">
            <h3 className="font-headline-md text-xl mb-6">Order Summary</h3>

            <div className="space-y-4 max-h-48 overflow-y-auto no-scrollbar mb-6 pr-2">
              {cart.map((cartItem: ICart) => {
                const item = cartItem.itemId as IMenuItem;
                return (
                  <div className="flex justify-between items-center group" key={cartItem._id}>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold bg-surface-container-high px-2 py-1 rounded text-on-surface-variant">
                        {cartItem.quantity}x
                      </span>
                      <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">{item?.name}</span>
                    </div>
                    <span className="text-sm font-bold">₹{(item?.price || 0) * cartItem.quantity}</span>
                  </div>
                );
              })}
            </div>

            <div className="h-px bg-outline-variant/30 mb-6" />

            <div className="space-y-4">
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Subtotal ({quantity} items)</span>
                <span>₹{subTotal}</span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? "text-secondary font-bold" : ""}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between text-sm text-on-surface-variant">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>

              <div className="flex justify-between items-end pt-4">
                <div>
                  <p className="text-xs text-on-surface-variant uppercase tracking-wider font-bold">Total Amount</p>
                  <p className="text-3xl font-headline-lg text-primary mt-1">₹{grandTotal}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest bg-surface-container px-2 py-1 rounded">Tax Inclusive</p>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <h4 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-4">Choose Payment Method</h4>

              <button
                disabled={!selectedAddressId || loadingRazorpay || creatingOrder}
                onClick={payWithRazorpay}
                className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-[#2D7FF9] p-4 text-white shadow-lg transition-all hover:bg-blue-600 disabled:opacity-50 disabled:grayscale"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    {loadingRazorpay ? <BiLoader className="animate-spin" size={24} /> : <BiCreditCard size={24} />}
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Razorpay</p>
                    <p className="text-xs opacity-80">Cards, UPI, Netbanking</p>
                  </div>
                </div>
                <div className="transition-transform group-hover:translate-x-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <button
                disabled={!selectedAddressId || loadingStripe || creatingOrder}
                onClick={payWithStripe}
                className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-black p-4 text-white shadow-lg transition-all hover:bg-gray-900 disabled:opacity-50 disabled:grayscale"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                    {loadingStripe ? <BiLoader className="animate-spin" size={24} /> : <BiCreditCard size={24} />}
                  </div>
                  <div className="text-left">
                    <p className="font-bold">Stripe Checkout</p>
                    <p className="text-xs opacity-80">Global Secure Payments</p>
                  </div>
                </div>
                <div className="transition-transform group-hover:translate-x-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {!selectedAddressId && (
                <div className="mt-4 flex items-center gap-2 rounded-xl bg-error/10 p-4 text-error text-xs font-medium">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Please select a delivery address to proceed with payment
                </div>
              )}
            </div>

            <div className="mt-8 flex items-center justify-center gap-4">
              <div className="flex items-center gap-1 opacity-40 grayscale hover:grayscale-0 transition-all cursor-help" title="SSL Secured">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">SSL</span>
              </div>
              <div className="flex items-center gap-1 opacity-40 grayscale hover:grayscale-0 transition-all cursor-help" title="PCI Compliant">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" /><path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" /></svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">PCI</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
