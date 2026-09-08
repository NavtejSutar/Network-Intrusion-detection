package com.netguard.networkcopilot.Service;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.netguard.networkcopilot.DTO.FlowPredictionResponse;
import com.netguard.networkcopilot.Entity.Flow;
import com.netguard.networkcopilot.Repo.FlowRepo;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class FlowPredictionService {

    private final FlowRepo flowRepo;
    private final ObjectMapper objectMapper;

    @Value("${ml.python.path:python}")
    private String pythonPath;

    @Value("${ml.script.path:ml/predict_csv.py}")
    private String scriptPath;

    public FlowPredictionResponse processAndPredictCsv(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded CSV file is empty");
        }

        Path tempIn = null;
        Path tempOut = null;
        try {
            tempIn = Files.createTempFile("flow_in_", ".csv");
            tempOut = Files.createTempFile("flow_out_", ".json");
            file.transferTo(tempIn.toFile());

            ProcessBuilder processBuilder = new ProcessBuilder(
                    pythonPath,
                    scriptPath,
                    tempIn.toAbsolutePath().toString(),
                    tempOut.toAbsolutePath().toString()
            );
            processBuilder.redirectErrorStream(true);

            Process process = processBuilder.start();
            String output = new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                log.error("ML prediction script failed with exit code {}: {}", exitCode, output);
                throw new RuntimeException("ML prediction failed: " + output);
            }

            List<Flow> flows = objectMapper.readValue(tempOut.toFile(), new TypeReference<List<Flow>>() {});

            LocalDateTime now = LocalDateTime.now();
            for (Flow flow : flows) {
                if (flow.getTimestamp() == null) {
                    flow.setTimestamp(now);
                }
            }

            List<Flow> savedFlows = flowRepo.saveAll(flows);

            int totalFlows = savedFlows.size();
            long attacksDetected = savedFlows.stream()
                    .filter(f -> f.getPrediction() != null && !"BENIGN".equalsIgnoreCase(f.getPrediction()))
                    .count();
            long benignFlows = totalFlows - attacksDetected;

            Map<String, Long> breakdown = savedFlows.stream()
                    .collect(Collectors.groupingBy(
                            f -> f.getPrediction() != null ? f.getPrediction() : "UNKNOWN",
                            Collectors.counting()
                    ));

            return new FlowPredictionResponse(
                    totalFlows,
                    attacksDetected,
                    benignFlows,
                    breakdown,
                    savedFlows
            );

        } catch (Exception e) {
            log.error("Error processing CSV flow file", e);
            throw new RuntimeException("Error processing CSV flow file: " + e.getMessage(), e);
        } finally {
            if (tempIn != null) {
                try {
                    Files.deleteIfExists(tempIn);
                } catch (Exception ignored) {
                }
            }
            if (tempOut != null) {
                try {
                    Files.deleteIfExists(tempOut);
                } catch (Exception ignored) {
                }
            }
        }
    }
}
