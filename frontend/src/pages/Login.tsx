import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../main";
import toast from "react-hot-toast";
import { useGoogleLogin } from "@react-oauth/google";
import { useAppData } from "../context/AppContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const navigate = useNavigate();
  const { setUser, setIsAuth } = useAppData();

  const responseGoogle = async (authResult: any) => {
    setLoading(true);
    try {
      const result = await axios.post(`${authService}/api/auth/login`, {
        code: authResult["code"],
      });

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setLoading(false);
      setUser(result.data.user);
      setIsAuth(true);
      navigate("/");
    } catch (error) {
      console.log(error);
      toast.error("Problem while login");
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: responseGoogle,
    flow: "auth-code",
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Please fill in all fields");
    }
    setLoading(true);
    try {
      const endpoint = isLogin ? "/api/auth/email-login" : "/api/auth/email-signup";
      const payload = isLogin ? { email, password } : { name: email.split("@")[0], email, password };

      const result = await axios.post(`${authService}${endpoint}`, payload);

      localStorage.setItem("token", result.data.token);
      toast.success(result.data.message);
      setLoading(false);
      setUser(result.data.user);
      setIsAuth(true);
      navigate("/");
    } catch (error: any) {
      console.log(error);
      toast.error(error.response?.data?.message || "Problem while authentication");
      setLoading(false);
    }
  };

  return (
    <div className="bg-background font-['Be_Vietnam_Pro'] text-on-background min-h-screen flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {loading && <LoadingSpinner fullScreen />}
      <header className="bg-white/90 backdrop-blur-md font-['Plus_Jakarta_Sans'] antialiased docked full-width top-0 fixed border-b border-slate-100 shadow-sm z-50 w-full">
        <div className="flex justify-between items-center px-6 h-16 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-1.5 md:gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="material-symbols-outlined text-primary text-[24px] md:text-[28px] filled">local_fire_department</span>
            <span className="text-xl md:text-2xl font-black tracking-tighter text-[#b7102a] italic">Spice Bureau</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsLogin(true)}
              className="font-label-md text-label-md text-on-surface hover:text-primary transition-colors duration-200 cursor-pointer"
            >
              Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className="bg-primary text-on-primary font-label-md text-label-md px-4 py-2 rounded-lg hover:bg-primary-container transition-colors duration-200 shadow-[0_4px_12px_rgba(183,16,42,0.2)] active:scale-95 cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-16">
        <section className="relative min-h-[calc(100vh-64px)] flex items-center pt-12 lg:pt-8 pb-16 px-4 md:px-8">
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-background/95 via-background/90 to-background/80 lg:bg-gradient-to-r lg:from-background/95 lg:via-background/80 lg:to-transparent z-10"></div>
            <img
              alt="Close up of a delicious gourmet burger and fries"
              className="w-full h-full object-cover object-center lg:object-right scale-105"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEF1wSNLKXEdHoOxiNI5Kpzwn4N1TufWrUiyh3eB1vEAMUklRfMTMk7zGfO2hFmT_Csjc8p5PXPiZelkj8jLW1-L_m6psvPFsFdxehFkq50UWgf60OVVbAeIvKH-UboFHy9_i6hXcQw2b6LsDd4NJ8TPxmvH1bSlP2T5caLazW2-ec7tY5S5KrPP_SycGhrWCJ3lB_NQY74fTLHnLT-wUHPKKZPXS2-PvQblA087qSKrl4qPnhsbfFKmd3cadkJa-6wa2WDi2ekHCO"
            />
          </div>

          <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            <div className="lg:col-span-7 flex flex-col gap-4 md:gap-6 text-center lg:text-left">
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm w-fit border border-primary/20 backdrop-blur-sm mx-auto lg:mx-0">
                <span className="material-symbols-outlined text-[16px]">bolt</span>
                Lightning fast delivery
              </span>
              <h1 className="font-display-lg text-3xl md:text-4xl lg:text-display-lg text-on-surface leading-tight">
                Deliciousness delivered to your door
              </h1>
              <p className="font-body-lg text-base md:text-lg lg:text-body-lg text-on-surface-variant max-w-xl mx-auto lg:mx-0">
                Experience the best local restaurants curated by Spice Bureau. Fast, fresh, and totally satisfying.
              </p>
            </div>

            <div className="lg:col-span-5 lg:pl-12">
              <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.1)] border border-white/20 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/20 blur-3xl rounded-full"></div>

                <div className="relative z-10 text-center">
                  <h2 className="font-headline-md text-headline-md text-on-surface mb-2">
                    {isLogin ? "Welcome Back" : "Get Started"}
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                    {isLogin ? "Log in to track your orders and reorder favorites." : "Create an account to track orders and save favorites."}
                  </p>

                  <button
                    onClick={() => googleLogin()}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-surface-variant rounded-lg hover:bg-surface-container-low transition-colors duration-200 mb-4 font-label-md text-label-md text-on-surface shadow-sm disabled:opacity-50 cursor-pointer h-12"
                  >
                    {loading ? (
                      "Signing in..."
                    ) : (
                      <>
                        <img alt="Google logo" className="w-5 h-5 object-contain" src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Google_Favicon_2025.svg" />
                        Continue with Google
                      </>
                    )}
                  </button>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-px bg-surface-variant flex-1"></div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">or</span>
                    <div className="h-px bg-surface-variant flex-1"></div>
                  </div>

                  <form className="flex flex-col gap-4" onSubmit={handleEmailSubmit}>
                    <div>
                      <input
                        className="w-full px-4 py-3 bg-surface-container-low border-transparent focus:border-primary focus:bg-white rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant transition-all outline-none"
                        placeholder="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <div>
                      <input
                        className="w-full px-4 py-3 bg-surface-container-low border-transparent focus:border-primary focus:bg-white rounded-lg font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant transition-all outline-none"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        required
                      />
                    </div>
                    <button
                      className="w-full bg-on-surface text-surface font-label-md text-label-md py-3 rounded-lg hover:bg-inverse-surface transition-all mt-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer h-12 flex items-center justify-center"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        "Please wait..."
                      ) : (
                        isLogin ? "Login" : "Create Account"
                      )}
                    </button>
                  </form>

                  <p className="mt-6 text-center font-body-md text-body-md text-on-surface-variant text-sm">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-primary font-label-md hover:underline cursor-pointer"
                    >
                      {isLogin ? "Sign Up" : "Log in"}
                    </button>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto border-t border-surface-variant/30">
          <div className="text-center mb-10">
            <h2 className="font-headline-lg text-2xl md:text-headline-lg text-on-surface">How it works</h2>
            <p className="font-body-lg text-base md:text-body-lg text-on-surface-variant mt-3 md:mt-4 max-w-2xl mx-auto">Getting your favorite food is easier than ever. Just three simple steps to deliciousness.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
            <div className="hidden md:block absolute top-[60px] left-[15%] right-[15%] h-0.5 bg-surface-variant border-dashed border-t-2 border-surface-variant z-0"></div>

            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-32 h-32 rounded-full bg-surface flex items-center justify-center mb-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-surface-variant transition-transform group-hover:scale-110">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[48px]">touch_app</span>
                </div>
              </div>
              <h3 className="font-title-lg text-title-lg text-on-surface mb-2">1. Choose & Order</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Browse hundreds of menus to find the food you like and place your order.</p>
            </div>

            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-32 h-32 rounded-full bg-surface flex items-center justify-center mb-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-surface-variant transition-transform group-hover:scale-110">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[48px]">skillet</span>
                </div>
              </div>
              <h3 className="font-title-lg text-title-lg text-on-surface mb-2">2. Restaurants Prepare</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Your order is sent to the restaurant and prepared fresh right away.</p>
            </div>

            <div className="flex flex-col items-center text-center relative z-10 group">
              <div className="w-32 h-32 rounded-full bg-surface flex items-center justify-center mb-6 shadow-[0_8px_24px_rgba(0,0,0,0.06)] border border-surface-variant transition-transform group-hover:scale-110">
                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-[48px]">two_wheeler</span>
                </div>
              </div>
              <h3 className="font-title-lg text-title-lg text-on-surface mb-2">3. Fast Delivery</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">Enjoy your food! Our drivers will deliver it hot and fresh to your door.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-surface-container-lowest font-['Plus_Jakarta_Sans'] text-sm leading-relaxed w-full border-t border-surface-variant/50">
        <div className="flex flex-col lg:flex-row justify-between items-center lg:items-end gap-8 lg:gap-4 px-6 md:px-8 pt-8 lg:pt-6 pb-2 max-w-7xl mx-auto">
          <div className="flex flex-col items-center lg:items-start gap-2 text-center lg:text-left">
            <span className="text-xl font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary filled">local_fire_department</span>
              Spice Bureau
            </span>
            <p className="text-on-surface-variant text-xs md:text-sm">© 2026 Spice Bureau. Fast delivery, fresh taste.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-4 lg:mt-0">
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer" href="#">About Us</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer" href="#">Terms of Service</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors duration-200 cursor-pointer" href="#">Contact Support</a>
          </nav>
        </div>
      </footer>
    </div>
  );
};

export default Login;