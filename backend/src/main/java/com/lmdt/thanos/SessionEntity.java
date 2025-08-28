package com.lmdt.thanos;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "session_state")
@Data
public class SessionEntity {
    @Id
    @GeneratedValue
    private UUID id;

    @Enumerated(EnumType.STRING)
    private Phase phase; // PHASE1/PHASE2/FINISHED

    private int hpCurrent;
    private int hpMax;
    private boolean locked;
    private int totalPlayers;

    private int p1NormalContrib;
    private int p1ExpertContrib;
    private int p2NormalContrib;
    private int p2ExpertContrib;

    // 🔽 Nuevo: segundo contador para Fase 2
    private int auxCurrent;
    private int auxMax;

    private Instant startedAt = Instant.now();
}
