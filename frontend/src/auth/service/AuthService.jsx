import { Token } from "@mui/icons-material";

export const AuthService = {

    /*
    *Harcodeamos el login para simular la autenticación
    */
    login: async (username, password) => {
        return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if(username === 'admin' && password === 'admin') {
                        resolve({
                            id: 1,
                            username: 'admin',
                            role: 'ADMIN',
                            Token: 'fake-jwt-token-admin'
                        });
                    }else if(username === 'user' && password === 'user') {
                        resolve({
                            id: 2,
                            username: 'user',
                            role: 'USER',
                            Token:'fake-jwt-token-user'
                        });
                    } else {
                            reject(new Error('Credenciales inválidas'));
                        }
                }, 1000); 
        });
    },
    logout: () => {
    }
};
