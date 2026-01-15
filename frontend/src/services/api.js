import axios from 'axios';

const API_URL = 'http://localhost:8099/api/ubicaciones';

const api = axios.create({ baseURL: API_URL });

export const UbicacionService = {
    // Listar: Si mandas null trae la raíz, si mandas ID trae los hijos
    listar: (padreId = null) => {
        const params = padreId ? { padreId } : {}; 
        return api.get('', { params });
    },

    // Crear: Recibe el tipo (CARPETA o ITEM)
    crear: (nombre, padreId, tipo) => {
        return api.post('', { nombre, padreId, tipo });
    },

    // Actualizar: Solo cambiamos el nombre
    actualizar: (id, nombre) => {
        return api.put(`/${id}`, { nombre });
    },

    // Eliminar: Borra todo el contenido
    eliminar: (id) => {
        return api.delete(`/${id}`);
    },

    // Agregar Detalle: Ahora enviamos JSON (Link de imagen), ya no archivo binario
agregarDetalle: (id, archivoFile, observacion) => {
        const formData = new FormData();
        
        // Si el usuario seleccionó foto, la adjuntamos
        if (archivoFile) {
            formData.append('archivo', archivoFile); 
        }
        // Adjuntamos la observación (aunque esté vacía)
        formData.append('observacion', observacion || "");

        return api.post(`/${id}/detalles`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data' // Obligatorio para enviar archivos
            }
        });
    },

    // Ver Historial
    verHistorial: (id) => {
        return api.get(`/${id}/historial`);
    }
};