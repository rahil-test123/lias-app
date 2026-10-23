package com.lias.lias_backend.repository;
import com.lias.lias_backend.model.DemandeMateriel;
import org.springframework.data.jpa.repository.JpaRepository;
public interface DemandeMaterielRepository extends JpaRepository<DemandeMateriel,Long> {
    boolean existsByMaterielId(Long materielId);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select d from DemandeMateriel d where d.id=:id")
    java.util.Optional<DemandeMateriel> verrouiller(Long id);
    java.util.Optional<DemandeMateriel> findByCleOperation(String cleOperation);
}
