package com.lmdt.thanos;

import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;
import java.util.*;

@Repository
interface TableRepo extends JpaRepository<TableEntity, UUID> {}

@Repository
interface PlayerRepo extends JpaRepository<PlayerEntity, UUID> {
  List<PlayerEntity> findByTableId(UUID tableId);
}

@Repository
interface SessionRepo extends JpaRepository<SessionEntity, UUID> {
  Optional<SessionEntity> findTop1ByOrderByStartedAtDesc();

  @Lock(LockModeType.PESSIMISTIC_WRITE)
  @Query("select s from SessionEntity s where s.id = :id")
  Optional<SessionEntity> lockById(@Param("id") UUID id);
}
