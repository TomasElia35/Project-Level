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
    CREAR: Validamos que no sea un item, ya que si lo es no puede tener cosas que hereden de esta y si el padre no existe tampoco funciona
    */
    @Transactional
    public Nivel crear(String nombre, Long padreId, String tipo){
        Nivel nuevo = new Nivel();
        nuevo.setNombre(nombre);
        nuevo.setTipo(tipo);
        if(padreId!=null){
            Nivel padre = nivelRepository.findById(padreId)
                    .orElseThrow(() -> new IllegalArgumentException("Nivel padre no encontrado con id: " + padreId));
            if ("ITEM".equalsIgnoreCase(padre.getTipo())){
                throw new IllegalArgumentException("No se puede agregar un nivel hijo a un nivel de tipo ITEM");
            }
            nuevo.setPadre(padre);
        }else {
            nuevo.setPadre(null);
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
    public void eliminar(Long id) {
        if (!nivelRepository.existsById(id)) {
            throw new IllegalArgumentException("No se puede eliminar. El nivel con id " + id + " no existe.");
        }
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
