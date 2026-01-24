import React from 'react';
import { AppBar, Toolbar, Typography, Stack, Chip, IconButton, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import LogoutIcon from '@mui/icons-material/Logout';

const Header = ({ usuario, rolLabel, onLogout }) => {
    return (
        <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white', zIndex: 1201 }}>
            <Toolbar variant="dense">
                <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" color="text.primary" sx={{ flexGrow: 1 }}>
                    Portal Hergo
                </Typography>
                
                {/* SOLUCIÓN AQUÍ: Usamos Stack row para alinear todo horizontalmente */}
                <Stack direction="row" spacing={1} alignItems="center">
                    
                    {/* Nombre y Rol */}
                    <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1 }}>
                        <Chip 
                            label={rolLabel} 
                            color={rolLabel === 'ADMINISTRADOR' ? "error" : "primary"} 
                            size="small" 
                            sx={{ height: 24, fontWeight: 'bold', fontSize: '0.7rem' }} 
                        />
                    </Box>

                    <IconButton onClick={onLogout} color="primary" title="Cerrar Sesión">
                        <LogoutIcon />
                    </IconButton>
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

export default Header;