package com.netguard.networkcopilot.Controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.netguard.networkcopilot.Entity.Flow;
import com.netguard.networkcopilot.Service.FlowService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/flows")
@CrossOrigin(origins = "*")   // allows React frontend on different port
@RequiredArgsConstructor
@Slf4j
public class FlowController {

    private final FlowService flowService;

    // ── POST /api/flows ───────────────────────────────────────
    // Save a single flow (called by FastAPI or CSV poller)
    @PostMapping
    public ResponseEntity<Flow> saveFlow(@RequestBody Flow flow) {
        flow.setTimestamp(LocalDateTime.now());
        Flow saved = flowService.save(flow);
        log.info("Flow saved — prediction: {}, src: {}, dst: {}",
                saved.getPrediction(), saved.getSrcIp(), saved.getDstIp());
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> saveFlowsBatch(
            @RequestBody List<Flow> flows) {

        flows.forEach(f -> {
            if (f.getTimestamp() == null) {
                f.setTimestamp(LocalDateTime.now());
            }
        });

        List<Flow> saved = flowService.saveAll(flows);

        long attacks = saved.stream()
                .filter(f -> !"BENIGN".equals(f.getPrediction()))
                .count();

        log.info("Batch saved {} flows — {} attacks detected", saved.size(), attacks);

        return ResponseEntity.ok(Map.of(
                "saved",   saved.size(),
                "attacks", attacks,
                "benign",  saved.size() - attacks
        ));
    }

    @GetMapping
    public ResponseEntity<List<Flow>> getAllFlows() {
        return ResponseEntity.ok(flowService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Flow> getFlowById(@PathVariable Integer id) {
        try {
            return ResponseEntity.ok(flowService.getById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/latest")
    public ResponseEntity<List<Flow>> getLatest(
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(flowService.getLatest(limit));
    }

    @GetMapping("/anomalies")
    public ResponseEntity<List<Flow>> getAnomalies(
            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(flowService.getLatestAnomalies(limit));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Flow>> getRecentFlows(
            @RequestParam(defaultValue = "10") int minutes) {
        return ResponseEntity.ok(flowService.getFlowsLastMinutes(minutes));
    }

    @GetMapping("/attacks")
    public ResponseEntity<List<Flow>> getRecentAttacks(
            @RequestParam(defaultValue = "60") int minutes) {
        LocalDateTime since = LocalDateTime.now().minusMinutes(minutes);
        return ResponseEntity.ok(flowService.getAttacksAfter(since));
    }

    @GetMapping("/after")
    public ResponseEntity<List<Flow>> getFlowsAfter(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
            LocalDateTime timestamp) {
        return ResponseEntity.ok(flowService.getFlowsAfter(timestamp));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary() {
        return ResponseEntity.ok(flowService.getSummary());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteFlow(
            @PathVariable Integer id) {
        try {
            flowService.delete(id);
            return ResponseEntity.ok(Map.of("message", "Flow " + id + " deleted"));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/cleanup")
    public ResponseEntity<Map<String, String>> cleanup(
            @RequestParam(defaultValue = "7") int days) {
        flowService.deleteOlderThan(days);
        return ResponseEntity.ok(Map.of(
                "message", "Deleted flows older than " + days + " days"
        ));
    }
}