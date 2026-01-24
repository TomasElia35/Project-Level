package com.implement.backend.niv.services;

import com.implement.backend.niv.dto.NivelDTO;
import com.implement.backend.niv.entities.Detalle;
import com.implement.backend.niv.entities.Nivel;
import com.implement.backend.niv.repositories.DetalleRepository;
import com.implement.backend.niv.repositories.NivelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class NivelService {
    @Autowired
    private NivelRepository nivelRepository;


    @Autowired
    private DetalleRepository detalleRepository;


    //LISTAR: listamos por niveles
    public List<NivelDTO> listar(Long padreId) {
        List<Nivel> niveles;

        // 1. Buscamos la estructura (Carpetas/Items)
        if (padreId == null) {
            niveles = nivelRepository.findByPadreIsNull();
        } else {
            niveles = nivelRepository.findByPadreId(padreId);
        }

        // 2. Convertimos a DTO y buscamos la foto manualmente
        List<NivelDTO> resultado = new ArrayList<>();

        for (Nivel nivel : niveles) {
            NivelDTO dto = new NivelDTO();
            // Copiamos datos básicos
            dto.setId(nivel.getId());
            dto.setNombre(nivel.getNombre());
            dto.setTipo(nivel.getTipo());
            if (nivel.getPadre() != null) {
                dto.setPadreId(nivel.getPadre().getId());
            }

            // MAGIA: Si es un ÍTEM, vamos a buscar su última foto al otro repositorio
            if ("ITEM".equals(nivel.getTipo())) {
                List<Detalle> historial = detalleRepository.findByNivelIdOrderByFechaRegistroDesc(nivel.getId());
                if (!historial.isEmpty()) {
                    // Tomamos el primero (el más reciente)
                    dto.setUltimaImagenUrl(historial.get(0).getImagenUrl());
                    dto.setUltimaObservacion(historial.get(0).getObservacion());
                }
            }

            resultado.add(dto);
        }

        return resultado;
    }

    /*
    CREAR: Validamos restricciones de padre y guardamos configuración propia
    */
    @Transactional
    // Nota: Cambié los argumentos para recibir el DTO completo o agrego los nuevos parametros.
    // Para no romper tu controller, lo ideal es pasar el REQUEST completo o los nuevos args.
    // Aquí asumo que modificas la llamada para usar los datos nuevos.
    public Nivel crear(String nombre, Long padreId, String tipo, Boolean tieneRestriccion, Integer cantidadMaxima){
        Nivel nuevo = new Nivel();
        nuevo.setNombre(nombre);
        nuevo.setTipo(tipo);

        // --- LÓGICA DE VALIDACIÓN DEL PADRE (Restricción de llenado) ---
        if(padreId != null){
            Nivel padre = nivelRepository.findById(padreId)
                    .orElseThrow(() -> new IllegalArgumentException("Nivel padre no encontrado con id: " + padreId));

            if ("ITEM".equalsIgnoreCase(padre.getTipo())){
                throw new IllegalArgumentException("No se puede agregar un nivel hijo a un nivel de tipo ITEM");
            }

            // AQUI VERIFICAMOS LA RESTRICCIÓN DEL PADRE
            if (Boolean.TRUE.equals(padre.getTieneRestriccion())) {
                // Contamos cuántos hijos tiene el padre actualmente
                long cantidadActual = nivelRepository.countByPadreId(padreId);

                // Si la cantidad actual ya alcanzó (o superó) el máximo, error.
                // Nota: Usamos 0 si cantidadMaxima es null para evitar NullPointerException
                int maximoPermitido = (padre.getCantidadMaxima() != null) ? padre.getCantidadMaxima() : 0;

                if (cantidadActual >= maximoPermitido) {
                    throw new IllegalArgumentException("No se puede agregar más ítems. La carpeta '"
                            + padre.getNombre() + "' ha alcanzado su límite de " + maximoPermitido + " elementos.");
                }
            }

            nuevo.setPadre(padre);
        } else {
            nuevo.setPadre(null);
        }

        // --- LÓGICA DE CONFIGURACIÓN PROPIA (Si soy carpeta con restricción) ---
        if ("CARPETA".equalsIgnoreCase(tipo)) {
            // Guardamos si esta carpeta tendrá restricción para sus futuros hijos
            nuevo.setTieneRestriccion(Boolean.TRUE.equals(tieneRestriccion));
            if (Boolean.TRUE.equals(tieneRestriccion)) {
                if (cantidadMaxima == null || cantidadMaxima < 0) {
                    throw new IllegalArgumentException("Si habilita la restricción, debe ingresar una cantidad máxima válida.");
                }
                nuevo.setCantidadMaxima(cantidadMaxima);
            } else {
                nuevo.setCantidadMaxima(null);
            }
        } else {
            // Los items no restringen nada porque no tienen hijos
            nuevo.setTieneRestriccion(false);
            nuevo.setCantidadMaxima(null);
        }

        return nivelRepository.save(nuevo);
    }

    /*
     ACTUALIZAR: Solo permitimos cambiar el nombre. No esta implementado cambiar tipo o padre.
    */
    @Transactional
    public Nivel actualizar(Long id, String nuevoNombre) {
        Nivel nivel = obtenerPorId(id);
        nivel.setNombre(nuevoNombre);
        return nivelRepository.save(nivel);
    }

    /*
     ELIMINAR: Borrar todo el nivel. Si no existe, lanza excepción.
    */
    @Transactional
    public void eliminar(Long id) {
        if (!nivelRepository.existsById(id)) {
            throw new IllegalArgumentException("No se puede eliminar. El nivel con id " + id + " no existe.");
        }

        // 1. PRIMERO: Eliminamos los detalles (fotos/obs) asociados a este nivel
        // Esto evita el error de Constraint FK_Detalle_Nivel
        List<Detalle> detalles = detalleRepository.findByNivelIdOrderByFechaRegistroDesc(id);
        if (!detalles.isEmpty()) {
            detalleRepository.deleteAll(detalles);
        }

        // 2. LUEGO: Eliminamos el nivel (Ahora sí nos dejará la BD)
        nivelRepository.deleteById(id);
    }

    /*
    Obtener id
    */
    public Nivel obtenerPorId(Long id){
        return nivelRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Nivel no encontrado con id: " + id));
    }
}
