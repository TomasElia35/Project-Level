package com.implement.backend.niv.dto;

import lombok.Data;

@Data
public class NivelDTO {
    private Long id;
    private String nombre;
    private String tipo;      // "CARPETA" o "ITEM"
    private Long padreId;

    // Estos campos NO existen en la entidad Nivel, pero los llenaremos en el servicio
    private String ultimaImagenUrl;
    private String ultimaObservacion;
}