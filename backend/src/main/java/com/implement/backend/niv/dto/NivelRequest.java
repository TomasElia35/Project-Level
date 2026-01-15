package com.implement.backend.niv.dto; // O el paquete que uses

import lombok.Data;

@Data
public class NivelRequest {
    private String nombre;
    private Long padreId;
    private String tipo; // "CARPETA" o "ITEM"
}