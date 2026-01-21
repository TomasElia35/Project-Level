import React, { useState } from 'react';
import { 
    Card, CardActionArea, CardContent, Typography, Box, IconButton, 
    Menu, MenuItem, ListItemIcon, Chip, useTheme
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen'; 
import Inventory2Icon from '@mui/icons-material/Inventory2'; 
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const UbicacionCard = ({ item, onClick, onEdit, onDelete, selected }) => {
    const esItem = item.tipo === 'ITEM';
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    // Funciones del menú
    const handleMenuClick = (event) => {
        // Detenemos la propagación por si acaso, aunque ya no estén anidados
        event.stopPropagation(); 
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => setAnchorEl(null);
    const handleAction = (action) => { handleMenuClose(); if(action) action(item); };

    return (
        <Card 
            elevation={selected ? 4 : 1}
            sx={{ 
                height: 140, 
                width: '100%', 
                position: 'relative', // Necesario para el posicionamiento absoluto del menú
                borderRadius: 3,
                border: '1px solid',
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: selected ? '#eff6ff' : 'white',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-3px)', boxShadow: 2 }
            }}
        >
            {/* 1. ÁREA CLICKEABLE (Ocupa toda la tarjeta excepto el menú) */}
            <CardActionArea 
                onClick={() => onClick(item)} 
                sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'stretch', 
                    justifyContent: 'flex-start', 
                    p: 2 
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    {/* Icono Principal */}
                    <Box sx={{ 
                        p: 1, borderRadius: 2, 
                        bgcolor: esItem ? '#ecfdf5' : '#eff6ff', 
                        color: esItem ? '#10b981' : '#3b82f6', display: 'flex' 
                    }}>
                        {esItem ? <Inventory2Icon /> : <FolderOpenIcon />}
                    </Box>
                    
                    {/* Espacio vacío para compensar el botón absoluto y que el texto no se monte */}
                    <Box sx={{ width: 30 }} />
                </Box>

                <CardContent sx={{ p: 0, flexGrow: 1 }}>
                    <Typography variant="subtitle1" fontWeight="600" noWrap sx={{ mb: 0.5 }}>
                        {item.nombre}
                    </Typography>
                    <Chip 
                        label={esItem ? 'Producto' : 'Nivel'} 
                        size="small" 
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.65rem', borderColor: 'divider' }} 
                    />
                </CardContent>
            </CardActionArea>

            {/* 2. BOTÓN DE MENÚ (ABSOLUTO - Fuera del click principal) */}
            {(onEdit || onDelete) && (
                <IconButton 
                    size="small" 
                    onClick={handleMenuClick} 
                    sx={{ 
                        position: 'absolute', 
                        top: 12, 
                        right: 12, 
                        color: 'text.secondary',
                        zIndex: 10, // Asegura que quede encima
                        bgcolor: 'rgba(255,255,255,0.5)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
                    }}
                >
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            )}

            {/* Menú Desplegable */}
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} PaperProps={{ sx: { borderRadius: 2 } }}>
                <MenuItem onClick={() => handleAction(onEdit)}><ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon> Renombrar</MenuItem>
                <MenuItem onClick={() => handleAction(onDelete)} sx={{ color: 'error.main' }}><ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon> Eliminar</MenuItem>
            </Menu>
        </Card>
    );
};

export default UbicacionCard;