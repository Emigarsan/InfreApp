package com.lmdt.thanos;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
class SessionService {
  private final SessionRepo sessionRepo;
  private final TableRepo tableRepo;
  private final SimpMessagingTemplate broker;

  @Value("${app.p1.normal:16}")
  private int p1NormalDefault;
  @Value("${app.p1.expert:23}")
  private int p1ExpertDefault;
  @Value("${app.p2.normal:23}")
  private int p2NormalDefault;
  @Value("${app.p2.expert:26}")
  private int p2ExpertDefault;
  @Value("${app.indicator.k:5}")
  private int indicatorK; // multiplicador para aux

  private SessionEntity getOrCreate() {
    return sessionRepo.findTop1ByOrderByStartedAtDesc().orElseGet(() -> {
      SessionEntity s = new SessionEntity();
      s.setPhase(Phase.PHASE1);
      s.setLocked(true);
      s.setP1NormalContrib(p1NormalDefault);
      s.setP1ExpertContrib(p1ExpertDefault);
      s.setP2NormalContrib(p2NormalDefault);
      s.setP2ExpertContrib(p2ExpertDefault);
      s.setHpCurrent(0);
      s.setHpMax(0);
      s.setAuxCurrent(0);
      s.setAuxMax(0);
      s.setTotalPlayers(0);
      return sessionRepo.save(s);
    });
  }

  @Transactional
  public SessionEntity start(Integer p1N, Integer p1E, Integer p2N, Integer p2E) {
    SessionEntity s = getOrCreate();
    s.setP1NormalContrib(p1N != null ? p1N : p1NormalDefault);
    s.setP1ExpertContrib(p1E != null ? p1E : p1ExpertDefault);
    s.setP2NormalContrib(p2N != null ? p2N : p2NormalDefault);
    s.setP2ExpertContrib(p2E != null ? p2E : p2ExpertDefault);

    var tables = tableRepo.findAll();
    int hpMax = tables.stream()
        .mapToInt(t -> t.getMode() == Mode.NORMAL ? s.getP1NormalContrib() * t.getPlayerCount()
            : s.getP1ExpertContrib() * t.getPlayerCount())
        .sum();
    int totalPlayers = tables.stream().mapToInt(TableEntity::getPlayerCount).sum();

    s.setPhase(Phase.PHASE1);
    s.setLocked(false);
    s.setHpMax(hpMax);
    s.setHpCurrent(hpMax);
    s.setTotalPlayers(totalPlayers);
    // Fase 1: aux no se usa
    s.setAuxMax(0);
    s.setAuxCurrent(0);

    sessionRepo.saveAndFlush(s);
    publish(s);
    return s;
  }

  // 🔽 Ajuste de la vida principal (Fase 1 / Fase 2)
  @Transactional
  public SessionEntity adjust(int delta) {
    SessionEntity latest = getOrCreate();
    SessionEntity s = sessionRepo.lockById(latest.getId()).orElse(latest);

    if (s.getPhase() == Phase.FINISHED) {
      publish(s);
      return s;
    }

    int next = s.getHpCurrent() + delta;
    if (next < 0)
      next = 0;
    s.setHpCurrent(next);

    // 🔒 Si llega a 0 en Fase 1, solo bloquea (NO avanzar aquí)
    if (s.getPhase() == Phase.PHASE1 && next == 0) {
      s.setLocked(true);
    }

    // Si es Fase 2 y llega a 0, FINISHED (si así lo quieres)
    if (s.getPhase() == Phase.PHASE2 && next == 0) {
      s.setLocked(true);
      s.setPhase(Phase.FINISHED);
    }

    sessionRepo.saveAndFlush(s);
    publish(s);
    return s;
  }

  sessionRepo.saveAndFlush(s);

  publish(s);
    return s;
  }

  // 🔽 Ajuste del segundo contador en Fase 2
  @Transactional
  public SessionEntity adjustAux(int delta) {
    SessionEntity latest = getOrCreate();
    SessionEntity s = sessionRepo.lockById(latest.getId()).orElse(latest);

    if (s.getPhase() != Phase.PHASE2 || s.isLocked()) {
      publish(s);
      return s;
    }

    int next = s.getAuxCurrent() + delta;
    if (next < 0)
      next = 0;
    s.setAuxCurrent(next);

    sessionRepo.saveAndFlush(s);
    publish(s);
    return s;
  }

  @Transactional
  public SessionEntity advanceToPhase2() {
    SessionEntity s = getOrCreate();
    s = sessionRepo.lockById(s.getId()).orElse(s);
    return advanceToPhase2Internal(s);
  }

  private SessionEntity advanceToPhase2Internal(SessionEntity s) {
    var tables = tableRepo.findAll();
    int hpMax = tables.stream()
        .mapToInt(t -> t.getMode() == Mode.NORMAL ? s.getP2NormalContrib() * t.getPlayerCount()
            : s.getP2ExpertContrib() * t.getPlayerCount())
        .sum();
    int totalPlayers = tables.stream().mapToInt(TableEntity::getPlayerCount).sum();

    s.setPhase(Phase.PHASE2);
    s.setLocked(false);
    s.setHpMax(hpMax);
    s.setHpCurrent(hpMax);
    s.setTotalPlayers(totalPlayers);

    // 🔥 Segundo contador: por ejemplo totalPlayers * indicatorK
    // int auxMax = 2 + (totalPlayers * Math.max(1, indicatorK));
    int auxMax = tables.stream()
        .mapToInt(t -> 2 + (t.getPlayerCount() * indicatorK)).sum();
    s.setAuxMax(auxMax);
    s.setAuxCurrent(auxMax);

    sessionRepo.saveAndFlush(s);
    publish(s);
    return s;
  }

  @Transactional
  public SessionEntity reset() {
    SessionEntity s = getOrCreate();
    var tables = tableRepo.findAll();

    int hpMax = tables.stream()
        .mapToInt(t -> t.getMode() == Mode.NORMAL ? s.getP1NormalContrib() : s.getP1ExpertContrib()).sum();
    int totalPlayers = tables.stream().mapToInt(TableEntity::getPlayerCount).sum();

    s.setPhase(Phase.PHASE1);
    s.setLocked(false);
    s.setHpMax(hpMax);
    s.setHpCurrent(hpMax);
    s.setTotalPlayers(totalPlayers);
    s.setAuxMax(0);
    s.setAuxCurrent(0);

    sessionRepo.saveAndFlush(s);
    publish(s);
    return s;
  }

  private void publish(SessionEntity s) {
    broker.convertAndSend("/topic/session", SessionDto.from(s));
  }
}
