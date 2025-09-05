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
    private final TableRepo tableRepo;

    // Exportar todos los jugadores como JSON (útil para debug)
    @GetMapping("/export")
    public List<PlayerDto> exportPlayers() {
        return playerRepo.findAll().stream().map(PlayerDto::from).toList();
    }

    // Exportar todos los jugadores como CSV
    @GetMapping(value = "/export/csv", produces = "text/csv")
    public String exportPlayersCsv() {
        var sb = new StringBuilder();
        sb.append("MesaID,Mesa,Modo,Heroe,Aspecto\n");

        playerRepo.findAll().forEach(p -> {
            TableEntity table = tableRepo.findById(p.getTableId()).orElse(null);

            String mesa = table != null ? table.getName() : "";
            String modo = table != null ? table.getMode().toString() : "";

            sb.append(p.getTableId()).append(",");
            sb.append(mesa).append(",");
            sb.append(modo).append(",");
            sb.append(p.getHero()).append(",");
            sb.append(p.getAspect()).append("\n");
        });

        return sb.toString();
    }
}
