import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoutes = ({ allowedRoles}) => {
    const {user, isAuthenticated, loading} = useAuth();


    console.log("ProtectedRoutes -> User:", user); 
    console.log("ProtectedRoutes -> IsAuth:", isAuthenticated);
    console.log("ProtectedRoutes -> Loading:", loading);


    if(loading){
        return <div>Cargando...</div>;
    }

    /*
    * Proteccion de rutas
    */

    if(!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if(allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" />;
    }

    return <Outlet />;
};

export default ProtectedRoutes;


