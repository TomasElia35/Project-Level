// src/components/UbicacionCard.jsx
import React, { useState } from 'react';
import { 
    Card, CardActionArea, CardContent, Typography, Box, IconButton, 
    Menu, MenuItem, ListItemIcon, Chip, Tooltip, useTheme
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen'; // Icono Carpeta
import Inventory2Icon from '@mui/icons-material/Inventory2'; // Icono Producto/Item
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const UbicacionCard = ({ item, onClick, onEdit, onDelete }) => {
    const theme = useTheme();
    const esItem = item.tipo === 'ITEM';
    
    // Estado menú
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        event.stopPropagation(); 
        setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => setAnchorEl(null);
    const handleAction = (action) => { handleMenuClose(); action(item); };

    return (
        <Card 
            elevation={0} // Quitamos la sombra por defecto de MUI para poner la nuestra
            sx={{ 
                height: 160, 
                width: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                position: 'relative',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'white',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.1)',
                    borderColor: esItem ? 'success.light' : 'primary.light'
                }
            }}
        >
            <CardActionArea 
                onClick={() => onClick(item)} 
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', p: 2 }}
            >
                {/* Header de la Card: Icono y Menú */}
                <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ 
                        p: 1, 
                        borderRadius: 2, 
                        bgcolor: esItem ? '#ecfdf5' : '#eff6ff', // Fondos sutiles (Verde/Azul)
                        color: esItem ? '#10b981' : '#3b82f6',   // Iconos (Verde/Azul)
                        display: 'flex' 
                    }}>
                        {esItem ? <Inventory2Icon /> : <FolderOpenIcon />}
                    </Box>
                    
                    <IconButton size="small" onClick={handleMenuClick} sx={{ color: 'text.secondary' }}>
                        <MoreVertIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* Contenido: Nombre */}
                <CardContent sx={{ p: 0, width: '100%', flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ 
                        fontWeight: 600, 
                        color: 'text.primary',
                        lineHeight: 1.2,
                        mb: 0.5,
                        display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2
                    }}>
                        {item.nombre}
                    </Typography>

                    {/* Chip sutil para identificar tipo */}
                    <Chip 
                        label={esItem ? 'Producto' : 'Carpeta'} 
                        size="small" 
                        sx={{ 
                            height: 20, 
                            fontSize: '0.65rem', 
                            bgcolor: 'transparent',
                            color: 'text.secondary',
                            border: '1px solid',
                            borderColor: 'divider'
                        }} 
                    />
                </CardContent>

                {/* Footer: Indicador de observación si existe */}
                {esItem && item.ultimaObservacion && (
                     <Typography variant="caption" sx={{ 
                        color: 'text.secondary', 
                        fontSize: '0.7rem',
                        mt: 'auto',
                        fontStyle: 'italic',
                        display: 'block',
                        maxWidth: '100%',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                     }}>
                        Obs: {item.ultimaObservacion}
                     </Typography>
                )}
            </CardActionArea>

            {/* Menú Flotante */}
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} PaperProps={{ sx: { borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' } }}>
                <MenuItem onClick={() => handleAction(onEdit)}>
                    <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon> Renombrar
                </MenuItem>
                <MenuItem onClick={() => handleAction(onDelete)} sx={{ color: 'error.main' }}>
                    <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon> Eliminar
                </MenuItem>
            </Menu>
        </Card>
    );
};

export default UbicacionCard;