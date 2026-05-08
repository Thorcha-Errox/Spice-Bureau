import { useState } from "react";
import type { IMenuItem } from "../types";
import { FiEyeOff } from "react-icons/fi";
import { BsEye } from "react-icons/bs";
import { BiMinus, BiPlus, BiTrash } from "react-icons/bi";
import { VscLoading } from "react-icons/vsc";
import axios from "axios";
import { restaurantService } from "../main";
import toast from "react-hot-toast";
import { useAppData } from "../context/AppContext";

interface MenuItemsProps {
  items: IMenuItem[];
  onItemDeleted: () => void;
  isSeller: boolean;
}



const MenuItems = ({ items, onItemDeleted, isSeller }: MenuItemsProps) => {
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);

  const handleDelete = async (itemId: string) => {
    const confirm = window.confirm("Are you sure you want to delete this item");
    if (!confirm) return;

    try {
      await axios.delete(`${restaurantService}/api/item/${itemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      toast.success("Item deleted");
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete item");
    }
  };

  const toggleAvailiblity = async (itemId: string) => {
    try {
      const { data } = await axios.put(
        `${restaurantService}/api/item/status/${itemId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      onItemDeleted();
    } catch (error) {
      console.log(error);
      toast.error("Failed to update status");
    }
  };

  const { fetchCart, cart } = useAppData();

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

  const getItemQty = (itemId: string) => {
    const cartItem = cart?.find((c: any) => (c.itemId?._id || c.itemId) === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const addToCart = async (restaurantId: string, itemId: string) => {
    try {
      setLoadingItemId(itemId);

      const { data } = await axios.post(
        `${restaurantService}/api/cart/add`,
        {
          restaurantId,
          itemId,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success(data.message);
      fetchCart();
    } catch (error: any) {
      toast.error(error.response.data.message);
    } finally {
      setLoadingItemId(null);
    }
  };
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {items.map((item) => {
        const isLoading = loadingItemId === item._id;

        return (
          <div
            className={`bg-surface-container-lowest rounded-xl shadow-level-1 border border-outline-variant/30 overflow-hidden flex flex-col group hover:shadow-level-2 transition-all ${!item.isAvailable ? "opacity-70" : ""
              }`}
            key={item._id}
          >
            <div className="h-48 relative overflow-hidden bg-surface-container-low">
              <img
                src={item.image || "https://via.placeholder.com/300"}
                alt={item.name}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!item.isAvailable ? "grayscale brightness-75" : ""
                  }`}
              />
              {!item.isAvailable && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <span className="bg-white text-on-surface px-3 py-1 rounded-full font-label-sm text-label-sm shadow-md">
                    Not Available
                  </span>
                </div>
              )}
            </div>

            <div className="p-3 md:p-6 flex flex-col flex-grow">
              <div className="flex items-start justify-between mb-1">
                <h3 className="font-title-md md:font-title-lg text-sm md:text-title-lg text-on-surface line-clamp-1">
                  {item.name}
                </h3>
                {isSeller && (
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleAvailiblity(item._id)}
                      className="text-on-surface-variant hover:text-primary p-1.5 rounded-full hover:bg-surface-container transition-colors"
                      title={item.isAvailable ? "Hide item" : "Show item"}
                    >
                      {item.isAvailable ? (
                        <BsEye size={18} />
                      ) : (
                        <FiEyeOff size={18} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-error hover:bg-error-container p-1.5 rounded-full transition-colors"
                      title="Delete item"
                    >
                      <BiTrash size={18} />
                    </button>
                  </div>
                )}
              </div>

              <p className="font-body-md text-body-md text-on-surface-variant flex-grow mb-4 line-clamp-2 text-[10px] md:text-sm">
                {item.description || "Freshly prepared with quality ingredients."}
              </p>

              <div className="flex items-center justify-between mt-auto">
                <span className="font-title-lg text-title-lg text-on-surface">
                  ₹{item.price}
                </span>

                {!isSeller && (
                  <div className="flex items-center">
                    {getItemQty(item._id) > 0 ? (
                      <div className="flex items-center gap-2 md:gap-3 bg-primary/10 rounded-full p-1 border border-primary/20">
                        <button
                          className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-white text-primary shadow-sm hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                          disabled={isLoading}
                          onClick={() => decreaseQty(item._id)}
                        >
                          {isLoading ? (
                            <VscLoading size={14} className="animate-spin" />
                          ) : (
                            <BiMinus size={16} />
                          )}
                        </button>
                        <span className="w-4 md:w-6 text-center font-bold text-xs md:text-sm text-on-surface">
                          {getItemQty(item._id)}
                        </span>
                        <button
                          className="flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full bg-white text-primary shadow-sm hover:bg-primary hover:text-white transition-all disabled:opacity-50"
                          disabled={isLoading}
                          onClick={() => increaseQty(item._id)}
                        >
                          {isLoading ? (
                            <VscLoading size={14} className="animate-spin" />
                          ) : (
                            <BiPlus size={16} />
                          )}
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={!item.isAvailable || isLoading}
                        onClick={() => addToCart(item.restaurantId, item._id)}
                        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full font-label-md text-xs md:text-label-md transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${!item.isAvailable || isLoading
                          ? "bg-surface-container-low text-on-surface-variant cursor-not-allowed"
                          : "bg-primary text-white hover:bg-[#db313f] shadow-[0_4px_12px_rgba(183,16,42,0.2)] hover:shadow-[0_8px_24px_rgba(183,16,42,0.3)]"
                          }`}
                      >
                        {isLoading ? (
                          <VscLoading size={16} className="animate-spin text-white" />
                        ) : (
                          <>
                            <span className="material-symbols-outlined text-[16px] md:text-[18px] text-white">
                              add
                            </span>
                            <span className="text-white font-bold">Add</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MenuItems;
