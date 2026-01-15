package com.implement.backend.niv.services;

import com.implement.backend.niv.entities.Detalle;
import com.implement.backend.niv.entities.Nivel;
import com.implement.backend.niv.repositories.DetalleRepository;
import com.implement.backend.niv.repositories.NivelRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.List;

@Service
public class DetalleService {

    @Autowired
    private DetalleRepository detalleRepository;

    @Autowired
    private NivelRepository nivelRepository;

    @Transactional
    public void agregarDetalle(Long nivelId, MultipartFile archivo, String observacion) throws Exception {

        Nivel nivel = nivelRepository.findById(nivelId)
                .orElseThrow(() -> new RuntimeException("Nivel no encontrado"));

        String rutaFinalParaBD = null;

        if (archivo != null && !archivo.isEmpty()) {
            // 1. GUARDADO FÍSICO (EN EL DISCO C DEL SERVIDOR)
            // Esta es la "bóveda" real donde estarán los archivos.
            String carpetaFisica = "C:/GondolaImagenes";
            Path pathCarpeta = Paths.get(carpetaFisica);

            if (!Files.exists(pathCarpeta)) {
                Files.createDirectories(pathCarpeta);
            }

            // Generamos un nombre único para que no se pisen
            String nombreArchivo = UUID.randomUUID().toString() + "_" + archivo.getOriginalFilename();
            Path rutaCompleta = pathCarpeta.resolve(nombreArchivo);

            // Guardamos el archivo en el disco
            Files.copy(archivo.getInputStream(), rutaCompleta);

            // 2. GENERACIÓN DE LA URL (LO QUE PIDE TU JEFE/REQUERIMIENTO)
            // Aquí "forzamos" la URL exacta que solicitaste, sin importar si estás en localhost.
            // OJO: "Planograma" con P mayúscula como lo pusiste.
            rutaFinalParaBD = "https://portal.hergo.com.ar:8099/Imagenes/Planograma/" + nombreArchivo;
        }

        Detalle detalle = new Detalle();
        detalle.setNivel(nivel);
        detalle.setImagenUrl(rutaFinalParaBD); // Se guarda: https://portal.hergo...
        detalle.setObservacion(observacion);

        detalleRepository.save(detalle);
    }

    public List<Detalle> obtenerHistorial(Long nivelId) {
        return detalleRepository.findByNivelIdOrderByFechaRegistroDesc(nivelId);
    }
}