package com.lias.lias_backend.repository;
import com.lias.lias_backend.model.BeneficiaireMateriel;
import org.springframework.data.jpa.repository.JpaRepository;
public interface BeneficiaireMaterielRepository extends JpaRepository<BeneficiaireMateriel,Long> {
    java.util.Optional<BeneficiaireMateriel> findByMembreId(Long membreId);
}
