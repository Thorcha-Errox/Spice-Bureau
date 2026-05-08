import { useNavigate } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useState } from "react";
import type { ICart, IMenuItem, IRestaurant } from "../types";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { VscLoading } from "react-icons/vsc";
import { BiMinus, BiPlus } from "react-icons/bi";
import { TbTrash } from "react-icons/tb";
import { BsArrowRight } from "react-icons/bs";

const Cart = () => {
  const { cart, subTotal, quantity, fetchCart } = useAppData();
  const navigate = useNavigate();

  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [clearingCart, setClearingCart] = useState(false);
  const [note, setNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);

  if (!cart || cart.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500 text-lg">Your cart is empty</p>
      </div>
    );
  }

  const restaurant = cart[0]?.restaurantId as IRestaurant;

  if (!restaurant) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-gray-500 text-lg">Unable to load restaurant details. Please try clearing your cart.</p>
      </div>
    );
  }

  const deliveryFee = subTotal < 250 ? 49 : 0;

  const platformFee = 7;

  const grandTotal = subTotal + deliveryFee + platformFee;

  const increaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/inc`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      await fetchCart();
    } catch (error) {
      toast.error("something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const decreaseQty = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await axios.put(
        `${restaurantService}/api/cart/dec`,
        { itemId },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      await fetchCart();
    } catch (error) {
      toast.error("something went wrong");
    } finally {
      setLoadingItemId(null);
    }
  };

  const clearCart = async () => {
    toast((t) => (
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Are you sure you want to clear your cart?</p>
        <div className="flex gap-2 justify-end">
          <button 
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1 text-xs font-bold uppercase tracking-widest text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                setClearingCart(true);
                await axios.delete(`${restaurantService}/api/cart/clear`, {
                  headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                  },
                });
                await fetchCart();
                toast.success("Cart cleared");
              } catch (error) {
                toast.error("something went wrong");
              } finally {
                setClearingCart(false);
              }
            }}
            className="px-3 py-1 text-xs font-bold uppercase tracking-widest bg-error text-white rounded-lg shadow-lg shadow-error/20 hover:bg-error/90 transition-all"
          >
            Clear
          </button>
        </div>
      </div>
    ), { duration: 5000, position: 'bottom-center' });
  };

  const checkout = () => {
    navigate("/checkout", { state: { note } });
  };
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface text-3xl md:text-4xl">Your Cart</h1>
          <p className="font-body-md text-on-surface-variant mt-2">
            Review your selection from <span className="font-semibold text-primary">{restaurant.name}</span>
          </p>
        </div>
        <button
          onClick={clearCart}
          className="flex items-center gap-2 text-sm font-semibold text-error hover:bg-error-container/10 px-4 py-2 rounded-full transition-colors disabled:opacity-50"
          disabled={clearingCart}
        >
          <TbTrash size={18} />
          Clear Entire Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl bg-surface-container-lowest p-6 shadow-level-1 border border-outline-variant/30">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-2 w-8 rounded-full bg-primary" />
              <h2 className="font-headline-md text-xl">Order Items ({quantity})</h2>
            </div>

            <div className="divide-y divide-outline-variant/30">
              {cart.map((cartItem: ICart) => {
                const item = cartItem.itemId as IMenuItem;
                const isLoading = loadingItemId === item?._id;
                if (!item) return null;

                return (
                  <div
                    key={item?._id}
                    className="group flex flex-col sm:flex-row items-center gap-6 py-6 transition-all"
                  >
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-outline-variant/30">
                      <img
                        src={item?.image}
                        alt={item?.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>

                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-title-lg text-lg text-on-surface">{item?.name}</h3>
                      <p className="font-body-md text-on-surface-variant line-clamp-1 mt-1">
                        Deliciously crafted at {restaurant?.name}
                      </p>
                      <p className="mt-2 font-semibold text-primary">₹{item?.price}</p>
                    </div>

                    <div className="flex items-center gap-4 bg-surface-container-low rounded-full p-1 border border-outline-variant/20">
                      <button
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface shadow-sm hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                        disabled={isLoading}
                        onClick={() => decreaseQty(item?._id)}
                      >
                        {isLoading ? (
                          <VscLoading size={16} className="animate-spin" />
                        ) : (
                          <BiMinus size={18} />
                        )}
                      </button>
                      <span className="w-8 text-center font-bold font-title-lg">{cartItem.quantity}</span>
                      <button
                        className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-lowest text-on-surface shadow-sm hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                        disabled={isLoading}
                        onClick={() => increaseQty(item?._id)}
                      >
                        {isLoading ? (
                          <VscLoading size={16} className="animate-spin" />
                        ) : (
                          <BiPlus size={18} />
                        )}
                      </button>
                    </div>

                    <div className="min-w-[100px] text-right">
                      <p className="font-headline-md text-lg text-on-surface">
                        ₹{(item?.price || 0) * cartItem.quantity}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl bg-primary/5 p-6 border border-primary/10 transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-on-surface">Delivery Instructions</p>
                  <p className="text-sm text-on-surface-variant">Add any special requests for the restaurant</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNoteInput(!showNoteInput)}
                className="text-primary font-bold text-sm hover:underline"
              >
                {showNoteInput ? "Hide" : note ? "Edit Note" : "Add Note"}
              </button>
            </div>
            
            {showNoteInput && (
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Please bring it to the 4th floor, No onions please, etc."
                className="w-full mt-2 p-4 rounded-2xl bg-white border border-outline-variant/30 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                rows={3}
              />
            )}
            
            {note && !showNoteInput && (
              <div className="mt-2 p-4 rounded-2xl bg-white/50 border border-primary/5 italic text-sm text-on-surface-variant">
                &ldquo;{note}&rdquo;
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Summary */}
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="rounded-3xl bg-surface-container-lowest p-6 shadow-level-2 border border-outline-variant/30">
            <h2 className="font-headline-md text-xl mb-6">Bill Details</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between font-body-md text-on-surface-variant">
                <span>Item Total</span>
                <span>₹{subTotal}</span>
              </div>
              <div className="flex justify-between font-body-md text-on-surface-variant">
                <span>Delivery Fee</span>
                <span className={deliveryFee === 0 ? "text-secondary font-semibold" : ""}>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between font-body-md text-on-surface-variant">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>

              {deliveryFee > 0 && (
                <div className="bg-secondary/10 p-3 rounded-2xl border border-secondary/20">
                  <p className="text-xs text-secondary-container font-medium text-center">
                    Add ₹{250 - subTotal} more to get <span className="font-bold underline">FREE delivery</span>
                  </p>
                </div>
              )}

              <div className="h-px bg-outline-variant/30 my-2" />

              <div className="flex justify-between font-headline-md text-xl text-on-surface pt-2">
                <span>To Pay</span>
                <span className="text-primary">₹{grandTotal}</span>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button
                onClick={checkout}
                disabled={!restaurant.isOpen}
                className={`w-full group flex items-center justify-center gap-3 rounded-2xl bg-primary py-4 font-bold text-white shadow-lg transition-all hover:bg-primary-container hover:shadow-primary/25 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {!restaurant.isOpen ? "Restaurant is Closed" : (
                  <>
                    Proceed to Checkout
                    <BsArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
                  </>
                )}
              </button>
              
              <div className="flex items-center justify-center gap-2 text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Secure Checkout Powered by Stripe & Razorpay
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-surface-container p-6 border border-outline-variant/20">
            <h3 className="font-bold text-sm text-on-surface uppercase tracking-wider mb-2">Delivery To</h3>
            <p className="font-semibold text-on-surface line-clamp-1">{restaurant.name}</p>
            <p className="text-sm text-on-surface-variant mt-1 line-clamp-2">
              {restaurant.autoLocation.formattedAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
