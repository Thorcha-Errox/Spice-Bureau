import { Link, useLocation, useSearchParams } from "react-router-dom";
import { useAppData } from "../context/AppContext";
import { useEffect, useState, useRef } from "react";

const Navbar = () => {
  const {
    isAuth,
    city,
    quantity,
    isVerified,
    setLocation,
    setCity,
    loadingLocation,
    fetchCurrentLocation,
    user
  } = useAppData();
  const currLocation = useLocation();

  const isHomePage = currLocation.pathname === "/";

  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [locQuery, setLocQuery] = useState("");
  const [locSuggestions, setLocSuggestions] = useState<any[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ search });
      } else {
        setSearchParams({});
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    if (!locQuery || locQuery.trim().length === 0) {
      setLocSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            locQuery
          )}&limit=5&addressdetails=1`
        );
        const data = await response.json();
        if (Array.isArray(data)) {
          setLocSuggestions(data);
        } else {
          setLocSuggestions([]);
        }
      } catch (err) {
        console.error("Error fetching location suggestions:", err);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [locQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setLocSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectSuggestion = (suggestion: any) => {
    const lat = parseFloat(suggestion.lat);
    const lon = parseFloat(suggestion.lon);
    const address = suggestion.address;
    const cityName =
      address?.city ||
      address?.town ||
      address?.village ||
      address?.municipality ||
      address?.county ||
      suggestion.name ||
      "Searched Location";

    setLocation({
      latitude: lat,
      longitude: lon,
      formattedAddress: suggestion.display_name,
    });
    setCity(cityName);
    setLocQuery("");
    setLocSuggestions([]);
  };

  const isAuthPage = currLocation.pathname === "/login" || currLocation.pathname === "/select-role";

  if (isAuthPage) return null;

  const getPortalName = () => {
    if (user?.role === "rider") return "Rider Portal";
    if (user?.role === "seller") return "Seller Portal";
    if (user?.role === "admin") return "Admin Panel";
    return "";
  };

  const portalName = getPortalName();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <>
      <header className="bg-white/90 backdrop-blur-md font-['Plus_Jakarta_Sans'] antialiased sticky top-0 border-b border-slate-100 shadow-sm z-50">
        <div className="flex justify-between items-center w-full px-4 md:px-6 h-16 gap-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <span className="material-symbols-outlined text-primary text-[22px] md:text-[28px] filled">local_fire_department</span>
              <span className="text-lg md:text-2xl font-black tracking-tighter text-primary italic whitespace-nowrap block">
                Spice Bureau {portalName && <span className="text-on-surface-variant font-bold not-italic text-sm md:text-xl ml-1">| {portalName}</span>}
              </span>
            </Link>

            {isHomePage && !portalName && (
              <div className="flex-[3] flex max-w-[280px] sm:max-w-3xl md:max-w-4xl items-center bg-[#F1F3F5] rounded-full px-2 md:px-4 py-1.5 md:py-2 gap-1 md:gap-2 border border-transparent focus-within:border-primary/20 focus-within:bg-white focus-within:shadow-md transition-all min-w-0">
                {/* Location Picker Section */}
                <div className="flex-[1.5] min-w-0 flex items-center gap-1.5 md:gap-2 px-1 md:px-2 relative">
                  {/* Pin Icon button */}
                  <button
                    type="button"
                    onClick={fetchCurrentLocation}
                    disabled={loadingLocation}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-white/50 transition-colors cursor-pointer group flex items-center justify-center"
                    title="Get Current Location"
                  >
                    <span
                      className={`material-symbols-outlined text-primary text-[16px] md:text-[22px] flex-shrink-0 leading-none ${
                        loadingLocation ? "animate-spin" : "group-hover:scale-110 transition-transform"
                      }`}
                    >
                      location_on
                    </span>
                  </button>

                  {/* Vertical Location Input Block */}
                  <div className="flex flex-col leading-none min-w-0 relative flex-1" ref={dropdownRef}>
                    <span className="text-[8px] md:text-[9px] text-on-surface-variant/75 font-bold uppercase tracking-widest whitespace-nowrap mb-0.5 select-none">
                      Current Location
                    </span>
                    <div className="relative w-full">
                      <input
                        type="text"
                        className="w-full bg-transparent border-none py-0 px-0 focus:ring-0 focus:outline-none placeholder:text-slate-400 font-body-md text-[10px] md:text-xs leading-none text-on-surface font-semibold truncate"
                        placeholder="Search city..."
                        value={locQuery}
                        onChange={(e) => setLocQuery(e.target.value)}
                      />

                      {/* Autocomplete Suggestions Dropdown */}
                      {locSuggestions.length > 0 && (
                        <div className="absolute top-full left-0 mt-2 w-56 sm:w-64 md:w-72 bg-white rounded-xl border border-slate-100 shadow-xl z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                          {locSuggestions.map((item, index) => {
                            const mainName =
                              item.address?.city ||
                              item.address?.town ||
                              item.address?.village ||
                              item.address?.municipality ||
                              item.name;
                            const subName = item.display_name.replace(
                              mainName + ", ",
                              ""
                            );
                            return (
                              <button
                                type="button"
                                key={item.place_id || index}
                                onClick={() => handleSelectSuggestion(item)}
                                className="w-full px-3 py-2 text-left hover:bg-slate-50 flex flex-col gap-0.5 border-b border-slate-50 last:border-b-0 transition-colors cursor-pointer"
                              >
                                <span className="text-[11px] font-bold text-slate-800">
                                  {mainName}
                                </span>
                                <span className="text-[9px] text-slate-400 truncate">
                                  {subName}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {loadingSuggestions && (
                        <div className="absolute right-0 top-1/2 -translate-y-1/2">
                          <div className="w-3 h-3 border border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Fetched Location Display Badge */}
                  <div className="flex-shrink-0 flex items-center bg-primary/10 border border-primary/20 rounded-full px-3.5 py-1.5 max-w-[100px] sm:max-w-[150px] md:max-w-[180px] truncate select-none shadow-xs transition-all duration-200">
                    <span
                      className="text-[11px] md:text-xs font-black text-primary truncate leading-none"
                      title={city}
                    >
                      {city || "Select"}
                    </span>
                  </div>
                </div>

                <div className="h-4 md:h-6 w-[1px] bg-outline-variant mx-0.5 md:mx-1"></div>

                <div className="flex-[2] min-w-0 relative flex items-center">
                  <span className="material-symbols-outlined text-slate-400 mr-1 text-[16px] md:text-[24px] flex-shrink-0">
                    search
                  </span>
                  <input
                    className="w-full bg-transparent border-none py-1 focus:ring-0 focus:outline-none placeholder:text-slate-500 font-body-md text-[10px] md:text-sm"
                    placeholder="Search..."
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 md:gap-4 text-slate-600 flex-shrink-0">
            {!portalName && (
              <Link to="/cart" className="hover:bg-primary/10 hover:text-primary transition-all duration-200 rounded-full relative p-2 flex items-center justify-center active:scale-95 group">
                <span className="material-symbols-outlined transition-transform duration-200 group-hover:scale-110">shopping_cart</span>
                {quantity > 0 && (
                  <span className="absolute top-0.5 right-0.5 bg-primary text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                    {quantity}
                  </span>
                )}
              </Link>
            )}

            <div className="hidden md:flex items-center gap-6 ml-4">
              {!portalName ? (
                <>
                  <Link to="/" className={`${isHomePage ? "text-primary font-bold" : "text-slate-600 hover:text-primary"} font-label-md text-label-md transition-colors`}>
                    Home
                  </Link>
                  <Link to="/orders" className={`${currLocation.pathname === "/orders" ? "text-primary font-bold" : "text-slate-600 hover:text-primary"} font-label-md text-label-md transition-colors`}>
                    Orders
                  </Link>
                  {isAuth ? (
                    <Link to="/account" className={`${currLocation.pathname === "/account" ? "text-primary font-bold" : "text-slate-600 hover:text-primary"} font-label-md text-label-md transition-colors`}>
                      Profile
                    </Link>
                  ) : (
                    <Link to="/login" className="text-slate-600 font-label-md text-label-md hover:text-primary transition-colors">
                      Login
                    </Link>
                  )}
                </>
              ) : (
                <>
                  {user?.role === "seller" && (
                    <>
                      <Link to="/seller/dashboard" className={`text-slate-600 hover:text-primary font-label-md text-label-md transition-colors ${currLocation.pathname === "/seller/dashboard" ? "text-primary font-bold" : ""}`}>Dashboard</Link>
                      <Link to="/seller/orders" className={`text-slate-600 hover:text-primary font-label-md text-label-md transition-colors ${currLocation.pathname === "/seller/orders" ? "text-primary font-bold" : ""}`}>Orders</Link>
                      {isVerified && (
                        <Link to="/seller/menu" className={`text-slate-600 hover:text-primary font-label-md text-label-md transition-colors ${currLocation.pathname === "/seller/menu" ? "text-primary font-bold" : ""}`}>Menu</Link>
                      )}
                    </>
                  )}
                  {user?.role === "rider" && (
                    <>
                      <Link to="/" className={`text-slate-600 hover:text-primary font-label-md text-label-md transition-colors ${currLocation.pathname === "/" ? "text-primary font-bold" : ""}`}>Dashboard</Link>
                      <Link to="/rider/orders" className={`text-slate-600 hover:text-primary font-label-md text-label-md transition-colors ${currLocation.pathname === "/rider/orders" ? "text-primary font-bold" : ""}`}>Orders</Link>
                    </>
                  )}
                  {user?.role === "admin" && (
                    <>
                      <Link to="/" className={`text-slate-600 hover:text-primary font-label-md text-label-md transition-colors ${currLocation.pathname === "/" ? "text-primary font-bold" : ""}`}>Dashboard</Link>
                      <Link to="/admin/restaurants" className={`text-slate-600 hover:text-primary font-label-md text-label-md transition-colors ${currLocation.pathname === "/admin/restaurants" ? "text-primary font-bold" : ""}`}>Restaurant</Link>
                      <Link to="/admin/riders" className={`text-slate-600 hover:text-primary font-label-md text-label-md transition-colors ${currLocation.pathname === "/admin/riders" ? "text-primary font-bold" : ""}`}>Rider</Link>
                      <Link to="/admin/customers" className={`text-slate-600 hover:text-primary font-label-md text-label-md transition-colors ${currLocation.pathname === "/admin/customers" ? "text-primary font-bold" : ""}`}>Customers</Link>
                    </>
                  )}
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors p-2 hover:bg-surface rounded-full ml-2 group"
                    title="Logout"
                  >
                    <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">logout</span>
                  </button>
                </>
              )}
            </div>

            {portalName && (
              <div className="md:hidden flex items-center gap-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center p-2 text-on-surface-variant hover:text-primary transition-colors"
                  title="Logout"
                >
                  <span className="material-symbols-outlined text-[24px]">logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <nav className="md:hidden bg-white fixed bottom-0 w-full rounded-t-2xl z-[9999] border-t border-slate-100 shadow-[0_-8px_20px_rgba(230,57,70,0.08)] flex justify-around items-center h-20 pb-safe px-2 sm:px-6">
        {!portalName ? (
          <>
            <Link to="/" className={`flex flex-col items-center justify-center flex-1 ${isHomePage ? "text-primary" : "text-slate-400"} hover:text-primary`}>
              <span className={`material-symbols-outlined ${isHomePage ? "filled" : ""}`}>home</span>
              <span className="font-plus-jakarta-sans text-[10px] font-bold uppercase tracking-widest mt-1">Home</span>
            </Link>
            <Link to="/orders" className={`flex flex-col items-center justify-center flex-1 ${currLocation.pathname === "/orders" ? "text-primary" : "text-slate-400"} hover:text-primary`}>
              <span className={`material-symbols-outlined ${currLocation.pathname === "/orders" ? "filled" : ""}`}>receipt_long</span>
              <span className="font-plus-jakarta-sans text-[10px] font-bold uppercase tracking-widest mt-1">Orders</span>
            </Link>
            {isAuth ? (
              <Link to="/account" className={`flex flex-col items-center justify-center flex-1 ${currLocation.pathname === "/account" ? "text-primary" : "text-slate-400"} hover:text-primary`}>
                <span className={`material-symbols-outlined ${currLocation.pathname === "/account" ? "filled" : ""}`}>person</span>
                <span className="font-plus-jakarta-sans text-[10px] font-bold uppercase tracking-widest mt-1">Profile</span>
              </Link>
            ) : (
              <Link to="/login" className={`flex flex-col items-center justify-center flex-1 ${currLocation.pathname === "/login" ? "text-primary" : "text-slate-400"} hover:text-primary`}>
                <span className="material-symbols-outlined">login</span>
                <span className="font-plus-jakarta-sans text-[10px] font-bold uppercase tracking-widest mt-1">Login</span>
              </Link>
            )}
          </>
        ) : user?.role === "seller" ? (
          <>
            <Link to="/seller/dashboard" className={`flex flex-col items-center justify-center flex-1 ${currLocation.pathname === "/seller/dashboard" ? "text-primary" : "text-slate-400"} hover:text-primary`}>
              <span className={`material-symbols-outlined ${currLocation.pathname === "/seller/dashboard" ? "filled" : ""}`}>dashboard</span>
              <span className="font-plus-jakarta-sans text-[10px] font-bold uppercase tracking-widest mt-1">Dash</span>
            </Link>
            <Link to="/seller/orders" className={`flex flex-col items-center justify-center flex-1 ${currLocation.pathname === "/seller/orders" ? "text-primary" : "text-slate-400"} hover:text-primary`}>
              <span className={`material-symbols-outlined ${currLocation.pathname === "/seller/orders" ? "filled" : ""}`}>receipt_long</span>
              <span className="font-plus-jakarta-sans text-[10px] font-bold uppercase tracking-widest mt-1">Orders</span>
            </Link>
            {isVerified && (
              <Link to="/seller/menu" className={`flex flex-col items-center justify-center flex-1 ${currLocation.pathname === "/seller/menu" ? "text-primary" : "text-slate-400"} hover:text-primary`}>
                <span className={`material-symbols-outlined ${currLocation.pathname === "/seller/menu" ? "filled" : ""}`}>restaurant_menu</span>
                <span className="font-plus-jakarta-sans text-[10px] font-bold uppercase tracking-widest mt-1">Menu</span>
              </Link>
            )}
          </>
        ) : user?.role === "rider" ? (
          <>
            <Link to="/" className={`flex flex-col items-center justify-center flex-1 ${currLocation.pathname === "/" ? "text-primary" : "text-slate-400"} hover:text-primary`}>
              <span className={`material-symbols-outlined ${currLocation.pathname === "/" ? "filled" : ""}`}>dashboard</span>
              <span className="font-plus-jakarta-sans text-[10px] font-bold uppercase tracking-widest mt-1">Dash</span>
            </Link>
            <Link to="/rider/orders" className={`flex flex-col items-center justify-center flex-1 ${currLocation.pathname === "/rider/orders" ? "text-primary" : "text-slate-400"} hover:text-primary`}>
              <span className={`material-symbols-outlined ${currLocation.pathname === "/rider/orders" ? "filled" : ""}`}>receipt_long</span>
              <span className="font-plus-jakarta-sans text-[10px] font-bold uppercase tracking-widest mt-1">Orders</span>
            </Link>
          </>
        ) : user?.role === "admin" ? (
          <>
            <Link to="/" className={`flex flex-col items-center justify-center flex-1 ${currLocation.pathname === "/" ? "text-primary" : "text-slate-400"} hover:text-primary`}>
              <span className={`material-symbols-outlined ${currLocation.pathname === "/" ? "filled" : ""}`}>dashboard</span>
              <span className="font-plus-jakarta-sans text-[10px] font-bold uppercase tracking-widest mt-1">Dash</span>
            </Link>
            <Link to="/admin/restaurants" className={`flex flex-col items-center justify-center flex-1 ${currLocation.pathname === "/admin/restaurants" ? "text-primary" : "text-slate-400"} hover:text-primary`}>
              <span className={`material-symbols-outlined ${currLocation.pathname === "/admin/restaurants" ? "filled" : ""}`}>storefront</span>
              <span className="font-plus-jakarta-sans text-[10px] font-bold uppercase tracking-widest mt-1">Rest</span>
            </Link>
            <Link to="/admin/riders" className={`flex flex-col items-center justify-center flex-1 ${currLocation.pathname === "/admin/riders" ? "text-primary" : "text-slate-400"} hover:text-primary`}>
              <span className={`material-symbols-outlined ${currLocation.pathname === "/admin/riders" ? "filled" : ""}`}>two_wheeler</span>
              <span className="font-plus-jakarta-sans text-[10px] font-bold uppercase tracking-widest mt-1">Riders</span>
            </Link>
            <Link to="/admin/customers" className={`flex flex-col items-center justify-center flex-1 ${currLocation.pathname === "/admin/customers" ? "text-primary" : "text-slate-400"} hover:text-primary`}>
              <span className={`material-symbols-outlined ${currLocation.pathname === "/admin/customers" ? "filled" : ""}`}>group</span>
              <span className="font-plus-jakarta-sans text-[10px] font-bold uppercase tracking-widest mt-1">Users</span>
            </Link>
          </>
        ) : null}
      </nav>

    </>
  );
};

export default Navbar;
