package com.lias.lias_backend.model;
import jakarta.persistence.*;
import lombok.*;
import java.time.*;
@Entity @Getter @Setter @NoArgsConstructor
public class JournalMateriel {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    private LocalDateTime dateOperation;
    private String action;
    private String administrateur;
    private Long materielId;
    private Long demandeId;
    @Column(columnDefinition="TEXT") private String details;
}
