import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { UbicacionService } from '../services/api'; // Ajusta la ruta si es necesario
import UbicacionCard from '../components/UbicacionCard';
import { useAuth } from '../auth/context/AuthContext'; // Para el botón de salir

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
import LogoutIcon from '@mui/icons-material/Logout';

// Tema
const modernTheme = createTheme({
    palette: {
        primary: { main: '#3b82f6' },
        secondary: { main: '#64748b' },
        background: { default: '#f8fafc', paper: '#ffffff' },
        text: { primary: '#1e293b', secondary: '#64748b' }
    },
    shape: { borderRadius: 12 },
});

const AdminDashboard = () => {
    // Auth Hook
    const { logout, user } = useAuth();

    // Estados de Datos
    const [ruta, setRuta] = useState([]); 
    const [itemsActuales, setItemsActuales] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // UI Panels
    const [panelDerechoOpen, setPanelDerechoOpen] = useState(true); 
    const [itemSeleccionado, setItemSeleccionado] = useState(null); 
    const [detalleItem, setDetalleItem] = useState(null); 
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    
    // Modales
    const [openCrear, setOpenCrear] = useState(false);
    const [openEditarNombre, setOpenEditarNombre] = useState(false);
    const [openGestionarEvidencia, setOpenGestionarEvidencia] = useState(false);
    const [zoomImagen, setZoomImagen] = useState(null);

    // Formularios
    const [nombreForm, setNombreForm] = useState("");
    const [tipoForm, setTipoForm] = useState("CARPETA");
    const [itemAEditar, setItemAEditar] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    
    // Evidencia
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [nuevaObs, setNuevaObs] = useState('');

    // Feedback
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
        } catch (error) { console.error(error); showToast("Error cargando datos", "error"); }
        finally { setLoading(false); }
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
        } catch (error) { console.error(error); } 
        finally { setLoadingDetalle(false); }
    };

    const handleBreadcrumbClick = (index) => {
        if (index === -1) setRuta([]);
        else setRuta(ruta.slice(0, index + 1));
        setItemSeleccionado(null);
        setDetalleItem(null);
    };

    // --- ACCIONES CRUD ---
    const handleGuardarCrear = async () => { 
        if (!nombreForm.trim()) return showToast("Nombre requerido", "warning");
        try { 
            await UbicacionService.crear(nombreForm, padreActual?.id, tipoForm); 
            setOpenCrear(false); cargarUbicaciones(); showToast("Creado correctamente");
        } catch (e) { showToast("Error al crear", "error"); }
    };

    const handleGuardarEditarNombre = async () => { 
        if (!itemAEditar || !nombreForm.trim()) return;
        try { 
            await UbicacionService.actualizar(itemAEditar.id, nombreForm); 
            setOpenEditarNombre(false); cargarUbicaciones(); showToast("Nombre actualizado");
        } catch (e) { showToast("Error al actualizar", "error"); }
    };

    const handleEliminar = async (item) => { 
        if(!window.confirm(`¿Eliminar ${item.nombre}?`)) return;
        try { 
            await UbicacionService.eliminar(item.id); 
            cargarUbicaciones(); 
            if(itemSeleccionado?.id === item.id) { setItemSeleccionado(null); }
            showToast("Eliminado");
        } catch(e) { showToast("Error al eliminar", "error"); }
    };

    const handleGuardarEvidencia = async () => {
        if (!itemSeleccionado) return;
        if (!archivoSeleccionado && !nuevaObs.trim()) return showToast("Falta foto u observación", "warning");
        try {
            await UbicacionService.agregarDetalle(itemSeleccionado.id, archivoSeleccionado, nuevaObs);
            setOpenGestionarEvidencia(false); setArchivoSeleccionado(null); setPreviewUrl('');
            cargarDetalleItem(itemSeleccionado.id); showToast("Evidencia guardada");
        } catch (error) { showToast("Error al guardar", "error"); }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { setArchivoSeleccionado(file); setPreviewUrl(URL.createObjectURL(file)); }
    };

    const itemsFiltrados = itemsActuales.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase()));

    return (
        <ThemeProvider theme={modernTheme}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
                
                {/* HEADER */}
                <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white', zIndex: 1201 }}>
                    <Toolbar variant="dense">
                        <HomeIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <Typography variant="h6" color="text.primary" sx={{ flexGrow: 1 }}>Portal Hergo</Typography>
                        
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Chip label="ADMINISTRADOR" color="error" size="small" />
                            <IconButton onClick={logout} color="primary" size="small">
                                <LogoutIcon />
                            </IconButton>
                        </Stack>
                    </Toolbar>
                </AppBar>

                {/* CONTENEDOR SPLIT */}
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexGrow: 1, overflow: 'hidden', position: 'relative' }}>
                    
                    {/* PANEL IZQUIERDO (LISTA) */}
                    <Box sx={{ 
                        flex: { xs: itemSeleccionado ? 'none' : '1', md: 'none' },
                        width: { xs: '100%', md: panelDerechoOpen ? '400px' : '100%' },
                        display: { xs: itemSeleccionado ? 'none' : 'flex', md: 'flex' },
                        flexDirection: 'column', borderRight: '1px solid #ddd', bgcolor: 'white', position: 'relative',
                        order: { xs: 2, md: 1 }
                    }}>
                        <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1 }}>
                                <Link component="button" onClick={() => handleBreadcrumbClick(-1)} underline="hover" color={ruta.length === 0 ? 'primary' : 'inherit'}>Inicio</Link>
                                {ruta.map((item, index) => <Link key={item.id} component="button" onClick={() => handleBreadcrumbClick(index)} underline="hover" color={index === ruta.length -1 ? 'primary' : 'inherit'}>{item.nombre}</Link>)}
                            </Breadcrumbs>
                            <Stack direction="row" spacing={1}>
                                <TextField size="small" placeholder="Buscar..." fullWidth value={busqueda} onChange={(e) => setBusqueda(e.target.value)} InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small"/></InputAdornment>) }} />
                                <Button variant="contained" size="small" startIcon={<AddCircleOutlineIcon />} onClick={() => { setNombreForm(""); setTipoForm("CARPETA"); setOpenCrear(true); }} sx={{ minWidth: '90px' }}>Crear</Button>
                            </Stack>
                        </Box>
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: '#f8fafc' }}>
                            {loading ? <Box display="flex" justifyContent="center"><CircularProgress /></Box> : (
                                <Grid container spacing={2}>
                                    {itemsFiltrados.map((item) => (
                                        <Grid item xs={12} sm={6} md={12} lg={6} key={item.id}>
                                            <UbicacionCard 
                                                item={item} selected={itemSeleccionado?.id === item.id}
                                                onClick={handleItemClick} 
                                                onEdit={(i) => { setItemAEditar(i); setNombreForm(i.nombre); setOpenEditarNombre(true); }}
                                                onDelete={handleEliminar}
                                            />
                                        </Grid>
                                    ))}
                                </Grid>
                            )}
                        </Box>
                        <Box sx={{ position: 'absolute', top: '50%', right: -15, zIndex: 10, display: { xs: 'none', md: 'block' } }}>
                            <IconButton onClick={() => setPanelDerechoOpen(!panelDerechoOpen)} sx={{ bgcolor: 'white', border: '1px solid #ddd', boxShadow: 2 }}>
                                {panelDerechoOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                            </IconButton>
                        </Box>
                    </Box>

                    {/* PANEL DERECHO (DETALLE/MAPA) */}
                    <Box sx={{ 
                        flex: { xs: itemSeleccionado ? '1' : 'none', md: '1' },
                        height: { xs: itemSeleccionado ? '100%' : '250px', md: '100%' },
                        width: { xs: '100%', md: panelDerechoOpen ? 'auto' : '0' },
                        display: { xs: 'flex', md: panelDerechoOpen ? 'flex' : 'none' },
                        flexDirection: 'column', bgcolor: '#f1f5f9', overflow: 'hidden',
                        order: { xs: 1, md: 2 }, borderBottom: { xs: '1px solid #ddd', md: 'none' }
                    }}>
                        {itemSeleccionado ? (
                            <Box sx={{ p: 4, height: '100%', overflowY: 'auto', bgcolor: '#fff' }}>
                                <Fade in={true}>
                                    <Stack spacing={3} maxWidth="800px" mx="auto">
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <IconButton onClick={() => setItemSeleccionado(null)} sx={{ display: { xs: 'flex', md: 'none' }, border: '1px solid #ddd' }}><ArrowBackIcon /></IconButton>
                                            <Box flexGrow={1}><Typography variant="h5" fontWeight="bold">{itemSeleccionado.nombre}</Typography></Box>
                                            <Button variant="contained" color="secondary" size="small" startIcon={<EditIcon />} onClick={() => setOpenGestionarEvidencia(true)}>Evidencia</Button>
                                        </Box>
                                        <Paper elevation={0} sx={{ p: 1, border: '1px dashed #ddd', display: 'flex', justifyContent: 'center' }}>
                                            {loadingDetalle ? <CircularProgress /> : detalleItem?.imagenUrl ? 
                                                <Box component="img" src={detalleItem.imagenUrl} onClick={() => setZoomImagen(detalleItem.imagenUrl)} sx={{ maxWidth: '100%', maxHeight: '450px', objectFit: 'contain' }} /> 
                                                : <Stack alignItems="center" p={5} color="text.secondary"><ImageNotSupportedIcon sx={{ fontSize: 60 }} /><Typography>Sin evidencia</Typography></Stack>
                                            }
                                        </Paper>
                                        <Paper sx={{ p: 3, bgcolor: '#f8fafc' }}><Typography variant="body1">{detalleItem?.observacion || "Sin observaciones."}</Typography></Paper>
                                    </Stack>
                                </Fade>
                            </Box>
                        ) : (
                            <Box sx={{ flexGrow: 1, height: '100%', width: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#e2e8f0', position: 'relative' }}>
                                <Box component="img" src="/planograma.jpg" alt="Plano" sx={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>

            {/* MODALES */}
            <Dialog open={openCrear} onClose={() => setOpenCrear(false)} fullWidth maxWidth="xs">
                <DialogTitle>Nuevo Elemento</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Nombre" fullWidth value={nombreForm} onChange={(e) => setNombreForm(e.target.value)} />
                    <FormControl fullWidth margin="dense"><InputLabel>Tipo</InputLabel><Select value={tipoForm} onChange={(e) => setTipoForm(e.target.value)} label="Tipo"><MenuItem value="CARPETA">Carpeta</MenuItem><MenuItem value="ITEM">Producto</MenuItem></Select></FormControl>
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenCrear(false)}>Cancelar</Button><Button variant="contained" onClick={handleGuardarCrear}>Crear</Button></DialogActions>
            </Dialog>

            <Dialog open={openEditarNombre} onClose={() => setOpenEditarNombre(false)} fullWidth maxWidth="xs">
                <DialogTitle>Renombrar</DialogTitle>
                <DialogContent><TextField autoFocus margin="dense" label="Nombre" fullWidth value={nombreForm} onChange={(e) => setNombreForm(e.target.value)} /></DialogContent>
                <DialogActions><Button onClick={() => setOpenEditarNombre(false)}>Cancelar</Button><Button variant="contained" onClick={handleGuardarEditarNombre}>Guardar</Button></DialogActions>
            </Dialog>

            <Dialog open={openGestionarEvidencia} onClose={() => setOpenGestionarEvidencia(false)} fullWidth maxWidth="sm">
                <DialogTitle>Actualizar Evidencia</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} py={1}>
                        <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>{archivoSeleccionado ? "Foto Seleccionada" : "Subir Foto"}<input type="file" hidden accept="image/*" onChange={handleFileChange} /></Button>
                        {(previewUrl || detalleItem?.imagenUrl) && <Box sx={{ height: 200, display: 'flex', justifyContent: 'center' }}><img src={previewUrl || detalleItem.imagenUrl} style={{ height: '100%', objectFit: 'contain' }} /></Box>}
                        <TextField label="Observación" multiline rows={3} fullWidth value={nuevaObs} onChange={(e) => setNuevaObs(e.target.value)} />
                    </Stack>
                </DialogContent>
                <DialogActions><Button onClick={() => setOpenGestionarEvidencia(false)}>Cancelar</Button><Button onClick={handleGuardarEvidencia} variant="contained" startIcon={<SaveIcon />}>Guardar</Button></DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={closeToast}><Alert severity={toast.type}>{toast.msg}</Alert></Snackbar>
        </ThemeProvider>
    );
};

export default AdminDashboard;