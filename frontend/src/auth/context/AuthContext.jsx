import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthService } from '../service/AuthService';

const authContext = createContext(null);


export const AuthProvider = ({ children }) => {

    /*
    * Estado
    */
    const[user, setUser] = useState(null);
    const[loading, setLoading] = useState(true);

    /*
    * Persistencia de sesión
    */
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if(storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const userData = await AuthService.login(username, password);
        setUser(userData);
        localStorage.setItem('user_session', JSON.stringify(userData));
        return userData;    
    }; 

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user_session');
        AuthService.logout();
    };

    return (
        <authContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user}}>
            {children}
        </authContext.Provider>
    );
};

/*
* Hook personalizado para usar el contexto de autenticación
*/
export const useAuth = () => useContext(authContext);