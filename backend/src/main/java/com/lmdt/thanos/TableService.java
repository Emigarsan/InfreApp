package com.lmdt.thanos;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TableService {

    private final TableRepo tableRepo;
    private final PlayerRepo playerRepo;

    public List<TableEntity> list() {
        return tableRepo.findAll();
    }

    @Transactional
    public TableEntity create(String name, Mode mode, List<PlayerEntity> players) {
        TableEntity t = new TableEntity();
        t.setName(name);
        t.setMode(mode);
        t.setPlayerCount(players.size());
        tableRepo.save(t);

        for (PlayerEntity p : players) {
            p.setTableId(t.getId());
            playerRepo.save(p);
        }
        return t;
    }
}
