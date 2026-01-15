import React, { useState } from 'react';
import { 
    Card, CardActionArea, CardContent, Typography, Box, IconButton, 
    Menu, MenuItem, ListItemIcon, CardMedia, Chip, Tooltip, useTheme
} from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const UbicacionCard = ({ item, onClick, onEdit, onDelete }) => {
    const theme = useTheme(); // Accedemos a los colores del tema
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
        <Card sx={{ 
            height: 380, width: '100%', display: 'flex', flexDirection: 'column',
            position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            // Si es carpeta, borde superior amarillo/ambar. Si es item, azul.
            borderTop: `4px solid ${esItem ? theme.palette.success.main : theme.palette.warning.main}`,
            '&:hover': { transform: 'translateY(-8px)', boxShadow: theme.shadows[8] },
        }}>
            
            {/* Botón de opciones más discreto */}
            <IconButton 
                size="small" onClick={handleMenuClick}
                sx={{ position: 'absolute', top: 8, right: 8, zIndex: 10, bgcolor: 'rgba(255,255,255,0.9)' }}
            >
                <MoreVertIcon fontSize="small" />
            </IconButton>

            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose} PaperProps={{ sx: { boxShadow: 3 } }}>
                <MenuItem onClick={() => handleAction(onEdit)}>
                    <ListItemIcon><EditOutlinedIcon fontSize="small" /></ListItemIcon> Renombrar
                </MenuItem>
                <MenuItem onClick={() => handleAction(onDelete)} sx={{ color: 'error.main' }}>
                    <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon> Eliminar
                </MenuItem>
            </Menu>

            <CardActionArea 
                onClick={() => onClick(item)} 
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', justifyContent: 'flex-start' }}
            >
                {/* 1. SECCIÓN VISUAL (180px) */}
                <Box sx={{ 
                    height: 180, width: '100%', 
                    bgcolor: esItem ? '#fff' : '#f8fafc', // Fondo blanco para productos, gris para carpetas
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2
                }}>
                    {esItem && item.ultimaImagenUrl ? (
                        <CardMedia
                            component="img" image={item.ultimaImagenUrl} alt={item.nombre}
                            sx={{ objectFit: 'contain', width: '100%', height: '100%', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.1))' }}
                        />
                    ) : (
                        <Box sx={{ opacity: 0.8, color: esItem ? theme.palette.success.light : theme.palette.warning.light }}>
                            {esItem ? <Inventory2OutlinedIcon sx={{ fontSize: 80 }} /> : <FolderOpenIcon sx={{ fontSize: 80 }} />}
                        </Box>
                    )}
                </Box>

                {/* 2. SECCIÓN INFO */}
                <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 2.5 }}>
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                             <Chip 
                                label={esItem ? 'PRODUCTO' : 'SECCIÓN'} 
                                size="small" 
                                color={esItem ? 'success' : 'warning'} 
                                variant={esItem ? 'filled' : 'outlined'}
                                sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700 }}
                            />
                        </Box>
                        <Tooltip title={item.nombre}>
                            <Typography variant="subtitle1" sx={{ 
                                fontWeight: 700, lineHeight: 1.3, color: 'text.primary',
                                display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2
                            }}>
                                {item.nombre}
                            </Typography>
                        </Tooltip>
                    </Box>

                    {esItem ? (
                        <Box sx={{ 
                            mt: 2, p: 1.5, bgcolor: '#f1f5f9', borderRadius: 2, borderLeft: `4px solid ${theme.palette.secondary.main}`,
                            minHeight: 60, display: 'flex', alignItems: 'center'
                        }}>
                            <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary', display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                                {item.ultimaObservacion ? `"${item.ultimaObservacion}"` : "Sin observaciones registradas."}
                            </Typography>
                        </Box>
                    ) : <Box sx={{ minHeight: 60 }} />}
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

export default UbicacionCard;