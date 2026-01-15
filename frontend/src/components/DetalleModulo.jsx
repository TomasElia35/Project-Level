import React, { useEffect, useState, useCallback } from 'react';
import { UbicacionService } from '../services/api'; 
import { 
    AppBar, Toolbar, IconButton, Typography, Container, Box, 
    TextField, Button, Card, CardContent, Grid, Chip, Divider, Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CloudUploadIcon from '@mui/icons-material/CloudUpload'; // Icono para subir foto

const DetalleModulo = ({ modulo, onBack }) => {
    // Estados
    const [historial, setHistorial] = useState([]);
    const [nuevaObs, setNuevaObs] = useState('');
    
    // Estados para el manejo de archivos
    const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    // Cargar historial al iniciar
    const cargarHistorial = useCallback(async () => {
        try {
            const res = await UbicacionService.verHistorial(modulo.id);
            setHistorial(res.data);
        } catch (error) { console.error(error); }
    }, [modulo.id]);

    useEffect(() => { cargarHistorial(); }, [cargarHistorial]);

    // Manejar selección de archivo (Cámara o Galería)
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setArchivoSeleccionado(file);
            // Creamos una URL temporal para visualizar la foto antes de subirla
            setPreviewUrl(URL.createObjectURL(file)); 
        }
    };

    // Guardar (Enviar archivo al servidor)
 const handleGuardar = async () => {
    // Validamos
    if (!archivoSeleccionado && !nuevaObs.trim()) return alert("Falta foto u observación");

    try {
        // Enviamos el archivo físico
        await UbicacionService.agregarDetalle(modulo.id, archivoSeleccionado, nuevaObs);
        
        // Limpieza y recarga
        setArchivoSeleccionado(null);
        setPreviewUrl('');
        setNuevaObs('');
        cargarHistorial(); 
    } catch (error) { 
        console.error(error);
        alert("Error al guardar"); 
    }
};

    return (
        <Box sx={{ bgcolor: '#f1f5f9', minHeight: '100vh', pb: 5 }}>
            {/* Header Oscuro Profesional */}
            <AppBar position="static" elevation={0} sx={{ bgcolor: '#0f172a' }}>
                <Toolbar>
                    <IconButton edge="start" onClick={onBack} sx={{ color: 'white', mr: 2 }}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                        {modulo.nombre}
                    </Typography>
                    <Chip label="VISTA DE DETALLE" color="info" size="small" variant="outlined" sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.3)' }}/>
                </Toolbar>
            </AppBar>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Grid container spacing={4}>
                    
                    {/* PANEL IZQUIERDO: FORMULARIO DE CARGA */}
                    <Grid item xs={12} md={5}>
                        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0' }}>
                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1e293b' }}>
                                Nueva Evidencia
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                Toma una foto o selecciona una de la galería para registrar el estado.
                            </Typography>
                            
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                
                                {/* BOTÓN DE CÁMARA / GALERÍA */}
                                <Button
                                    component="label"
                                    variant="outlined"
                                    fullWidth
                                    startIcon={<CloudUploadIcon />}
                                    sx={{ 
                                        height: 60, 
                                        borderStyle: 'dashed', 
                                        borderWidth: 2,
                                        borderColor: archivoSeleccionado ? '#10b981' : 'inherit',
                                        color: archivoSeleccionado ? '#10b981' : 'inherit',
                                        bgcolor: archivoSeleccionado ? '#f0fdf4' : 'transparent'
                                    }}
                                >
                                    {archivoSeleccionado ? "Foto Seleccionada (Cambiar)" : "Tomar Foto / Abrir Galería"}
                                    
                                    {/* Input Oculto: "accept=image/*" activa la cámara en móviles */}
                                    <input 
                                        type="file" 
                                        hidden 
                                        accept="image/*" 
                                        onChange={handleFileChange} 
                                    />
                                </Button>

                                {/* PREVISUALIZACIÓN DE LA FOTO */}
                                {previewUrl && (
                                    <Box sx={{ 
                                        height: 200, width: '100%', borderRadius: 2,
                                        bgcolor: '#000', border: '1px solid #e2e8f0',
                                        display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden'
                                    }}>
                                        <img src={previewUrl} alt="Vista Previa" style={{ height: '100%', objectFit: 'contain' }} />
                                    </Box>
                                )}

                                {/* CAMPO DE OBSERVACIÓN */}
                                <TextField
                                    label="Observaciones Técnicas" 
                                    multiline 
                                    rows={3} 
                                    variant="outlined" 
                                    fullWidth
                                    value={nuevaObs} 
                                    onChange={(e) => setNuevaObs(e.target.value)}
                                    placeholder="Ej: Falta stock, producto dañado..."
                                />

                                {/* BOTÓN GUARDAR */}
                                <Button 
                                    variant="contained" 
                                    color="secondary" 
                                    size="large" 
                                    fullWidth 
                                    startIcon={<SaveIcon />} 
                                    onClick={handleGuardar} 
                                    sx={{ borderRadius: 2, py: 1.5, fontWeight: 'bold' }}
                                    disabled={!archivoSeleccionado && !nuevaObs.trim()}
                                >
                                    Guardar Evidencia
                                </Button>
                            </Box>
                        </Paper>
                    </Grid>

                    {/* PANEL DERECHO: HISTORIAL */}
                    <Grid item xs={12} md={7}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#1e293b', mb: 2 }}>
                            Historial de Cambios
                        </Typography>
                        {historial.length === 0 ? (
                            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary', border: '2px dashed #cbd5e1', borderRadius: 3, bgcolor: '#f8fafc' }}>
                                <Typography>No hay registros históricos para este producto.</Typography>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                {historial.map((item) => (
                                    <Card key={item.id} elevation={0} sx={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                                        {/* FOTO DEL HISTORIAL */}
                                        <Box sx={{ width: 140, bgcolor: '#000', display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
                                            <img 
                                                src={item.imagenUrl} 
                                                alt="Evidencia" 
                                                style={{ width: '100%', height: 120, objectFit: 'contain' }} 
                                                onError={(e) => {
                                                    e.target.onerror = null; 
                                                    e.target.src = "https://via.placeholder.com/150?text=Sin+Foto";
                                                }} 
                                            />
                                        </Box>
                                        
                                        {/* TEXTO DEL HISTORIAL */}
                                        <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                            <Typography variant="body1" sx={{ fontWeight: 500, color: '#334155', mb: 1 }}>
                                                {item.observacion || "Sin observaciones."}
                                            </Typography>
                                            <Divider sx={{ my: 1 }} />
                                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                                <AccessTimeIcon fontSize="small" sx={{ mr: 0.5 }} />
                                                <Typography variant="caption" fontWeight="bold">
                                                    {new Date(item.fechaRegistro).toLocaleString()}
                                                </Typography>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default DetalleModulo;