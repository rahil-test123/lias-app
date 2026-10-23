package com.lias.lias_backend.repository;
import com.lias.lias_backend.model.ReglesPrioriteMateriel;
import org.springframework.data.jpa.repository.JpaRepository;
public interface ReglesPrioriteMaterielRepository extends JpaRepository<ReglesPrioriteMateriel,Long> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select r from ReglesPrioriteMateriel r where r.id=1")
    java.util.Optional<ReglesPrioriteMateriel> verrouiller();
}
