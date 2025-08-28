package com.lmdt.thanos;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "tables")
@Data
public class TableEntity {
    @Id
    @GeneratedValue
    private UUID id;
    private String name;
    @Enumerated(EnumType.STRING)
    private Mode mode; // NORMAL/EXPERT
    private int playerCount;
    private Instant createdAt = Instant.now();
}
