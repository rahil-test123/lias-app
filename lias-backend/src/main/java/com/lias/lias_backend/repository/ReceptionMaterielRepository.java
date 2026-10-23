package com.lias.lias_backend.repository;
import com.lias.lias_backend.model.ReceptionMateriel;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ReceptionMaterielRepository extends JpaRepository<ReceptionMateriel,Long> {
    java.util.Optional<ReceptionMateriel> findByCleOperation(String cleOperation);
}
