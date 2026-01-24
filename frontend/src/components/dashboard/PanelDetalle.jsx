import React from 'react';
// 1. AGREGAMOS TOOLTIP A LOS IMPORTS
import { Box, Typography, Button, IconButton, Paper, Stack, Chip, Fade, CircularProgress, Tooltip } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
// 2. AGREGAMOS LOS ICONOS DE NAVEGACIÓN
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'; 
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const PanelDetalle = ({ 
    itemSeleccionado, detalleItem, loadingDetalle, 
    onClose, onEvidencia, onZoom,
    onAnterior,   // Recibimos la función
    onSiguiente,  // Recibimos la función
    hayAnterior,  // True/False
    haySiguiente  // True/False
}) => {
    
    // CASO A: No hay nada seleccionado -> Mostrar Plano General
    if (!itemSeleccionado) {
        return (
            <Box sx={{ flexGrow: 1, height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#e2e8f0', position: 'relative', overflow: 'hidden' }}>
                <Box component="img" src="/planograma.jpg" alt="Plano" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </Box>
        );
    }

    // CASO B: Hay ítem seleccionado -> Mostrar Detalle
    return (
        <Box sx={{ p: 4, height: '100%', overflowY: 'auto', bgcolor: '#fff' }}>
            <Fade in={true}>
                <Stack spacing={3} maxWidth="800px" mx="auto">
                    
                    {/* --- BARRA SUPERIOR (HEADER) --- */}
                    <Box display="flex" alignItems="center" gap={1}>
                        <IconButton onClick={onClose} sx={{ display: { xs: 'flex', md: 'none' }, border: '1px solid #ddd' }}><ArrowBackIcon /></IconButton>
                        
                        <Box flexGrow={1}>
                            <Typography variant="h5" fontWeight="bold" color="text.primary">{itemSeleccionado.nombre}</Typography>
                            <Chip label="Producto" size="small" color="success" variant="outlined" sx={{ mt: 0.5 }} />
                        </Box>

                        {/* 3. AQUÍ AGREGAMOS LOS BOTONES DE NAVEGACIÓN */}
                        <Stack direction="row" spacing={1} mr={1}>
                            <Tooltip title="Anterior">
                                {/* El span es necesario para que el Tooltip funcione si el botón está deshabilitado */}
                                <span> 
                                    <IconButton 
                                        onClick={onAnterior} 
                                        disabled={!hayAnterior} 
                                        size="small" 
                                        sx={{ border: '1px solid #ddd', bgcolor: '#f8fafc' }}
                                    >
                                        <ArrowBackIosIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            <Tooltip title="Siguiente">
                                <span>
                                    <IconButton 
                                        onClick={onSiguiente} 
                                        disabled={!haySiguiente} 
                                        size="small" 
                                        sx={{ border: '1px solid #ddd', bgcolor: '#f8fafc' }}
                                    >
                                        <ArrowForwardIosIcon fontSize="small" />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Stack>
                        {/* ----------------------------------------------- */}

                        {onEvidencia && (
                            <Button variant="contained" color="secondary" size="small" startIcon={<EditIcon />} onClick={onEvidencia}>
                                Evidencia
                            </Button>
                        )}
                    </Box>

                    <Paper elevation={0} sx={{ p: 1, border: '1px dashed #ddd', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                        {loadingDetalle ? <CircularProgress /> : detalleItem && detalleItem.imagenUrl ? 
                            <Box component="img" src={detalleItem.imagenUrl} onClick={() => onZoom(detalleItem.imagenUrl)} sx={{ maxWidth: '100%', maxHeight: '450px', cursor: 'zoom-in', objectFit: 'contain' }} /> 
                            : <Stack alignItems="center" p={5} color="text.secondary"><ImageNotSupportedIcon sx={{ fontSize: 60 }} /><Typography>Sin evidencia</Typography></Stack>
                        }
                    </Paper>

                    <Paper sx={{ p: 3, bgcolor: '#f8fafc' }}>
                        <Typography variant="subtitle2" fontWeight="bold">Observación Técnica:</Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                            {detalleItem?.observacion || "Sin observaciones."}
                        </Typography>
                    </Paper>
                </Stack>
            </Fade>
        </Box>
    );
};

export default PanelDetalle;