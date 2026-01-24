import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Paper, TextField, Button, Typography, Alert, CircularProgress} from '@mui/material';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try{
            const user = await login(username,password);
            if(user.role === 'ADMIN'){
                navigate('/admin-dashboard');
            } else {
                navigate('/user-dashboard');
            }
        }catch(error){
            setError(error.message);
        }finally{
            setLoading(false);
        }
    };
    
return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
            <Paper elevation={3} sx={{ p: 4, width: 350 }}>
                <Typography variant="h5" align="center" gutterBottom fontWeight="bold">Portal Hergo</Typography>
                <form onSubmit={handleSubmit}>
                    <TextField 
                        label="Usuario" fullWidth margin="normal" 
                        value={username} onChange={(e) => setUsername(e.target.value)} 
                    />
                    <TextField 
                        label="Contraseña" type="password" fullWidth margin="normal" 
                        value={password} onChange={(e) => setPassword(e.target.value)} 
                    />
                    {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
                    <Button 
                        type="submit" variant="contained" fullWidth sx={{ mt: 3 }} 
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Ingresar'}
                    </Button>
                </form>
                <Typography variant="caption" display="block" align="center" sx={{ mt: 2, color: 'text.secondary' }}>
                    Prueba: admin/admin o user/user
                </Typography>
            </Paper>
        </Box>
    );
};
        
export default Login;