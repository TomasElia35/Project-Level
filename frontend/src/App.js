import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material'; // Importamos el ThemeProvider
import theme from './theme'; // Tu nuevo archivo de tema
import { UbicacionService } from './services/api';
import UbicacionCard from './components/UbicacionCard';
import DetalleModulo from './components/DetalleModulo';

import { 
    AppBar, Toolbar, Typography, Container, Breadcrumbs, Link, Box, 
    Button, CircularProgress, Grid, Dialog, DialogTitle, DialogContent, 
    TextField, DialogActions, FormControl, InputLabel, Select, MenuItem, Paper
} from '@mui/material';

import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DashboardIcon from '@mui/icons-material/Dashboard';

function App() {
    const [ruta, setRuta] = useState([]); 
    const [itemsActuales, setItemsActuales] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Estados Modales y Form
    const [openCrear, setOpenCrear] = useState(false);
    const [openEditar, setOpenEditar] = useState(false);
    const [nombreForm, setNombreForm] = useState("");
    const [tipoForm, setTipoForm] = useState("CARPETA");
    const [itemAEditar, setItemAEditar] = useState(null);

    const padreActual = ruta.length > 0 ? ruta[ruta.length - 1] : null;

    // --- CARGA DE DATOS ---
    const cargarUbicaciones = useCallback(async () => {
        setLoading(true);
        try {
            const id = padreActual ? padreActual.id : null;
            const res = await UbicacionService.listar(id);
            setItemsActuales(res.data);
        } catch (error) { console.error(error); } 
        finally { setLoading(false); }
    }, [padreActual]);

    useEffect(() => { cargarUbicaciones(); }, [cargarUbicaciones]); 

    // --- NAVEGACIÓN Y ACCIONES ---
    const handleNavegar = (item) => {
        if (item.tipo === 'ITEM') setRuta([...ruta, { ...item, esHoja: true }]);
        else setRuta([...ruta, item]);
    };

    const handleVolverAIndice = (index) => {
        if (index === -1) setRuta([]);
        else setRuta(ruta.slice(0, index + 1));
    };

    const abrirModalCrear = () => {
        setNombreForm("");
        setTipoForm("CARPETA");
        setOpenCrear(true);
    };

    const handleGuardarCrear = async () => {
        if (!nombreForm.trim()) return;
        try {
            await UbicacionService.crear(nombreForm, padreActual?.id, tipoForm);
            setOpenCrear(false);
            cargarUbicaciones();
        } catch (error) { alert("Error: " + error.message); }
    };

    const abrirModalEditar = (item) => {
        setItemAEditar(item);
        setNombreForm(item.nombre);
        setOpenEditar(true);
    };

    const handleGuardarEditar = async () => {
        try {
            await UbicacionService.actualizar(itemAEditar.id, nombreForm);
            setOpenEditar(false);
            cargarUbicaciones();
        } catch (error) { alert("Error al editar"); }
    };

    const handleEliminar = async (item) => {
        if (window.confirm(`¿Eliminar "${item.nombre}"?`)) {
            try {
                await UbicacionService.eliminar(item.id);
                cargarUbicaciones();
            } catch (error) { alert("Error al eliminar"); }
        }
    };

    // --- RENDERIZADO ---
    
    // Si estamos en un ítem (detalle), mostramos el módulo de detalle envuelto en el tema
    const content = padreActual?.esHoja ? (
        <DetalleModulo modulo={padreActual} onBack={() => setRuta(ruta.slice(0, -1))} />
    ) : (
        <>
            {/* Barra Superior Oscura */}
            <AppBar position="static" elevation={0} sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <Toolbar>
                    <DashboardIcon sx={{ mr: 2, color: '#3b82f6' }} /> {/* Logo azul */}
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1, letterSpacing: '0.5px' }}>
                        Góndola Manager
                    </Typography>
                    <Button 
                        variant="contained" 
                        color="secondary"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={abrirModalCrear}
                        sx={{ borderRadius: 20, px: 3 }}
                    >
                        Nuevo Elemento
                    </Button>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
                {/* Barra de Navegación (Breadcrumbs) estilo Tarjeta */}
                <Paper elevation={0} sx={{ p: 2, mb: 4, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                    <Breadcrumbs separator={<NavigateNextIcon fontSize="small" color="action" />}>
                        <Link 
                            underline="hover" color="inherit" 
                            onClick={() => handleVolverAIndice(-1)} 
                            sx={{cursor:'pointer', fontWeight: 600, display: 'flex', alignItems: 'center'}}
                        >
                            DASHBOARD
                        </Link>
                        {ruta.map((item, index) => (
                            <Link 
                                key={item.id} underline="hover" color={index === ruta.length -1 ? "text.primary" : "inherit"}
                                onClick={() => handleVolverAIndice(index)} 
                                sx={{cursor:'pointer', fontWeight: index === ruta.length -1 ? 700 : 400}}
                            >
                                {item.nombre}
                            </Link>
                        ))}
                    </Breadcrumbs>
                </Paper>

                {/* Grid de Contenido */}
                {loading ? (
                    <Box display="flex" justifyContent="center" mt={10}><CircularProgress color="secondary" /></Box> 
                ) : (
                    <Grid container spacing={3}>
                        {itemsActuales.length === 0 && (
                            <Box sx={{ width: '100%', textAlign: 'center', mt: 8, color: 'text.secondary' }}>
                                <Typography variant="h5" fontWeight="bold">Carpeta Vacía</Typography>
                                <Typography variant="body1">No hay elementos registrados en esta sección.</Typography>
                            </Box>
                        )}
                        {itemsActuales.map(item => (
                            <Grid item xs={12} sm={6} md={4} lg={3} xl={2} key={item.id}>
                                <UbicacionCard 
                                    item={item} 
                                    onClick={handleNavegar}
                                    onEdit={abrirModalEditar}
                                    onDelete={handleEliminar}
                                />
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </>
    );

    // Envolvemos todo en el ThemeProvider
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Normaliza los estilos CSS */}
            {content}

            {/* MODALES CON ESTILO UNIFICADO */}
            <Dialog open={openCrear} onClose={() => setOpenCrear(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Crear Nuevo Elemento</DialogTitle>
                <DialogContent>
                    <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <TextField 
                            autoFocus label="Nombre del Elemento" fullWidth variant="outlined" 
                            value={nombreForm} onChange={(e) => setNombreForm(e.target.value)}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Tipo de Elemento</InputLabel>
                            <Select 
                                value={tipoForm} label="Tipo de Elemento" 
                                onChange={(e) => setTipoForm(e.target.value)}
                            >
                                <MenuItem value="CARPETA">📁 Carpeta (Contenedor)</MenuItem>
                                <MenuItem value="ITEM">📦 Producto (Detalle)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenCrear(false)} color="inherit">Cancelar</Button>
                    <Button onClick={handleGuardarCrear} variant="contained" color="primary">Confirmar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openEditar} onClose={() => setOpenEditar(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Renombrar</DialogTitle>
                <DialogContent>
                    <TextField 
                        autoFocus margin="dense" label="Nuevo Nombre" fullWidth variant="outlined" 
                        value={nombreForm} onChange={(e) => setNombreForm(e.target.value)}
                    />
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenEditar(false)} color="inherit">Cancelar</Button>
                    <Button onClick={handleGuardarEditar} variant="contained" color="primary">Guardar Cambios</Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}

export default App;