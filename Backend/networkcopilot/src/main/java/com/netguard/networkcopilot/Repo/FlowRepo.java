package com.netguard.networkcopilot.Repo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.netguard.networkcopilot.Entity.Flow;

public interface FlowRepo extends JpaRepository<Flow, Integer> {
    List<Flow> findByTimestampAfterOrderByTimestampAsc(LocalDateTime after);
    List<Flow> findByPredictionNotAndTimestampAfterOrderByTimestampAsc(String prediction, LocalDateTime after);

    @Query("SELECT f FROM Flow f ORDER BY f.timestamp DESC LIMIT :limit")
    List<Flow> findLatest(@Param("limit") int limit);
 
    @Query("SELECT f FROM Flow f WHERE f.prediction != 'BENIGN' ORDER BY f.timestamp DESC LIMIT :limit")
    List<Flow> findLatestAnomalies(@Param("limit") int limit);

    @Query("SELECT f FROM Flow f WHERE f.srcIp = :ip OR f.dstIp = :ip ORDER BY f.timestamp DESC LIMIT :limit")
    List<Flow> findByIpAddress(@Param("ip") String ip, @Param("limit") int limit);

    @Query("SELECT f FROM Flow f WHERE f.srcPort = :port OR f.dstPort = :port ORDER BY f.timestamp DESC LIMIT :limit")
    List<Flow> findByPort(@Param("port") Integer port, @Param("limit") int limit);

    @Query("SELECT f FROM Flow f WHERE LOWER(f.prediction) = LOWER(:attackType) ORDER BY f.timestamp DESC LIMIT :limit")
    List<Flow> findByAttackType(@Param("attackType") String attackType, @Param("limit") int limit);

    @Query("SELECT f FROM Flow f WHERE f.prediction != 'BENIGN' AND f.confidence >= :minConfidence ORDER BY f.timestamp DESC LIMIT :limit")
    List<Flow> findHighConfidenceAnomalies(@Param("minConfidence") Double minConfidence, @Param("limit") int limit);
}
