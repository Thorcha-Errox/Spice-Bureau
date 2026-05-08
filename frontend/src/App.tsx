import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from "./pages/Home"
import Login from './pages/Login'
import PublicRoute from './components/publicRoute'
import ProtectedRoute from './components/protectedRoute'
import SelectRole from './pages/SelectRole'
import Navbar from './components/navbar'
import Account from './pages/Account'
import { useAppData } from './context/AppContext'
import Restaraunt from './pages/Restaraunt'
import RestaurantPage from './pages/RestaurantPage'
import Cart from './pages/Cart'
import AddAddressPage from './pages/Address'
import Checkout from './pages/Checkout'
import PaymentSuccess from './pages/PaymentSuccess'
import OrderSuccess from './pages/OrderSuccess'
import Orders from './pages/Orders'
import OrderPage from './pages/OrderPage'
import RiderDashboard from './pages/RiderDashboard'
import Admin from './pages/Admin'
import ProfileDetails from './pages/ProfileDetails'
import SellerDashboard from './pages/SellerDashboard'
import SellerOrders from './pages/SellerOrders'
import RiderOrders from './pages/RiderOrders'
import MenuManagement from './pages/MenuManagement'
import AddMenuItemPage from './pages/AddMenuItemPage'
import EditRestaurant from './pages/EditRestaurant'
import LoadingSpinner from './components/LoadingSpinner'


const App = () => {
  const { user, loading } = useAppData();

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={
              user?.role === "seller" ? <Restaraunt /> :
                user?.role === "rider" ? <RiderDashboard /> :
                  user?.role === "admin" ? <Admin /> :
                    <Home />
            } />

            <Route path="/seller/dashboard" element={<SellerDashboard />} />
            <Route path="/seller/orders" element={<SellerOrders />} />
            <Route path="/seller/menu" element={<MenuManagement />} />
            <Route path="/seller/add-item" element={<AddMenuItemPage />} />
            <Route path="/seller/edit-restaurant" element={<EditRestaurant />} />

            <Route path="/paymentsuccess/:paymentId" element={<PaymentSuccess />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/order/:id" element={<OrderPage />} />
            <Route path="/ordersuccess" element={<OrderSuccess />} />
            <Route path="/address" element={<AddAddressPage />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/restaurant/:id" element={<RestaurantPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/rider/orders" element={<RiderOrders />} />
            <Route path="/admin/restaurants" element={<Admin />} />
            <Route path="/admin/riders" element={<Admin />} />
            <Route path="/admin/customers" element={<Admin />} />
            <Route path="/select-role" element={<SelectRole />} />

            <Route path="/account" element={<Account />} />
            <Route path="/profile-details" element={<ProfileDetails />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App