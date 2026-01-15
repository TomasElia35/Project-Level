package com.implement.backend.niv.repositories;

import com.implement.backend.niv.entities.Nivel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NivelRepository extends JpaRepository<Nivel, Long> {
    /*
     Para llamar a aquellos que no tienen padre y mostrarlos al principio
     */

    List<Nivel> findByPadreIsNull();

    /*
     Para traer a los hijos de un nivel en específico
    */

    List<Nivel> findByPadreId(Long padreId);

}
