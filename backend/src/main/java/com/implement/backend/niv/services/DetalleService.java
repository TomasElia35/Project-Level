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
            // CAMBIO CLAVE: Usar la carpeta del usuario en lugar de C:/ directo
            // Esto apunta a: C:\Users\Tomas Elia\GondolaImagenes
            //String userHome = System.getProperty("user.home");
            String carpetaFisica = "\\\\\\\\192.168.1.94\\\\Videos\\\\Planograma";

            Path pathCarpeta = Paths.get(carpetaFisica);

            if (!Files.exists(pathCarpeta)) {
                Files.createDirectories(pathCarpeta);
            }

            String nombreArchivo = UUID.randomUUID().toString() + "_" + archivo.getOriginalFilename();
            Path rutaCompleta = pathCarpeta.resolve(nombreArchivo);

            Files.copy(archivo.getInputStream(), rutaCompleta);

            // La URL sigue igual para que el navegador la pida
            rutaFinalParaBD = "https://portal.hergo.com.ar:8099/imagenes/videos/Planograma/" + nombreArchivo;
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