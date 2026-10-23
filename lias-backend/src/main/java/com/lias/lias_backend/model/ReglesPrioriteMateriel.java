package com.lias.lias_backend.model;
import jakarta.persistence.*;
import lombok.*;
@Entity @Getter @Setter @NoArgsConstructor
public class ReglesPrioriteMateriel {
    @Id private Long id = 1L;
    private int poidsNecessite=30;
    private int poidsPriorite=20;
    private int poidsAnciennete=1;
    private int penaliteDejaRecu=50;
    private int poidsCritere=1;
}
