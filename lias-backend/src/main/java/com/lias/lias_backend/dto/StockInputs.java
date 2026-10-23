package com.lias.lias_backend.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.List;
public final class StockInputs {
    private StockInputs() {}
    public record Beneficiaire(@NotBlank @Size(max=100) String nom,@NotBlank @Size(max=100) String prenom,@Size(max=200) String service,Long membreId) {}
    public record Demande(@NotNull Long beneficiaireId,@NotNull Long materielId,@Min(1) @Max(1000000) int quantite,
        @Min(1) @Max(5) int priorite,@Min(1) @Max(5) int necessite,@Min(0) @Max(100) int critereSpecifique,
        @NotBlank @Size(max=2000) String motif,@NotNull @PastOrPresent LocalDate dateDemande,
        @NotBlank @Size(max=100) String cleOperation) {}
    public record Reception(@NotNull Long materielId,@Min(1) @Max(1000000) int quantite,@NotNull @PastOrPresent LocalDate dateReception,
        @Size(max=2000) String remarques,@NotBlank @Size(max=100) String cleOperation) {}
    public record Ligne(@NotNull Long demandeId,@Min(1) @Max(1000000) int quantite) {}
    public record Validation(@NotNull Long materielId,@NotEmpty @Size(max=1000) List<@Valid Ligne> lignes,
        @NotBlank @Size(max=60) String cleOperation,@Size(max=2000) String remarques) {}
    public record Decision(@NotBlank String statut,@NotBlank @Size(max=2000) String motif) {}
    public record Ordre(@Min(1) Integer rang,@NotBlank @Size(max=2000) String motif) {}
    public record Motif(@NotBlank @Size(max=2000) String motif) {}
    public record Regles(@Min(0) @Max(100) int poidsNecessite,@Min(0) @Max(100) int poidsPriorite,
        @Min(0) @Max(100) int poidsAnciennete,@Min(0) @Max(1000) int penaliteDejaRecu,@Min(0) @Max(100) int poidsCritere,
        @NotBlank @Size(max=2000) String motif) {}
}
