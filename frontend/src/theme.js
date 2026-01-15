import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#0f172a', // "Slate 900" - Un azul marino casi negro, muy elegante
            light: '#334155',
        },
        secondary: {
            main: '#3b82f6', // "Blue 500" - Un azul vibrante para botones de acción
        },
        background: {
            default: '#f1f5f9', // "Slate 100" - Gris muy suave de fondo (no blanco puro)
            paper: '#ffffff',
        },
        text: {
            primary: '#1e293b', // Texto casi negro para lectura cómoda
            secondary: '#64748b', // Texto gris para metadatos
        },
        success: {
            main: '#10b981', // Verde esmeralda profesional
        },
        warning: {
            main: '#f59e0b', // Ambar para carpetas
        }
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h6: {
            fontWeight: 700,
            letterSpacing: '-0.025em',
        },
        button: {
            textTransform: 'none', // Quita las mayúsculas forzadas para un look más moderno
            fontWeight: 600,
        }
    },
    shape: {
        borderRadius: 12, // Bordes redondeados modernos
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)', // Sombra sutil tipo Tailwind
                    border: '1px solid #e2e8f0',
                }
            }
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }
                }
            }
        }
    }
});

export default theme;