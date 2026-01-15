import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { UbicacionService } from './services/api';
import UbicacionCard from './components/UbicacionCard';
import DetalleModulo from './components/DetalleModulo';

import { 
    Typography, Breadcrumbs, Link, Box, 
    Button, CircularProgress, Grid, Dialog, DialogTitle, DialogContent, 
    TextField, DialogActions, FormControl, InputLabel, Select, MenuItem, 
    IconButton, InputAdornment, Stack, Divider, Fade
} from '@mui/material';

// Iconos
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import SearchIcon from '@mui/icons-material/Search';
import HomeIcon from '@mui/icons-material/Home';

// 1. Definición del Tema Moderno
const modernTheme = createTheme({
    palette: {
        primary: { main: '#3b82f6' }, // Azul moderno
        secondary: { main: '#64748b' }, // Slate
        background: { default: '#f8fafc', paper: '#ffffff' },
        text: { primary: '#1e293b', secondary: '#64748b' }
    },
    typography: {
        fontFamily: "'Inter', sans-serif",
        h6: { fontWeight: 700 },
        button: { textTransform: 'none', fontWeight: 600 }
    },
    shape: { borderRadius: 12 },
    components: {
        MuiButton: { styleOverrides: { root: { borderRadius: 8, boxShadow: 'none' } } },
        MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } }
    }
});

function App() {
    // --- ESTADOS (Misma lógica original) ---
    const [ruta, setRuta] = useState([]); 
    const [itemsActuales, setItemsActuales] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Modales y Form
    const [openCrear, setOpenCrear] = useState(false);
    const [openEditar, setOpenEditar] = useState(false);
    const [nombreForm, setNombreForm] = useState("");
    const [tipoForm, setTipoForm] = useState("CARPETA");
    const [itemAEditar, setItemAEditar] = useState(null);
    const [busqueda, setBusqueda] = useState(""); // Estado simple para filtrar visualmente (opcional)

    const padreActual = ruta.length > 0 ? ruta[ruta.length - 1] : null;

    // --- CARGA DE DATOS ---
    const cargarUbicaciones = useCallback(async () => {
        setLoading(true);
        try {
            const padreId = padreActual ? padreActual.id : null;
            const res = await UbicacionService.listar(padreId);
            setItemsActuales(res.data);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    }, [padreActual]);

    useEffect(() => { cargarUbicaciones(); }, [cargarUbicaciones]);

    // --- NAVEGACIÓN ---
    const handleCarpetaClick = (carpeta) => {
        setRuta([...ruta, carpeta]);
    };
    
    const handleBreadcrumbClick = (index) => {
        if (index === -1) setRuta([]);
        else setRuta(ruta.slice(0, index + 1));
    };

    // --- CRUD ---
    const handleAbrirCrear = () => {
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
        } catch (error) { console.error(error); }
    };

    const handleAbrirEditar = (item) => {
        setItemAEditar(item);
        setNombreForm(item.nombre);
        setOpenEditar(true);
    };

    const handleGuardarEditar = async () => {
        if (!itemAEditar || !nombreForm.trim()) return;
        try {
            await UbicacionService.actualizar(itemAEditar.id, nombreForm);
            setOpenEditar(false);
            cargarUbicaciones();
        } catch (error) { console.error(error); }
    };

    const handleEliminar = async (item) => {
        if (!window.confirm(`¿Eliminar "${item.nombre}" y todo su contenido?`)) return;
        try {
            await UbicacionService.eliminar(item.id);
            cargarUbicaciones();
        } catch (error) { console.error(error); }
    };

    // Filtro simple en cliente
    const itemsFiltrados = itemsActuales.filter(i => 
        i.nombre.toLowerCase().includes(busqueda.toLowerCase())
    );

    // Render principal
    // Si el último elemento de la ruta es un ITEM (y no una carpeta), mostramos el módulo de detalle
    // OJO: Tu lógica original usaba 'onClick' en la card. Si es carpeta -> navega, si es item -> ¿qué pasaba?
    // Asumiré que quieres mostrar el DetalleModulo dentro del panel izquierdo si es un item.
    // Para simplificar, mantendré la lógica: Si ruta tiene carpeta -> muestra lista.
    // Necesitamos un estado para "Item Seleccionado para Detalle".
    
    // NOTA: En tu código original, App.js no manejaba la selección de Items para ver detalle, 
    // pero incluiste DetalleModulo. Asumiré que al hacer click en un ITEM, se muestra el Detalle.
    const [itemSeleccionadoDetalle, setItemSeleccionadoDetalle] = useState(null);

    const handleItemClick = (item) => {
        if (item.tipo === 'CARPETA') {
            handleCarpetaClick(item);
        } else {
            setItemSeleccionadoDetalle(item);
        }
    };

    const handleVolverDeDetalle = () => {
        setItemSeleccionadoDetalle(null);
        cargarUbicaciones(); // Recargar por si hubo cambios
    };

    // --- RENDER ---
    return (
        <ThemeProvider theme={modernTheme}>
            <Box sx={{ display: 'flex', height: '100vh', bgcolor: 'background.default', overflow: 'hidden' }}>
                
                {/* === PANEL IZQUIERDO (NAVEGACIÓN) === */}
                <Box sx={{ 
                    width: { xs: '100%', md: '450px', lg: '500px' }, // Ancho responsive
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRight: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'white',
                    position: 'relative',
                    zIndex: 2
                }}>
                    
                    {/* Header del Panel */}
                    <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                            <Box sx={{ p:1, bgcolor: 'primary.main', borderRadius: 2, color:'white', display:'flex' }}>
                                {/* Logo o Icono App */}
                                <HomeIcon />
                            </Box>
                            <Typography variant="h6" color="text.primary" sx={{ letterSpacing: '-0.5px' }}>
                                Portal Hergo
                            </Typography>
                        </Stack>

                        {/* Breadcrumbs Estilizados */}
                        <Breadcrumbs 
                            separator={<NavigateNextIcon fontSize="small" color="disabled" />} 
                            sx={{ mb: 2, '& .MuiBreadcrumbs-ol': { flexWrap: 'nowrap', overflowX: 'auto' } }}
                        >
                            <Link 
                                component="button" variant="body2" onClick={() => handleBreadcrumbClick(-1)}
                                underline="hover" sx={{ fontWeight: 600, color: ruta.length === 0 ? 'primary.main' : 'text.secondary' }}
                            >
                                Inicio
                            </Link>
                            {ruta.map((item, index) => (
                                <Link 
                                    key={item.id} component="button" variant="body2" 
                                    onClick={() => handleBreadcrumbClick(index)}
                                    underline="hover" 
                                    color={index === ruta.length - 1 ? "primary.main" : "text.secondary"}
                                    fontWeight={index === ruta.length - 1 ? 700 : 400}
                                    sx={{ whiteSpace: 'nowrap' }}
                                >
                                    {item.nombre}
                                </Link>
                            ))}
                        </Breadcrumbs>

                        {/* Barra de herramientas: Buscar y Crear */}
                        {!itemSeleccionadoDetalle && (
                            <Stack direction="row" spacing={1}>
                                <TextField 
                                    size="small" 
                                    placeholder="Buscar..." 
                                    fullWidth
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    InputProps={{
                                        startAdornment: (<InputAdornment position="start"><SearchIcon color="action" fontSize="small"/></InputAdornment>),
                                        sx: { bgcolor: 'background.default', borderRadius: 2 }
                                    }}
                                />
                                <Button 
                                    variant="contained" 
                                    disableElevation
                                    startIcon={<AddCircleOutlineIcon />}
                                    onClick={handleAbrirCrear}
                                    sx={{ minWidth: '100px', whiteSpace: 'nowrap' }}
                                >
                                    Crear
                                </Button>
                            </Stack>
                        )}
                    </Box>

                    {/* Contenido Scrollable */}
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, bgcolor: '#f8fafc' }}>
                        {itemSeleccionadoDetalle ? (
                            // Muestra el módulo de detalle dentro del panel izquierdo si se selecciona un item
                            <Fade in={true}>
                                <Box>
                                    <DetalleModulo 
                                        modulo={itemSeleccionadoDetalle} 
                                        onBack={handleVolverDeDetalle} 
                                    />
                                </Box>
                            </Fade>
                        ) : (
                            // Muestra la lista de carpetas/items
                            <>
                                {loading ? (
                                    <Box display="flex" justifyContent="center" mt={5}><CircularProgress /></Box>
                                ) : (
                                    <Grid container spacing={2}>
                                        {itemsFiltrados.length > 0 ? (
                                            itemsFiltrados.map((item) => (
                                                <Grid item xs={12} sm={6} key={item.id}>
                                                    <UbicacionCard 
                                                        item={item} 
                                                        onClick={handleItemClick} // Modificado para manejar detalle
                                                        onEdit={handleAbrirEditar}
                                                        onDelete={handleEliminar}
                                                    />
                                                </Grid>
                                            ))
                                        ) : (
                                            <Box width="100%" textAlign="center" mt={5} color="text.secondary">
                                                <Typography variant="body2">No hay elementos aquí.</Typography>
                                            </Box>
                                        )}
                                    </Grid>
                                )}
                            </>
                        )}
                    </Box>
                </Box>

                {/* === PANEL DERECHO (IMAGEN ESTÁTICA) === */}
                <Box sx={{ 
                    flexGrow: 1, 
                    display: { xs: 'none', md: 'flex' }, // Oculto en móviles
                    alignItems: 'center', 
                    justifyContent: 'center',
                    bgcolor: '#f1f5f9',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Imagen Estática de Fondo/Decoración */}
                    <Box 
                        component="img"
                        src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=2301" // Imagen profesional de oficina/arquitectura
                        alt="Imagen Decorativa"
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            opacity: 0.9
                        }}
                    />
                    
                    {/* Overlay opcional para texto sobre la imagen */}
                    <Box sx={{ 
                        position: 'absolute', bottom: 40, left: 40, 
                        p: 3, bgcolor: 'rgba(255,255,255,0.9)', 
                        borderRadius: 4, backdropFilter: 'blur(10px)',
                        maxWidth: '400px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                    }}>
                        <Typography variant="h5" fontWeight="bold" color="primary.main" mb={1}>
                            Gestión de Planogramas
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Selecciona una carpeta o producto en el panel izquierdo para gestionar sus detalles e imágenes.
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* === DIÁLOGOS (MODALES) === */}
            {/* Se mantienen funcionalmente igual, solo se tocan estilos visuales */}
            
            {/* Modal Crear */}
            <Dialog open={openCrear} onClose={() => setOpenCrear(false)} fullWidth maxWidth="xs" PaperProps={{ sx: { borderRadius: 3 } }}>
                <DialogTitle sx={{ fontWeight: 'bold' }}>Nuevo Elemento</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField 
                            autoFocus label="Nombre" fullWidth variant="outlined" 
                            value={nombreForm} onChange={(e) => setNombreForm(e.target.value)}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Tipo</InputLabel>
                            <Select value={tipoForm} label="Tipo" onChange={(e) => setTipoForm(e.target.value)}>
                                <MenuItem value="CARPETA">📁 Carpeta (Contenedor)</MenuItem>
                                <MenuItem value="ITEM">📦 Producto (Detalle)</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpenCrear(false)} color="inherit">Cancelar</Button>
                    <Button onClick={handleGuardarCrear} variant="contained" disableElevation>Crear</Button>
                </DialogActions>
            </Dialog>

            {/* Modal Editar */}
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
                    <Button onClick={handleGuardarEditar} variant="contained" disableElevation>Guardar</Button>
                </DialogActions>
            </Dialog>
        </ThemeProvider>
    );
}

export default App;