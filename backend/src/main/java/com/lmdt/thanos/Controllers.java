package com.lmdt.thanos;

import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
class TableController {

  private final TableService tableService; // <- aquí

  @GetMapping
  public List<TableDto> list() {
    return tableService.list().stream().map(TableDto::from).collect(Collectors.toList());
  }

  @PostMapping
  public TableDto create(@RequestBody CreateTableReq req) {
    var players = req.players.stream().map(p -> {
      PlayerEntity pe = new PlayerEntity();
      pe.setHero(p.hero);
      pe.setAspect(p.aspect);
      return pe;
    }).collect(Collectors.toList());
    TableEntity t = tableService.create(req.name, Mode.valueOf(req.mode), players);
    return TableDto.from(t);
  }

  @Data
  static class CreateTableReq {
    public String name;
    public String mode; // NORMAL/EXPERT
    public List<PlayerReq> players;
  }

  @Data
  static class PlayerReq {
    public String hero;
    public String aspect;
  }
}

@RestController
@RequestMapping("/api/session")
@RequiredArgsConstructor
class SessionController {
  private final SessionService sessionService;
  private final SessionRepo sessionRepo;

  @GetMapping
  public SessionDto get() {
    return sessionRepo.findTop1ByOrderByStartedAtDesc().map(SessionDto::from).orElse(null);
  }

  @PostMapping("/start")
  public SessionDto start(@RequestBody StartReq r) {
    return SessionDto.from(sessionService.start(r.p1Normal, r.p1Expert, r.p2Normal, r.p2Expert));
  }

  @PostMapping("/adjust")
  public SessionDto adjust(@RequestBody AdjustReq r) {
    return SessionDto.from(sessionService.adjust(r.delta));
  }

  @PostMapping("/advance")
  public SessionDto advance() {
    return SessionDto.from(sessionService.advanceToPhase2());
  }

  @PostMapping("/adjustAux")
  public SessionDto adjustAux(@RequestBody AdjustReq r) {
    return SessionDto.from(sessionService.adjustAux(r.delta));
  }

  @PostMapping("/setHp")
  public SessionDto setHp(@RequestBody Map<String, Integer> body) {
    int value = body.getOrDefault("value", 0);
    return SessionDto.from(sessionService.setHp(value));
  }

  @Data
  static class StartReq {
    public Integer p1Normal, p1Expert, p2Normal, p2Expert;
  }

  @Data
  static class AdjustReq {
    public int delta;
  }
}
