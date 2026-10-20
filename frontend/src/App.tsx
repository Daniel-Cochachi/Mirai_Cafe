import {
  BrowserRouter,
  Route,
  Routes,
} from 'react-router-dom'

import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { MenuPage } from './pages/MenuPage'
import { RegisterPage } from './pages/RegisterPage'
import { ProfilePage } from './pages/ProfilePage'
import { MyOrdersPage } from './pages/MyOrdersPage'
import { AdminPage } from './pages/AdminPage'
import { CartProvider } from './context/CartContext'
import { CartDrawer } from './components/cart/CartDrawer'

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <CartDrawer />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/mis-pedidos" element={<MyOrdersPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App