import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { UbicacionService } from './services/api';
import UbicacionCard from './components/UbicacionCard';

import { 
    Typography, Breadcrumbs, Link, Box, 
    Button, CircularProgress, Grid, Dialog, DialogTitle, DialogContent, 
    TextField, DialogActions, FormControl, InputLabel, Select, MenuItem, 
    IconButton, InputAdornment, Stack, Chip, Fade, Paper, Switch, FormControlLabel,
    Snackbar, Alert, AppBar, Toolbar
} from '@mui/material';

// Iconos
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import ArrowBackIcon from '@mui/icons-material/ArrowBack'; 

// --- TEMA MODERNO ---
const modernTheme = createTheme({
    palette: {
        primary: { main: '#3b82f6' },
        secondary: { main: '#64748b' },
        background: { default: '#f8fafc', paper: '#ffffff' },
        text: { primary: '#1e293b', secondary: '#64748b' }
    },
    typography: {
        fontFamily: "'Inter', sans-serif",
        h6: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 600 }
    },
    shape: { borderRadius: 12 },
});

function App() {
    // --- ESTADOS ---
    const [ruta, setRuta] = useState([]); 
    const [itemsActuales, setItemsActuales] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false); 

    // --- ESTADOS UI ---
    const [panelDerechoOpen, setPanelDerechoOpen] = useState(true); 
    const [itemSeleccionado, setItemSeleccionado] = useState(null); 
    const [detalleItem, setDetalleItem] = useState(null); 
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    
    // --- MODALES ---
    const [openCrear, setOpenCrear] = useState(false);
    const [openEditarNombre, setOpenEditarNombre] = useState(false);
    const [openGestionarEvidencia, setOpenGestionarEvidencia] = useState(false);
    const [zoomImagen, setZoomImagen] = useState(null);

    // Datos forms
    const [nombreForm, setNombreForm] = useState("");
    const [tipoForm, setTipoForm] = useState("CARPETA");
    const [itemAEditar, setItemAEditar] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [nuevaObs, setNuevaObs] = useState('');

    const [toast, setToast] = useState({ open: false, msg: '', type: 'info' });
    const showToast = (msg, type = 'success') => setToast({ open: true, msg, type });
    const closeToast = () => setToast({ ...toast, open: false });

    const padreActual = ruta.length > 0 ? ruta[ruta.length - 1] : null;

    // --- CARGA DE DATOS ---
    const cargarUbicaciones = useCallback(async () => {
        setLoading(true);
        try {
            const padreId = padreActual ? padreActual.id : null;
            const res = await UbicacionService.listar(padreId);
            setItemsActuales(res.data);
        } catch (error) { 
            console.error("Error:", error);
            showToast("Error al cargar datos", "error");
        } finally { setLoading(false); }
    }, [padreActual]);

    useEffect(() => { cargarUbicaciones(); }, [cargarUbicaciones]);

    // --- NAVEGACIÓN ---
    const handleItemClick = (item) => {
        if (item.tipo === 'CARPETA') {
            setRuta([...ruta, item]);
            setItemSeleccionado(null);
            setDetalleItem(null);
        } else {
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
                setDetalleItem(res.data[0]); 
                setNuevaObs(res.data[0].observacion || "");
            } else {
                setDetalleItem(null);
                setNuevaObs("");
            }
        } catch (error) { console.error(error); showToast("Error cargando detalle", "error"); } 
        finally { setLoadingDetalle(false); }
    };

    const handleBreadcrumbClick = (index) => {
        if (index === -1) setRuta([]);
        else setRuta(ruta.slice(0, index + 1));
        setItemSeleccionado(null);
        setDetalleItem(null);
    };

    // --- ACCIONES ADMIN ---
    const handleGuardarCrear = async () => { 
        if (!nombreForm.trim()) return showToast("Nombre requerido", "warning");
        try { 
            await UbicacionService.crear(nombreForm, padreActual?.id, tipoForm); 
            setOpenCrear(false); cargarUbicaciones(); showToast("Creado correctamente");
        } catch (e) { console.error(e); showToast("Error al crear", "error"); }
    };

    const handleGuardarEditarNombre = async () => { 
        if (!itemAEditar || !nombreForm.trim()) return;
        try { 
            await UbicacionService.actualizar(itemAEditar.id, nombreForm); 
            setOpenEditarNombre(false); cargarUbicaciones(); showToast("Nombre actualizado");
        } catch (e) { console.error(e); showToast("Error al actualizar", "error"); }
    };

    const handleEliminar = async (item) => { 
        try { 
            await UbicacionService.eliminar(item.id); 
            cargarUbicaciones(); 
            if(itemSeleccionado?.id === item.id) { setItemSeleccionado(null); setDetalleItem(null); }
            showToast("Eliminado");
        } catch(e) { console.error(e); showToast("Error al eliminar", "error"); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { setArchivoSeleccionado(file); setPreviewUrl(URL.createObjectURL(file)); }
    };

    const handleGuardarEvidencia = async () => {
        if (!itemSeleccionado) return;
        if (!archivoSeleccionado && !nuevaObs.trim()) return showToast("Falta foto u observación", "warning");
        try {
            await UbicacionService.agregarDetalle(itemSeleccionado.id, archivoSeleccionado, nuevaObs);
            setOpenGestionarEvidencia(false); setArchivoSeleccionado(null); setPreviewUrl('');
            cargarDetalleItem(itemSeleccionado.id); showToast("Evidencia guardada");
        } catch (error) { console.error(error); showToast("Error al guardar", "error"); }
    };

    const itemsFiltrados = itemsActuales.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase()));

    // --- RENDER ---
    return (
        <ThemeProvider theme={modernTheme}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
                
                {/* HEADER */}
                <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white', zIndex: 1201 }}>
                    <Toolbar variant="dense">
                        <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" color="text.primary" sx={{ flexGrow: 1 }}>
                            Portal Hergo
                        </Typography>
                        <FormControlLabel
                            control={<Switch checked={isAdmin} onChange={() => setIsAdmin(!isAdmin)} />}
                            label={<Chip label={isAdmin ? "ADMIN" : "USUARIO"} color={isAdmin ? "error" : "primary"} size="small" variant={isAdmin ? "filled" : "outlined"} />}
                        />
                    </Toolbar>
                </AppBar>

                {/* CONTENEDOR PRINCIPAL */}
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: { xs: 'column', md: 'row' }, 
                    flexGrow: 1, 
                    overflow: 'hidden', 
                    position: 'relative' 
                }}>
                    
                    {/* === 1. PANEL IZQUIERDO (LISTA) === */}
                    <Box sx={{ 
                        flex: { xs: itemSeleccionado ? 'none' : '1', md: 'none' },
                        width: { xs: '100%', md: panelDerechoOpen ? '400px' : '100%' },
                        display: { xs: itemSeleccionado ? 'none' : 'flex', md: 'flex' }, 
                        flexDirection: 'column',
                        borderRight: '1px solid', borderColor: 'divider',
                        bgcolor: 'white', 
                        transition: 'width 0.3s ease',
                        position: 'relative',
                        order: { xs: 2, md: 1 } // LISTA abajo en móvil
                    }}>
                        {/* Header Lista */}
                        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
                            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1 }}>
                                <Link component="button" onClick={() => handleBreadcrumbClick(-1)} underline="hover" color={ruta.length === 0 ? 'primary' : 'inherit'}>Inicio</Link>
                                {ruta.map((item, index) => (
                                    <Link key={item.id} component="button" onClick={() => handleBreadcrumbClick(index)} underline="hover" color={index === ruta.length -1 ? 'primary' : 'inherit'}>{item.nombre}</Link>
                                ))}
                            </Breadcrumbs>
                            <Stack direction="row" spacing={1}>
                                <TextField size="small" placeholder="Buscar..." fullWidth value={busqueda} onChange={(e) => setBusqueda(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small"/></InputAdornment>) }} />
                                {isAdmin && <Button variant="contained" size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => { setNombreForm(""); setTipoForm("CARPETA"); setOpenCrear(true); }} sx={{ minWidth: '90px' }}>Crear</Button>}
                            </Stack>
                        </Box>

                        {/* Contenido Lista */}
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: '#f8fafc' }}>
                            {loading ? <Box display="flex" justifyContent="center"><CircularProgress /></Box> : (
                                <Grid container spacing={2}>
                                    {itemsFiltrados.map((item) => (
                                        <Grid item xs={12} sm={6} md={12} lg={6} key={item.id}>
                                            <UbicacionCard 
                                                item={item} 
                                                selected={itemSeleccionado?.id === item.id}
                                                onClick={handleItemClick} 
                                                onEdit={isAdmin ? (i) => { setItemAEditar(i); setNombreForm(i.nombre); setOpenEditarNombre(true); } : null}
                                                onDelete={isAdmin ? handleEliminar : null}
                                            />
                                        </Grid>
                                    ))}
                                    {itemsFiltrados.length === 0 && <Typography variant="body2" color="text.secondary" align="center" width="100%" mt={4}>Carpeta vacía</Typography>}
                                </Grid>
                            )}
                        </Box>
                        
                        {/* Toggle Escritorio */}
                        <Box sx={{ position: 'absolute', top: '50%', right: -15, zIndex: 10, display: { xs: 'none', md: 'block' } }}>
                            <IconButton onClick={() => setPanelDerechoOpen(!panelDerechoOpen)} sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'divider', boxShadow: 2, '&:hover': { bgcolor: '#f1f5f9' } }}>
                                {panelDerechoOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                            </IconButton>
                        </Box>
                    </Box>

                    {/* === 2. PANEL DERECHO (PLANO / DETALLE) === */}
                    <Box sx={{ 
                        flex: { xs: itemSeleccionado ? '1' : 'none', md: '1' },
                        // Aquí está la clave: Altura dinámica en móvil
                        height: { xs: itemSeleccionado ? '100%' : '250px', md: '100%' }, 
                        width: { xs: '100%', md: panelDerechoOpen ? 'auto' : '0' },
                        display: { xs: 'flex', md: panelDerechoOpen ? 'flex' : 'none' }, 
                        flexDirection: 'column', bgcolor: '#f1f5f9',
                        transition: 'all 0.3s ease', overflow: 'hidden',
                        order: { xs: 1, md: 2 }, // PLANO/DETALLE arriba en móvil
                        borderBottom: { xs: '1px solid #ddd', md: 'none' }
                    }}>
                        {itemSeleccionado ? (
                            // === A) VISTA DETALLE ITEM ===
                            <Box sx={{ p: 4, height: '100%', overflowY: 'auto', bgcolor: '#fff' }}>
                                <Fade in={true}>
                                    <Stack spacing={3} maxWidth="800px" mx="auto">
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <IconButton onClick={() => setItemSeleccionado(null)} sx={{ display: { xs: 'flex', md: 'none' }, border: '1px solid #ddd', bgcolor: 'white' }}>
                                                <ArrowBackIcon />
                                            </IconButton>
                                            <Box flexGrow={1}>
                                                <Typography variant="h5" fontWeight="bold" color="text.primary">{itemSeleccionado.nombre}</Typography>
                                                <Chip label="Producto" size="small" color="success" variant="outlined" sx={{ mt: 0.5 }} />
                                            </Box>
                                            {isAdmin && <Button variant="contained" color="secondary" size="small" startIcon={<EditIcon />} onClick={() => setOpenGestionarEvidencia(true)}>Evidencia</Button>}
                                        </Box>
                                        
                                        <Paper elevation={0} sx={{ p: 1, borderRadius: 2, border: '1px dashed', borderColor: 'divider', bgcolor: '#fafafa', display: 'flex', justifyContent: 'center', position: 'relative' }}>
                                            {loadingDetalle ? <Box p={5}><CircularProgress /></Box> : detalleItem && detalleItem.imagenUrl ? 
                                                <Box component="img" src={detalleItem.imagenUrl} onClick={() => setZoomImagen(detalleItem.imagenUrl)} sx={{ maxWidth: '100%', maxHeight: '450px', borderRadius: 1, cursor: 'zoom-in', objectFit: 'contain' }} /> 
                                                : <Stack alignItems="center" p={5} color="text.secondary"><ImageNotSupportedIcon sx={{ fontSize: 60, mb: 1, opacity: 0.3 }} /><Typography variant="body1">Sin evidencia</Typography></Stack>
                                            }
                                        </Paper>
                                        
                                        <Paper sx={{ p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="text.primary">Observación Técnica:</Typography>
                                            <Typography variant="body1" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>{detalleItem?.observacion || "Sin observaciones."}</Typography>
                                        </Paper>
                                    </Stack>
                                </Fade>
                            </Box>
                        ) : (
                            // === B) VISTA PLANO COMPLETO (CORREGIDA) ===
                            <Box sx={{ 
                                flexGrow: 1, 
                                height: '100%', 
                                width: '100%',
                                display: 'flex', 
                                flexDirection: 'column', 
                                overflow: 'hidden', // Evita scrollbars
                                bgcolor: '#e2e8f0', // Fondo gris de contraste
                                position: 'relative'
                            }}>
                                {/* Etiqueta Flotante Opcional */}
                                <Box sx={{ 
                                    position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', 
                                    zIndex: 10, bgcolor: 'rgba(255,255,255,0.9)',
                                    px: 2, py: 0.5, borderRadius: 4, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                }}>
                                </Box>

                                {/* IMAGEN FULL SIZE */}
                                <Box 
                                    component="img"
                                    src="/planograma.jpg" // Asegúrate que la imagen está en la carpeta 'public'
                                    alt="Plano del Nivel"
                                    sx={{ 
                                        width: '100%', 
                                        height: '100%', 
                                        objectFit: 'contain', // Se ajusta para verse completa
                                        display: 'block'
                                    }}
                                />
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* --- MODALES --- */}
            <Dialog open={openCrear} onClose={() => setOpenCrear(false)} fullWidth maxWidth="xs">
                <DialogTitle>Nuevo Elemento</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Nombre" fullWidth value={nombreForm} onChange={(e) => setNombreForm(e.target.value)} />
                    <FormControl fullWidth margin="dense"><InputLabel>Tipo</InputLabel><Select value={tipoForm} onChange={(e) => setTipoForm(e.target.value)} label="Tipo"><MenuItem value="CARPETA">📁 Carpeta</MenuItem><MenuItem value="ITEM">📦 Producto</MenuItem></Select></FormControl>
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenCrear(false)}>Cancelar</Button><Button variant="contained" onClick={handleGuardarCrear}>Crear</Button></DialogActions>
            </Dialog>
            
            <Dialog open={openEditarNombre} onClose={() => setOpenEditarNombre(false)} fullWidth maxWidth="xs">
                <DialogTitle>Renombrar</DialogTitle>
                <DialogContent><TextField autoFocus margin="dense" label="Nombre" fullWidth value={nombreForm} onChange={(e) => setNombreForm(e.target.value)} /></DialogContent>
                <DialogActions><Button onClick={() => setOpenEditarNombre(false)}>Cancelar</Button><Button variant="contained" onClick={handleGuardarEditarNombre}>Guardar</Button></DialogActions>
            </Dialog>

            <Dialog open={openGestionarEvidencia} onClose={() => setOpenGestionarEvidencia(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontWeight: 'bold' }}>Actualizar Evidencia</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} py={1}>
                        <Button component="label" variant="outlined" fullWidth startIcon={<CloudUploadIcon />} sx={{ height: 60, borderStyle: 'dashed' }}>
                            {archivoSeleccionado ? "Foto Seleccionada" : "Subir Foto"}
                            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                        </Button>
                        {(previewUrl || (detalleItem && detalleItem.imagenUrl)) && (
                            <Box sx={{ height: 200, bgcolor: '#f1f5f9', display: 'flex', justifyContent: 'center', borderRadius: 2, overflow: 'hidden' }}>
                                <img src={previewUrl || detalleItem.imagenUrl} alt="Preview" style={{ height: '100%', objectFit: 'contain' }} />
                            </Box>
                        )}
                        <TextField label="Observación" multiline rows={3} fullWidth value={nuevaObs} onChange={(e) => setNuevaObs(e.target.value)} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenGestionarEvidencia(false)} color="inherit">Cancelar</Button>
                    <Button onClick={handleGuardarEvidencia} variant="contained" startIcon={<SaveIcon />}>Guardar Cambios</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={Boolean(zoomImagen)} onClose={() => setZoomImagen(null)} maxWidth="xl">
                <Box sx={{ position: 'relative', bgcolor: 'black' }}>
                    <IconButton onClick={() => setZoomImagen(null)} sx={{ position: 'absolute', top: 10, right: 10, color: 'white', bgcolor: 'rgba(0,0,0,0.5)' }}>X</IconButton>
                    <img src={zoomImagen} alt="Full" style={{ maxHeight: '90vh', maxWidth: '100vw', display: 'block' }} />
                </Box>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={closeToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={closeToast} severity={toast.type} sx={{ width: '100%' }}>{toast.msg}</Alert>
            </Snackbar>
        </ThemeProvider>
    );
}

export default App;