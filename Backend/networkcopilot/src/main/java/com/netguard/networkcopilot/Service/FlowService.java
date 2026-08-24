package com.netguard.networkcopilot.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.netguard.networkcopilot.Entity.Flow;
import com.netguard.networkcopilot.Repo.FlowRepo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlowService {

    private final FlowRepo flowRepo;

    public Flow save(Flow flow) {
        return flowRepo.save(flow);
    }

    public List<Flow> saveAll(List<Flow> flows) {
        return flowRepo.saveAll(flows);
    }

    public List<Flow> getAll() {
        return flowRepo.findAll();
    }

    public Flow getById(Integer id) {
        return flowRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Flow not found: " + id));
    }

    public List<Flow> getLatest(int limit) {
        return flowRepo.findLatest(limit);
    }

    public List<Flow> getLatestAnomalies(int limit) {
        return flowRepo.findLatestAnomalies(limit);
    }

    public List<Flow> getFlowsAfter(LocalDateTime after) {
        return flowRepo.findByTimestampAfterOrderByTimestampAsc(after);
    }

    public List<Flow> getAttacksAfter(LocalDateTime after) {
        return flowRepo.findByPredictionNotAndTimestampAfterOrderByTimestampAsc(
                "BENIGN", after);
    }

    public List<Flow> getFlowsLastMinutes(int minutes) {
        LocalDateTime since = LocalDateTime.now().minusMinutes(minutes);
        return flowRepo.findByTimestampAfterOrderByTimestampAsc(since);
    }

    public Map<String, Object> getSummary() {
        LocalDateTime since = LocalDateTime.now().minusMinutes(60);
        List<Flow> recent = flowRepo.findByTimestampAfterOrderByTimestampAsc(since);

        long total   = recent.size();
        long attacks = recent.stream()
                .filter(f -> !"BENIGN".equals(f.getPrediction()))
                .count();
        long benign  = total - attacks;

        double avgAttackConfidence = recent.stream()
                .filter(f -> !"BENIGN".equals(f.getPrediction()))
                .mapToDouble(f -> f.getConfidence() != null ? f.getConfidence() : 0.0)
                .average()
                .orElse(0.0);

        Map<String, Long> breakdown = recent.stream()
                .collect(Collectors.groupingBy(
                        f -> f.getPrediction() != null ? f.getPrediction() : "UNKNOWN",
                        Collectors.counting()
                ));

        Map<String, Long> topSrcIps = recent.stream()
                .filter(f -> !"BENIGN".equals(f.getPrediction()))
                .collect(Collectors.groupingBy(
                        f -> f.getSrcIp() != null ? f.getSrcIp() : "unknown",
                        Collectors.counting()
                ));

        double attackRatio = total > 0 ? (double) attacks / total : 0.0;
        int healthScore = (int) Math.max(0, 100 - (attackRatio * 100));

        return Map.of(
                "totalFlows",          total,
                "attackFlows",         attacks,
                "benignFlows",         benign,
                "attackRatio",         String.format("%.2f%%", attackRatio * 100),
                "avgAttackConfidence", String.format("%.2f%%", avgAttackConfidence * 100),
                "predictionBreakdown", breakdown,
                "topAttackSrcIps",     topSrcIps,
                "healthScore",         healthScore,
                "windowMinutes",       60,
                "generatedAt",         LocalDateTime.now().toString()
        );
    }

    public void delete(Integer id) {
        flowRepo.deleteById(id);
    }

    public void deleteOlderThan(int days) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(days);
        List<Flow> old = flowRepo.findByTimestampAfterOrderByTimestampAsc(cutoff);
        log.info("Deleting {} flows older than {} days", old.size(), days);
        flowRepo.deleteAll(old);
    }
}