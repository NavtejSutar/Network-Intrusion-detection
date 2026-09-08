package com.netguard.networkcopilot.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.ai.tool.annotation.Tool;
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

    private com.netguard.networkcopilot.DTO.FlowSummaryDTO toSummaryDto(Flow f) {
        return new com.netguard.networkcopilot.DTO.FlowSummaryDTO(
                f.getId(),
                f.getTimestamp() != null ? f.getTimestamp().toString() : null,
                f.getPrediction(),
                f.getConfidence(),
                f.getSrcIp(),
                f.getDstIp(),
                f.getSrcPort(),
                f.getDstPort(),
                f.getProtocol(),
                f.getDuration(),
                f.getTotalPackets(),
                f.getTotalBytes()
        );
    }

    public List<Flow> getLatest(int limit) {
        return flowRepo.findLatest(limit > 0 ? limit : 20);
    }

    public List<Flow> getLatestAnomalies(int limit) {
        return flowRepo.findLatestAnomalies(limit > 0 ? limit : 20);
    }

    public List<Flow> getFlowsLastMinutes(int minutes) {
        int mins = minutes > 0 ? minutes : 10;
        LocalDateTime since = LocalDateTime.now().minusMinutes(mins);
        return flowRepo.findByTimestampAfterOrderByTimestampAsc(since);
    }

    @Tool(description="Get Flow By id. It will give the entire flow in json format by just giving the id. If flow is not found it will give Flow not found")
    public Flow getById(Integer id) {
        return flowRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Flow not found: " + id));
    }

    @Tool(description="Get latest network flows up to a specified limit count (maximum 10)")
    public List<com.netguard.networkcopilot.DTO.FlowSummaryDTO> getLatestSummary(int limit) {
        int max = Math.min(Math.max(limit, 1), 10);
        return flowRepo.findLatest(max).stream().map(this::toSummaryDto).collect(Collectors.toList());
    }

    @Tool(description="Get all latest detected anomalies and malicious flows up to a specified limit (maximum 10)")
    public List<com.netguard.networkcopilot.DTO.FlowSummaryDTO> getLatestAnomaliesSummary(int limit) {
        int max = Math.min(Math.max(limit, 1), 10);
        return flowRepo.findLatestAnomalies(max).stream().map(this::toSummaryDto).collect(Collectors.toList());
    }

    @Tool(description="Search network flows associated with a specific IP address (source or destination, maximum 10)")
    public List<com.netguard.networkcopilot.DTO.FlowSummaryDTO> getFlowsByIp(String ipAddress, int limit) {
        int max = Math.min(Math.max(limit, 1), 10);
        return flowRepo.findByIpAddress(ipAddress, max).stream().map(this::toSummaryDto).collect(Collectors.toList());
    }

    @Tool(description="Search network flows by port number (source or destination port, maximum 10)")
    public List<com.netguard.networkcopilot.DTO.FlowSummaryDTO> getFlowsByPort(int port, int limit) {
        int max = Math.min(Math.max(limit, 1), 10);
        return flowRepo.findByPort(port, max).stream().map(this::toSummaryDto).collect(Collectors.toList());
    }

    @Tool(description="Find network flows by attack classification type, such as DDoS, PortScan, Bot, Infiltration (maximum 10)")
    public List<com.netguard.networkcopilot.DTO.FlowSummaryDTO> getFlowsByAttackType(String attackType, int limit) {
        int max = Math.min(Math.max(limit, 1), 10);
        return flowRepo.findByAttackType(attackType, max).stream().map(this::toSummaryDto).collect(Collectors.toList());
    }

    @Tool(description="Find high-confidence anomalies above a minimum confidence percentage threshold (maximum 10)")
    public List<com.netguard.networkcopilot.DTO.FlowSummaryDTO> getHighConfidenceAnomalies(double minConfidence, int limit) {
        int max = Math.min(Math.max(limit, 1), 10);
        return flowRepo.findHighConfidenceAnomalies(minConfidence, max).stream().map(this::toSummaryDto).collect(Collectors.toList());
    }

    public List<Flow> getFlowsAfter(LocalDateTime after) {
        return flowRepo.findByTimestampAfterOrderByTimestampAsc(after);
    }

    public List<Flow> getAttacksAfter(LocalDateTime after) {
        return flowRepo.findByPredictionNotAndTimestampAfterOrderByTimestampAsc(
                "BENIGN", after);
    }

    @Tool(description="Get recent network flows recorded within the last specified number of minutes (returns up to 10)")
    public List<com.netguard.networkcopilot.DTO.FlowSummaryDTO> getRecentFlowsSummary(int minutes) {
        int mins = Math.min(Math.max(minutes, 1), 60);
        LocalDateTime since = LocalDateTime.now().minusMinutes(mins);
        return flowRepo.findByTimestampAfterOrderByTimestampAsc(since).stream()
                .limit(10)
                .map(this::toSummaryDto)
                .collect(Collectors.toList());
    }

    @Tool(description="It gives the summary of network flows in the last 60 minutes including total flows, attacks, benign count, attack ratio, health score, and top 5 source IPs")
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
                )).entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

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
                "windowMinutes",       60
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