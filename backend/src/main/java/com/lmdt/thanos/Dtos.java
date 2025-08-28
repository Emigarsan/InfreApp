package com.lmdt.thanos;

import java.util.UUID;

record TableDto(UUID id, String name, String mode, int playerCount) {
  static TableDto from(TableEntity t) {
    return new TableDto(t.getId(), t.getName(), t.getMode().name(), t.getPlayerCount());
  }
}

record PlayerDto(UUID id, UUID tableId, String hero, String aspect) {
  static PlayerDto from(PlayerEntity p) {
    return new PlayerDto(p.getId(), p.getTableId(), p.getHero(), p.getAspect());
  }
}

// 🔽 añadimos aux_current y aux_max
record SessionDto(String phase, int hp_current, int hp_max, boolean locked, int total_players,
    int aux_current, int aux_max) {
  static SessionDto from(SessionEntity s) {
    return new SessionDto(
        s.getPhase().name(),
        s.getHpCurrent(),
        s.getHpMax(),
        s.isLocked(),
        s.getTotalPlayers(),
        s.getAuxCurrent(),
        s.getAuxMax());
  }
}
