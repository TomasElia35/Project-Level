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
import java.time.LocalDateTime; // Asegúrate de tener fecha si usas historial

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

            String carpetaFisica = "\\\\\\\\192.168.1.94\\\\Videos\\\\Planograma";
            Path pathCarpeta = Paths.get(carpetaFisica);

            if (!Files.exists(pathCarpeta)) {
                Files.createDirectories(pathCarpeta);
            }

            String nombreArchivo = UUID.randomUUID().toString() + "_" + archivo.getOriginalFilename();
            Path rutaCompleta = pathCarpeta.resolve(nombreArchivo);

            Files.copy(archivo.getInputStream(), rutaCompleta);

            rutaFinalParaBD = "https://portal.hergo.com.ar:8099/imagenes/videos/Planograma/" + nombreArchivo;

        } else {
            List<Detalle> historialPrevio = detalleRepository.findByNivelIdOrderByFechaRegistroDesc(nivelId);

            if (historialPrevio != null && !historialPrevio.isEmpty()) {
                rutaFinalParaBD = historialPrevio.get(0).getImagenUrl();
            }
        }

        Detalle detalle = new Detalle();
        detalle.setNivel(nivel);
        detalle.setImagenUrl(rutaFinalParaBD);
        detalle.setObservacion(observacion);
        detalleRepository.save(detalle);
    }

    public List<Detalle> obtenerHistorial(Long nivelId) {
        return detalleRepository.findByNivelIdOrderByFechaRegistroDesc(nivelId);
    }
}