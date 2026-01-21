package com.implement.backend.niv.repositories;

import com.implement.backend.niv.entities.Nivel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NivelRepository extends JpaRepository<Nivel, Long> {
    List<Nivel> findByPadreIsNull();
    List<Nivel> findByPadreId(Long padreId);
}
