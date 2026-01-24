import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { UbicacionService } from '../services/api';
import { useAuth } from '../auth/context/AuthContext';
import Header from '../components/layout/Header';
import PanelLista from '../components/dashboard/PanelLista';
import PanelDetalle from '../components/dashboard/PanelDetalle';

import { 
    Box, Button, Dialog, DialogTitle, DialogContent, 
    TextField, DialogActions, FormControl, InputLabel, Select, MenuItem, 
    Stack, Snackbar, Alert, Divider, Typography
} from '@mui/material';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SaveIcon from '@mui/icons-material/Save';
import ImageSearchIcon from '@mui/icons-material/ImageSearch'; // Icono opcional para imagen
import EditNoteIcon from '@mui/icons-material/EditNote'; // Icono opcional para nota

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
    const { logout, user } = useAuth();

    const [ruta, setRuta] = useState([]); 
    const [itemsActuales, setItemsActuales] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [panelDerechoOpen, setPanelDerechoOpen] = useState(true); 
    const [itemSeleccionado, setItemSeleccionado] = useState(null); 
    const [detalleItem, setDetalleItem] = useState(null); 
    const [loadingDetalle, setLoadingDetalle] = useState(false);
    
    const [openCrear, setOpenCrear] = useState(false);
    const [openEditarNombre, setOpenEditarNombre] = useState(false);
    const [openGestionarEvidencia, setOpenGestionarEvidencia] = useState(false);
    const [zoomImagen, setZoomImagen] = useState(null);

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

    const handleGuardarImagen = async () => {
        if(!itemSeleccionado) return;
        if(!archivoSeleccionado) return showToast("Debes seleccionar una imagen", "warning");

        try{
            // Enviamos la imagen Y la observación actual (para no borrar el texto si el backend lo pide)
            await UbicacionService.agregarDetalle(itemSeleccionado.id, archivoSeleccionado, nuevaObs);
            
            setArchivoSeleccionado(null); 
            setPreviewUrl('');
            cargarDetalleItem(itemSeleccionado.id); 
            showToast("Imagen actualizada");
        } catch(e) {
            showToast("Error al guardar imagen", "error");
        }
    }

    const handleGuardarObservacion = async () => {
        if(!itemSeleccionado) return;
        
        // Validación: Si el texto es igual al que ya estaba, no hacemos nada
        if(detalleItem?.observacion === nuevaObs && !nuevaObs) return showToast("No hay cambios en la observación", "info");

        try{
            // CORRECCIÓN IMPORTANTE:
            // Enviamos 'undefined' en lugar de 'null'.
            // Si tu backend borra la imagen al recibir undefined, revisa tu UbicacionService.js
            // El servicio NO debe hacer formData.append('file', ...) si el archivo es undefined/null.
            await UbicacionService.agregarDetalle(itemSeleccionado.id, undefined, nuevaObs);
            
            cargarDetalleItem(itemSeleccionado.id); 
            showToast("Observación actualizada");
        } catch(e) {
            showToast("Error al guardar observación", "error");
        }
    }

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) { setArchivoSeleccionado(file); setPreviewUrl(URL.createObjectURL(file)); }
    };

    const itemsFiltrados = itemsActuales.filter(i => i.nombre.toLowerCase().includes(busqueda.toLowerCase()));

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
                
                <Header usuario={user?.username} rolLabel="ADMINISTRADOR" onLogout={logout} />

                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, flexGrow: 1, overflow: 'hidden' }}>
                    
                    <PanelLista 
                        ruta={ruta} items={itemsFiltrados} loading={loading} busqueda={busqueda}
                        setBusqueda={setBusqueda}
                        onBreadcrumb={handleBreadcrumbClick}
                        onItemClick={handleItemClick}
                        onCrear={() => { setNombreForm(""); setTipoForm("CARPETA"); setOpenCrear(true); }}
                        onEditar={(i) => { setItemAEditar(i); setNombreForm(i.nombre); setOpenEditarNombre(true); }}
                        onEliminar={handleEliminar}
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
                            onEvidencia={() => setOpenGestionarEvidencia(true)}
                            onZoom={setZoomImagen}
                            onAnterior={() => handleNavegar('anterior')}
                            onSiguiente={() => handleNavegar('siguiente')}
                            hayAnterior={hayAnterior}
                            haySiguiente={haySiguiente}
                        />
                    </Box>

                </Box>
            </Box>

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
                    <Stack spacing={3} py={1}>
                        
                        {/* SECCIÓN IMAGEN */}
                        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom>1. Imagen</Typography>
                            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                                <Button component="label" variant="outlined" startIcon={<CloudUploadIcon />}>
                                    {archivoSeleccionado ? "Cambiar" : "Seleccionar"}
                                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                                </Button>
                                {archivoSeleccionado && <Typography variant="caption" color="green">¡Listo para subir!</Typography>}
                            </Stack>

                            {(previewUrl || detalleItem?.imagenUrl) && (
                                <Box sx={{ height: 180, display: 'flex', justifyContent: 'center', mb: 2, bgcolor: '#f5f5f5' }}>
                                    <img src={previewUrl || detalleItem.imagenUrl} style={{ height: '100%', objectFit: 'contain' }} alt="Evidencia" />
                                </Box>
                            )}
                            
                            <Button 
                                fullWidth 
                                variant="contained" 
                                onClick={handleGuardarImagen}
                                disabled={!archivoSeleccionado}
                            >
                                Guardar Nueva Imagen
                            </Button>
                        </Box>

                        {/* SECCIÓN OBSERVACIÓN */}
                        <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                            <Typography variant="subtitle2" color="primary" gutterBottom>2. Observación</Typography>
                            <TextField 
                                label="Detalle" 
                                multiline 
                                rows={3} 
                                fullWidth 
                                value={nuevaObs} 
                                onChange={(e) => setNuevaObs(e.target.value)} 
                                sx={{ mb: 2 }}
                            />
                            
                            <Button 
                                fullWidth 
                                variant="outlined" 
                                onClick={handleGuardarObservacion}
                            >
                                Guardar Solo Texto
                            </Button>
                        </Box>

                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenGestionarEvidencia(false)} color="secondary">Cerrar</Button>
                </DialogActions>
            </Dialog>

            <Snackbar open={toast.open} autoHideDuration={4000} onClose={closeToast}><Alert severity={toast.type}>{toast.msg}</Alert></Snackbar>
        </ThemeProvider>
    );
};

export default AdminDashboard;