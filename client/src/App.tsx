  import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
  import LandingPage from './pages/LandingPage';
  import Dashboard from './components/Dashboard';
  import Login from './components/Login';
  import ForgotPassword from './pages/ForgetPassword';
  import ResetPassword from './pages/ResetPassword';

  function App() {
    return (
      <Router>
        <Routes>
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Router>
    );
  }

  export default App;
