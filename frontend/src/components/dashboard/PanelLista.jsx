import React from 'react';
import { Box, Breadcrumbs, Link, Stack, TextField, InputAdornment, Button, CircularProgress, Grid, Typography, IconButton } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import UbicacionCard from '../dashboard/UbicacionCard';

const PanelLista = ({ 
    ruta, items, loading, busqueda, 
    setBusqueda, onBreadcrumb, onItemClick, onCrear, onEditar, onEliminar,
    isOpen, onToggle 
}) => {
    return (
        <Box sx={{ 
            flex: { xs: isOpen ? '1' : 'none', md: 'none' },
            width: { xs: '100%', md: isOpen ? '400px' : '100%' },
            display: { xs: isOpen ? 'flex' : 'none', md: 'flex' },
            flexDirection: 'column', borderRight: '1px solid #ddd', bgcolor: 'white', position: 'relative',
            order: { xs: 2, md: 1 }, 
            transition: 'width 0.3s'
        }}>
            <Box sx={{ p: 2, borderBottom: '1px solid #eee' }}>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 1 }}>
                    <Link component="button" onClick={() => onBreadcrumb(-1)} underline="hover" color={ruta.length === 0 ? 'primary' : 'inherit'}>Inicio</Link>
                    {ruta.map((item, index) => (
                        <Link key={item.id} component="button" onClick={() => onBreadcrumb(index)} underline="hover" color={index === ruta.length -1 ? 'primary' : 'inherit'}>{item.nombre}</Link>
                    ))}
                </Breadcrumbs>
                <Stack direction="row" spacing={1}>
                    <TextField 
                        size="small" placeholder="Buscar..." fullWidth value={busqueda} 
                        onChange={(e) => setBusqueda(e.target.value)} 
                        InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon fontSize="small"/></InputAdornment>) }} 
                    />
                    {onCrear && (
                        <Button variant="contained" size="small" startIcon={<AddCircleOutlineIcon />} onClick={onCrear} sx={{ minWidth: '90px' }}>
                            Crear
                        </Button>
                    )}
                </Stack>
            </Box>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: '#f8fafc' }}>
                {loading ? <Box display="flex" justifyContent="center"><CircularProgress /></Box> : (
                    <Grid container spacing={2}>
                        {items.map((item) => (
                            <Grid item xs={12} sm={6} md={12} lg={6} key={item.id}>
                                <UbicacionCard 
                                    item={item} 
                                    onClick={onItemClick} 
                                    onEdit={onEditar}
                                    onDelete={onEliminar}
                                />
                            </Grid>
                        ))}
                        {items.length === 0 && <Typography variant="body2" align="center" color="text.secondary" mt={2}>Carpeta vacía</Typography>}
                    </Grid>
                )}
            </Box>

            <Box sx={{ position: 'absolute', top: '50%', right: -15, zIndex: 10, display: { xs: 'none', md: 'block' } }}>
                <IconButton onClick={onToggle} sx={{ bgcolor: 'white', border: '1px solid #ddd', boxShadow: 2 }}>
                    {isOpen ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                </IconButton>
            </Box>
        </Box>
    );
};

export default PanelLista;