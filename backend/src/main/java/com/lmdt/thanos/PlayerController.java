package com.lmdt.thanos;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {
  private final PlayerRepo playerRepo;

  // Exportar como JSON
  @GetMapping("/export")
  public List<PlayerDto> exportPlayers() {
    return playerRepo.findAll().stream().map(PlayerDto::from).toList();
  }

  // Exportar como CSV
  @GetMapping(value = "/export/csv", produces = "text/csv")
  public String exportPlayersCsv() {
    var sb = new StringBuilder();
    sb.append("Mesa,Heroe,Aspecto\n");
    playerRepo.findAll().forEach(p -> {
      sb.append(p.getTableId()).append(",");
      sb.append(p.getHero()).append(",");
      sb.append(p.getAspect()).append("\n");
    });
    return sb.toString();
  }
}
