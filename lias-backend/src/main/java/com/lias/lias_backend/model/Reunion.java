package com.lias.lias_backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity @Table(name="reunion") @Getter @Setter @NoArgsConstructor
public class Reunion {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
    @Column(nullable=false, length=200) private String titre;
    @Column(length=5000) private String description;
    @Column(nullable=false) private LocalDateTime dateHeure;
    @Column(length=300) private String lieu;
    @Column(length=1000) private String lien;
    @ElementCollection(fetch=FetchType.EAGER)
    @CollectionTable(name="reunion_participant", joinColumns=@JoinColumn(name="reunion_id"))
    @Column(name="membre_id") private Set<Long> participants = new HashSet<>();
    @JsonIgnore private String pv;
    public boolean isPvDisponible() { return pv != null; }
}
