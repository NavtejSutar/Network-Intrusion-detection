package com.netguard.networkcopilot.Repo;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.netguard.networkcopilot.Entity.Flow;


public interface FlowRepo extends JpaRepository<Flow, Integer>{
    List<Flow> findByTimestampAfterOrderByTimestampAsc(LocalDateTime after);
    List<Flow> findByPredictionNotAndTimestampAfterOrderByTimestampAsc(String prediction, LocalDateTime after);

    @Query("SELECT f FROM Flow f ORDER BY f.timestamp DESC LIMIT :limit")
    List<Flow> findLatest(int limit);
 
    @Query("SELECT f FROM Flow f WHERE f.prediction != 'BENIGN' ORDER BY f.timestamp DESC LIMIT :limit")
    List<Flow> findLatestAnomalies(int limit);

}
