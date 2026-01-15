package com.implement.backend.niv.controllers;

import com.implement.backend.niv.dto.DetalleRequest; // Importa el DTO nuevo
import com.implement.backend.niv.entities.Detalle;
import com.implement.backend.niv.services.DetalleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ubicaciones")
@CrossOrigin("*")
public class DetalleController {

    @Autowired
    private DetalleService detalleService;

    @PostMapping(value = "/{id}/detalles", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> agregarDetalle(
            @PathVariable Long id,
            @RequestParam(value = "archivo", required = false) MultipartFile archivo,
            @RequestParam("observacion") String observacion) {

        try {
            detalleService.agregarDetalle(id, archivo, observacion);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/{id}/historial")
    public ResponseEntity<List<Detalle>> verHistorial(@PathVariable Long id) {
        return ResponseEntity.ok(detalleService.obtenerHistorial(id));
    }
}