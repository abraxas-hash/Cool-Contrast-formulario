import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { MotionConfig } from 'framer-motion';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import FixedProgramPage from './pages/FixedProgramPage.jsx';
import CustomTourPage from './pages/CustomTourPage.jsx';
import DemoBanner from './components/DemoBanner.jsx';

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? children : <Navigate to="/login" />;
};

function AppContent() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen relative">
            <DemoBanner />
            <Routes>
                <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
                <Route 
                    path="/dashboard" 
                    element={
                        <PrivateRoute>
                            <DashboardPage />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/cotizar/fijo" 
                    element={
                        <PrivateRoute>
                            <FixedProgramPage />
                        </PrivateRoute>
                    } 
                />
                <Route 
                    path="/cotizar/personalizado" 
                    element={
                        <PrivateRoute>
                            <PrivateRoute><CustomTourPage /></PrivateRoute>
                        </PrivateRoute>
                    } 
                />
                <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <AuthProvider>
            <Router>
                <MotionConfig reducedMotion="user">
                    <AppContent />
                </MotionConfig>
            </Router>
        </AuthProvider>
    );
}

export default App;
