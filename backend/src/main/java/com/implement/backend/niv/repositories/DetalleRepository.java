package com.implement.backend.niv.repositories;

import com.implement.backend.niv.entities.Detalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;

@Repository
public interface DetalleRepository extends JpaRepository<Detalle, Long> {

    /*
    Ordenamiento por fecha de registro descendente
    */

    List<Detalle> findByNivelIdOrderByFechaRegistroDesc(Long nivelId);
}
