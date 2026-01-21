package com.implement.backend.niv.controllers;

import com.implement.backend.niv.dto.NivelDTO;
import com.implement.backend.niv.dto.NivelRequest; // Importa tu DTO
import com.implement.backend.niv.entities.Nivel;
import com.implement.backend.niv.services.NivelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ubicaciones") // <--- COINCIDE CON TU api.js
@CrossOrigin("*") // Permite peticiones desde React
public class NivelController {
    @Autowired
    private NivelService nivelService;

    @GetMapping
    public ResponseEntity<List<NivelDTO>> listar(@RequestParam(required = false) Long padreId) {
        return ResponseEntity.ok(nivelService.listar(padreId));
    }

    @PostMapping
    public ResponseEntity<Nivel> crear(@RequestBody NivelRequest request) {
        Nivel creado = nivelService.crear(request.getNombre(), request.getPadreId(), request.getTipo());
        return ResponseEntity.ok(creado);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Nivel> actualizar(@PathVariable Long id, @RequestBody NivelRequest request) {
        Nivel actualizado = nivelService.actualizar(id, request.getNombre());
        return ResponseEntity.ok(actualizado);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        nivelService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}