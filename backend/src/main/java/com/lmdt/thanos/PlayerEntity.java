package com.lmdt.thanos;

import jakarta.persistence.*;
import lombok.Data;
import java.util.UUID;

@Entity
@Table(name = "players")
@Data
public class PlayerEntity {
    @Id
    @GeneratedValue
    private UUID id;
    private UUID tableId;
    private String hero;
    private String aspect;
}
