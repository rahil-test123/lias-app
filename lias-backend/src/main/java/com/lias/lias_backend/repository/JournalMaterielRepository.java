package com.lias.lias_backend.repository;
import com.lias.lias_backend.model.JournalMateriel;
import org.springframework.data.jpa.repository.JpaRepository;
public interface JournalMaterielRepository extends JpaRepository<JournalMateriel,Long> {
    java.util.List<JournalMateriel> findAllByOrderByDateOperationDesc();
}
