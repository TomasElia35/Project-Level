import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { UbicacionService } from '../services/api';
import UbicacionCard from '../components/UbicacionCard';
import { useAuth } from '../auth/context/AuthContext';

import { 
    Typography, Breadcrumbs, Link, Box, 
    CircularProgress, Grid, TextField, InputAdornment, 
    Stack, Chip, Fade, Paper, IconButton, AppBar, Toolbar, Button
} from '@mui/material';

// Iconos
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 
import LogoutIcon from '@mui/icons-material/Logout';
import MapIcon from '@mui/icons-material/Map';

// 1. Tema (Igual al Admin para consistencia)
const modernTheme = createTheme({
    palette: {
        primary: { main: '#3b82f6' },
        secondary: { main: '#64748b' },
        background: { default: '#f8fafc', paper: '#ffffff' },
        text: { primary: '#1e293b', secondary: '#64748b' }
    },
    shape: { borderRadius: 12 },
});

const UserDashboard = () => {
    const { logout, user } = useAuth(); // Para mostrar nombre y salir

    // --- ESTADOS ---
    const [ruta, setRuta] = useState([]); 
    const [itemsActuales, setItemsActuales] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // UI Panels
    const [panelDerechoOpen, setPanelDerechoOpen] = useState(true); 
    const [itemSeleccionado, setItemSeleccionado] = useState(null); 
    const [detalleItem, setDetalleItem] = useState(null); 
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    
    // Zoom Imagen
    const [zoomImagen, setZoomImagen] = useState(null);

    // Filtros
    const [busqueda, setBusqueda] = useState("");

    const padreActual = ruta.length > 0 ? ruta[ruta.length - 1] : null;

    // --- CARGA DE DATOS ---
    const cargarUbicaciones = useCallback(async () => {
        setLoading(true);
        try {
            const padreId = padreActual ? padreActual.id : null;
            const res = await UbicacionService.listar(padreId);
            setItemsActuales(res.data);
        } catch (error) { 
            console.error(error); 
        } finally { 
            setLoading(false); 
        }
    }, [padreActual]);

    useEffect(() => { cargarUbicaciones(); }, [cargarUbicaciones]);

    // --- NAVEGACIÓN ---
    const handleItemClick = (item) => {
        if (item.tipo === 'CARPETA') {
            setRuta([...ruta, item]);
            setItemSeleccionado(null);
            setDetalleItem(null);
        } else {
            // Es un ITEM: Mostrar detalle
            setItemSeleccionado(item);
            setPanelDerechoOpen(true); 
            cargarDetalleItem(item.id);
        }
    };

    const cargarDetalleItem = async (id) => {
        setLoadingDetalle(true);
        try {
            const res = await UbicacionService.verHistorial(id);
            if (res.data && res.data.length > 0) {
                setDetalleItem(res.data[0]); // El más reciente
            } else {
                setDetalleItem(null);
            }
        } catch (error) { 
            console.error(error); 
        } finally { 
            setLoadingDetalle(false); 
        }
    };

    const handleBreadcrumbClick = (index) => {
        if (index === -1) setRuta([]);
        else setRuta(ruta.slice(0, index + 1));
        setItemSeleccionado(null);
        setDetalleItem(null);
    };

    const itemsFiltrados = itemsActuales.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase()));

    // --- RENDER ---
    return (
        <ThemeProvider theme={modernTheme}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
                
                {/* HEADER (Simplificado para Usuario) */}
                <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white', zIndex: 1201 }}>
                    <Toolbar variant="dense">
                        <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" color="text.primary" sx={{ flexGrow: 1 }}>
                            Portal Hergo
                        </Typography>
                        
                        <Stack direction="row" spacing={2} alignItems="center">

                            <Button onClick={logout} color="inherit" size="small" endIcon={<LogoutIcon />}>
                                Salir
                            </Button>
                        </Stack>
                    </Toolbar>
                </AppBar>

                {/* CONTENEDOR PRINCIPAL */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
                    
                    {/* === 1. PANEL IZQUIERDO (LISTA) === */}
                    <Box sx={{ 
                        flex: { xs: itemSeleccionado ? 'none' : '1', md: 'none' },
                        width: { xs: '100%', md: panelDerechoOpen ? '400px' : '100%' },
                        display: { xs: itemSeleccionado ? 'none' : 'flex', md: 'flex' },
                        flexDirection: 'column',
                        borderRight: '1px solid', borderColor: 'divider',
                        bgcolor: 'white', position: 'relative',
                        order: { xs: 2, md: 1 }
                    }}>
                        {/* Barra Navegación */}
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1 }}>
                                <Link component="button" onClick={() => handleBreadcrumbClick(-1)} underline="hover" color={ruta.length === 0 ? 'primary' : 'inherit'}>Inicio</Link>
                                {ruta.map((item, index) => (
                                    <Link key={item.id} component="button" onClick={() => handleBreadcrumbClick(index)} underline="hover" color={index === ruta.length -1 ? 'primary' : 'inherit'}>{item.nombre}</Link>
                                ))}
                            </Breadcrumbs>

                            <TextField 
                                size="small" 
                                placeholder="Buscar..." 
                                fullWidth 
                                value={busqueda} 
                                onChange={(e) => setBusqueda(e.target.value)} 
                                InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small"/></InputAdornment>) }} 
                            />
                        </Box>

                        {/* Lista Items */}
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: '#f8fafc' }}>
                            {loading ? <Box display="flex" justifyContent="center"><CircularProgress /></Box> : (
                                <Grid container spacing={2}>
                                    {itemsFiltrados.map((item) => (
                                        <Grid item xs={12} sm={6} md={12} lg={6} key={item.id}>
                                            <UbicacionCard 
                                                item={item} 
                                                selected={itemSeleccionado?.id === item.id}
                                                onClick={handleItemClick} 
                                                // SIN PROPS onEdit NI onDelete -> Modo Lectura
                                            />
                                        </Grid>
                                    ))}
                                    {itemsFiltrados.length === 0 && <Typography variant="body2" color="text.secondary" align="center" width="100%" mt={4}>Carpeta vacía</Typography>}
                                </Grid>
                            )}
                        </Box>
                        
                        {/* Toggle Panel Derecho */}
                        <Box sx={{ position: 'absolute', top: '50%', right: -15, zIndex: 10, display: { xs: 'none', md: 'block' } }}>
                            <IconButton onClick={() => setPanelDerechoOpen(!panelDerechoOpen)} sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', boxShadow: 2 }}>
                                {panelDerechoOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                            </IconButton>
                        </Box>
                    </Box>

                    {/* === 2. PANEL DERECHO (DETALLE / PLANO) === */}
                    <Box sx={{ 
                        flex: { xs: itemSeleccionado ? '1' : 'none', md: '1' },
                        height: { xs: itemSeleccionado ? '100%' : '250px', md: '100%' },
                        width: { xs: '100%', md: panelDerechoOpen ? 'auto' : '0' },
                        display: { xs: 'flex', md: panelDerechoOpen ? 'flex' : 'none' },
                        flexDirection: 'column', bgcolor: '#f1f5f9', overflow: 'hidden',
                        order: { xs: 1, md: 2 }, borderBottom: { xs: '1px solid #ddd', md: 'none' }
                    }}>
                        {itemSeleccionado ? (
                            // --- VISTA DETALLE (Solo Lectura) ---
                            <Box sx={{ p: 4, height: '100%', overflowY: 'auto', bgcolor: '#fff' }}>
                                <Fade in={true}>
                                    <Stack spacing={3} maxWidth="800px" mx="auto">
                                        <Box display="flex" alignItems="center" gap={1}>
                                            {/* Botón volver solo móvil */}
                                            <IconButton 
                                                onClick={() => setItemSeleccionado(null)} 
                                                sx={{ display: { xs: 'flex', md: 'none' }, border: '1px solid #ddd' }}
                                            >
                                                <ArrowBackIcon />
                                            </IconButton>
                                            
                                            <Box flexGrow={1}>
                                                <Typography variant="h5" fontWeight="bold" color="text.primary">{itemSeleccionado.nombre}</Typography>
                                                <Chip label="Producto" size="small" color="success" variant="outlined" sx={{ mt: 0.5 }} />
                                            </Box>
                                        </Box>

                                        {/* Imagen */}
                                        <Paper elevation={0} sx={{ p: 1, borderRadius: 2, border: '1px dashed', borderColor: 'divider', bgcolor: '#fafafa', display: 'flex', justifyContent: 'center' }}>
                                            {loadingDetalle ? (
                                                <Box p={5}><CircularProgress /></Box>
                                            ) : detalleItem && detalleItem.imagenUrl ? (
                                                <Box 
                                                    component="img" 
                                                    src={detalleItem.imagenUrl} 
                                                    // Habilitar Zoom al hacer clic
                                                    onClick={() => setZoomImagen(detalleItem.imagenUrl)}
                                                    sx={{ 
                                                        maxWidth: '100%', maxHeight: '450px', 
                                                        borderRadius: 1, cursor: 'zoom-in', objectFit: 'contain' 
                                                    }}
                                                />
                                            ) : (
                                                <Stack alignItems="center" p={5} color="text.secondary">
                                                    <ImageNotSupportedIcon sx={{ fontSize: 60, mb: 1, opacity: 0.3 }} />
                                                    <Typography variant="body1">Sin evidencia disponible</Typography>
                                                </Stack>
                                            )}
                                        </Paper>

                                        {/* Observación */}
                                        <Paper sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.primary">
                                                Observación Técnica:
                                            </Typography>
                                            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                                {detalleItem?.observacion || "Sin observaciones registradas."}
                                            </Typography>
                                            {detalleItem && (
                                                <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.disabled' }}>
                                                    Actualizado el: {new Date(detalleItem.fechaRegistro).toLocaleString()}
                                                </Typography>
                                            )}
                                        </Paper>
                                    </Stack>
                                </Fade>
                            </Box>
                        ) : (
                            // --- VISTA PLANO GENERAL ---
                            <Box sx={{ 
                                flexGrow: 1, height: '100%', width: '100%',
                                display: 'flex', flexDirection: 'column', 
                                bgcolor: '#e2e8f0', position: 'relative', overflow: 'hidden'
                            }}>

                                <Box 
                                    component="img"
                                    src="/planograma.jpg" 
                                    alt="Plano del Nivel"
                                    sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                                />
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Modal Zoom Imagen (Único modal necesario para el usuario) */}
            <Box 
                sx={{ 
                    display: zoomImagen ? 'flex' : 'none',
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    bgcolor: 'rgba(0,0,0,0.9)', zIndex: 1300,
                    alignItems: 'center', justifyContent: 'center'
                }}
                onClick={() => setZoomImagen(null)}
            >
                <IconButton onClick={() => setZoomImagen(null)} sx={{ position: 'absolute', top: 20, right: 20, color: 'white' }}>
                    <Typography variant="h6" sx={{ mr: 1 }}>CERRAR</Typography> X
                </IconButton>
                {zoomImagen && (
                    <img src={zoomImagen} alt="Full" style={{ maxHeight: '95vh', maxWidth: '95vw', objectFit: 'contain' }} />
                )}
            </Box>

        </ThemeProvider>
    );
};

export default UserDashboard;