import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './auth/context/AuthContext';
import ProtectedRoutes from './auth/components/ProtectedRoutes';
import Login from './auth/components/Login';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';


//const AdminDashboard = () => console.log("Exito");
// const UserDashboard = () => <h1>Soy un Usuario 🙋‍♂️ <br/> (Aquí va el visor de planos simple)</h1>;
const Unauthorized = () => <h1>No tienes permiso para ver esto 🚫</h1>;

function App() {
    return (
        <AuthProvider> 
            <BrowserRouter>
                <Routes>
                    
                    <Route path="/login" element={<Login />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />

                    <Route element={<ProtectedRoutes allowedRoles={['ADMIN']} />}>
                        <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    </Route>

                    <Route element={<ProtectedRoutes allowedRoles={['USER']} />}>
                        <Route path="/user-dashboard" element={<UserDashboard />} />
                    </Route>

                    <Route path="*" element={<Navigate to="/login" />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;