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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />
        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/perfil"
          element={<ProfilePage />}
        />

        <Route
          path="/menu"
          element={<MenuPage />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App