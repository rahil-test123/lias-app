package com.lias.lias_backend.repository;
import com.lias.lias_backend.model.AffectationStock;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AffectationStockRepository extends JpaRepository<AffectationStock,Long> {
    java.util.List<AffectationStock> findByMaterielId(Long materielId);
    java.util.List<AffectationStock> findByBeneficiaireId(Long beneficiaireId);
    java.util.Optional<AffectationStock> findByCleOperation(String cleOperation);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_READ)
    java.util.List<AffectationStock> findByDemandeId(Long demandeId);
    @org.springframework.data.jpa.repository.Query("select coalesce(sum(a.quantite),0) from AffectationStock a where a.materielId=:id and a.statut='ACTIVE'")
    Integer totalActif(Long id);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select a from AffectationStock a where a.id=:id")
    java.util.Optional<AffectationStock> verrouiller(Long id);
}
