import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { UbicacionService } from '../services/api';
import { useAuth } from '../auth/context/AuthContext';
import Header from '../components/layout/Header';
import PanelLista from '../components/dashboard/PanelLista';
import PanelDetalle from '../components/dashboard/PanelDetalle';

import { 
    Box, Dialog, IconButton, Snackbar, Alert,
    DialogTitle, DialogContent, DialogActions, Button, Stack, Typography // NUEVO: Imports para el Dialog
} from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos'; 
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

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
    const { logout, user } = useAuth();

    const [ruta, setRuta] = useState([]); 
    const [itemsActuales, setItemsActuales] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [panelDerechoOpen, setPanelDerechoOpen] = useState(true); 
    const [itemSeleccionado, setItemSeleccionado] = useState(null); 
    const [detalleItem, setDetalleItem] = useState(null); 
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    
    const [zoomImagen, setZoomImagen] = useState(null);
    const [busqueda, setBusqueda] = useState("");

    // --- NUEVOS ESTADOS PARA MANEJAR LA IMAGEN ---
    const [openUpdateImage, setOpenUpdateImage] = useState(false);
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');
    // ---------------------------------------------

    const [toast, setToast] = useState({ open: false, msg: '', type: 'info' });
    const showToast = (msg, type = 'success') => setToast({ open: true, msg, type });
    const closeToast = () => setToast({ ...toast, open: false });

    const padreActual = ruta.length > 0 ? ruta[ruta.length - 1] : null;

    const itemsFiltrados = itemsActuales.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase()));


    const cargarUbicaciones = useCallback(async () => {
        setLoading(true);
        try {
            const padreId = padreActual ? padreActual.id : null;
            const res = await UbicacionService.listar(padreId);
            setItemsActuales(res.data);
        } catch (error) { console.error(error); showToast("Error al cargar datos", "error"); }
        finally { setLoading(false); }
    }, [padreActual]);

    useEffect(() => { cargarUbicaciones(); }, [cargarUbicaciones]);

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
            } else {
                setDetalleItem(null);
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { 
            setArchivoSeleccionado(file); 
            setPreviewUrl(URL.createObjectURL(file)); 
        }
    };

    const handleGuardarNuevaImagen = async () => {
        if (!itemSeleccionado || !archivoSeleccionado) return;

        const textoActual = detalleItem?.observacion || "";

        try {
            await UbicacionService.agregarDetalle(itemSeleccionado.id, archivoSeleccionado, textoActual);
            
            setOpenUpdateImage(false);
            setArchivoSeleccionado(null);
            setPreviewUrl('');
            cargarDetalleItem(itemSeleccionado.id);
            showToast("Imagen actualizada correctamente");
        } catch (error) {
            console.error(error);
            showToast("Error al actualizar imagen", "error");
        }
    };

const handleNavegar = (direccion) => {
        if (!itemSeleccionado) return;
        const indexActual = itemsFiltrados.findIndex(i => i.id === itemSeleccionado.id);
        if (indexActual === -1) return; 

        let nuevoIndex = indexActual;
        if (direccion === 'anterior') {
            nuevoIndex = indexActual - 1;
        } else {
            nuevoIndex = indexActual + 1;
        }

        if (nuevoIndex >= 0 && nuevoIndex < itemsFiltrados.length) {
            const nuevoItem = itemsFiltrados[nuevoIndex];
            
            setItemSeleccionado(nuevoItem);
            cargarDetalleItem(nuevoItem.id);
        }
    };

    const indexActual = itemSeleccionado ? itemsFiltrados.findIndex(i => i.id === itemSeleccionado.id) : -1;
    const hayAnterior = indexActual > 0;
    const haySiguiente = indexActual !== -1 && indexActual < itemsFiltrados.length - 1;


    return (
        <ThemeProvider theme={modernTheme}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
                
                <Header usuario={user?.username} rolLabel="USUARIO" onLogout={logout} />

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexGrow: 1, overflow: 'hidden' }}>
                    
                    <PanelLista 
                        ruta={ruta} items={itemsFiltrados} loading={loading} busqueda={busqueda}
                        setBusqueda={setBusqueda}
                        onBreadcrumb={handleBreadcrumbClick}
                        onItemClick={handleItemClick}
                        isOpen={panelDerechoOpen}
                        onToggle={() => setPanelDerechoOpen(!panelDerechoOpen)}
                    />

                    <Box sx={{ 
                        flex: 1, 
                        display: { xs: itemSeleccionado ? 'flex' : (panelDerechoOpen ? 'none' : 'flex'), md: 'flex' },
                        flexDirection: 'column', bgcolor: '#f1f5f9', overflow: 'hidden',
                        borderBottom: { xs: '1px solid #ddd', md: 'none' },
                        order: { xs: 1, md: 2 } 
                    }}>
                        <PanelDetalle 
                            itemSeleccionado={itemSeleccionado}
                            detalleItem={detalleItem}
                            loadingDetalle={loadingDetalle}
                            onClose={() => setItemSeleccionado(null)}
                            onZoom={setZoomImagen}
                            onEvidencia={() => setOpenUpdateImage(true)} 

                            onAnterior={() => handleNavegar('anterior')}
                            onSiguiente={() => handleNavegar('siguiente')}
                            hayAnterior={hayAnterior}
                            haySiguiente={haySiguiente}
                        />
                    </Box>

                </Box>
            </Box>

            {/* --- NUEVO DIALOGO: SOLO IMAGEN --- */}
            <Dialog open={openUpdateImage} onClose={() => setOpenUpdateImage(false)} fullWidth maxWidth="sm">
                <DialogTitle>Actualizar Imagen</DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} py={2} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                            La observación actual se mantendrá, solo se cambiará la foto.
                        </Typography>

                        <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
                            {archivoSeleccionado ? "Cambiar Selección" : "Seleccionar Foto"}
                            <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                        </Button>

                        {(previewUrl || (detalleItem?.imagenUrl)) && (
                            <Box sx={{ height: 250, width: '100%', display: 'flex', justifyContent: 'center', bgcolor: '#f1f5f9', borderRadius: 2, p: 1 }}>
                                <img 
                                    src={previewUrl || detalleItem.imagenUrl} 
                                    alt="Preview" 
                                    style={{ height: '100%', maxWidth: '100%', objectFit: 'contain' }} 
                                />
                            </Box>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenUpdateImage(false)}>Cancelar</Button>
                    <Button 
                        onClick={handleGuardarNuevaImagen} 
                        variant="contained" 
                        disabled={!archivoSeleccionado} // Solo habilita si seleccionó algo nuevo
                        startIcon={<SaveIcon />}
                    >
                        Guardar Imagen
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog de Zoom existente */}
            <Dialog 
                open={Boolean(zoomImagen)} 
                onClose={() => setZoomImagen(null)} 
                maxWidth="xl"
                PaperProps={{ sx: { bgcolor: 'transparent', boxShadow: 'none' } }}
            >
                <Box sx={{ position: 'relative', bgcolor: 'black', borderRadius: 2, overflow: 'hidden' }}>
                    <IconButton onClick={() => setZoomImagen(null)} sx={{ position: 'absolute', top: 10, right: 10, color: 'white', bgcolor: 'rgba(0,0,0,0.5)' }}>X</IconButton>
                    <img src={zoomImagen} alt="Full" style={{ maxHeight: '90vh', maxWidth: '100vw', display: 'block' }} />
                </Box>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={closeToast}><Alert severity={toast.type}>{toast.msg}</Alert></Snackbar>
        </ThemeProvider>
    );
};

export default UserDashboard;