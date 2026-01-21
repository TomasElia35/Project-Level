package com.implement.backend.niv.dto;

import lombok.Data;

@Data
public class NivelDTO {
    private Long id;
    private String nombre;
    private String tipo;      // "CARPETA" o "ITEM"
    private Long padreId;

    private String ultimaImagenUrl;
    private String ultimaObservacion;
}