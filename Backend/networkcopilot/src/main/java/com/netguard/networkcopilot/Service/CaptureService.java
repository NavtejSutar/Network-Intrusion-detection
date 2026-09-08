package com.netguard.networkcopilot.Service;

import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.netguard.networkcopilot.DTO.CaptureStatusDTO;
import com.netguard.networkcopilot.DTO.NetworkInterfaceDTO;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class CaptureService {

    @Value("${ml.python.path:python}")
    private String pythonPath;

    @Value("${ml.pipeline.path:ml/pipeline.py}")
    private String pipelinePath;

    private Process captureProcess;
    private String activeInterfaceId;
    private String activeInterfaceName;
    private String startedAt;

    private static final Pattern INTERFACE_PATTERN = Pattern.compile("^(\\d+)\\.\\s+(\\S+)(?:\\s+\\((.*)\\))?");

    public List<NetworkInterfaceDTO> getInterfaces() {
        List<NetworkInterfaceDTO> interfaces = new ArrayList<>();
        try {
            Process process = new ProcessBuilder("tshark", "-D").start();
            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(process.getInputStream(), StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty()) {
                        continue;
                    }
                    Matcher matcher = INTERFACE_PATTERN.matcher(line);
                    if (matcher.find()) {
                        String id = matcher.group(1);
                        String name = matcher.group(2);
                        String description = matcher.group(3) != null ? matcher.group(3) : name;
                        String descLower = description.toLowerCase();
                        boolean isWifi = descLower.contains("wi-fi") || descLower.contains("wifi") || descLower.contains("wireless");
                        interfaces.add(new NetworkInterfaceDTO(id, name, description, isWifi));
                    }
                }
            }
            process.waitFor();
        } catch (Exception e) {
            log.error("Error reading network interfaces from tshark -D", e);
        }
        return interfaces;
    }

    private Integer activeDuration = 30;

    public synchronized CaptureStatusDTO startCapture(String interfaceId, Integer duration) {
        if (captureProcess != null && captureProcess.isAlive()) {
            return new CaptureStatusDTO(
                    true,
                    activeInterfaceId,
                    activeInterfaceName,
                    startedAt,
                    activeDuration,
                    "Capture is already running on interface " + activeInterfaceName
            );
        }

        List<NetworkInterfaceDTO> interfaces = getInterfaces();
        String selectedId = interfaceId;
        String selectedName = "Auto-detected Wi-Fi";

        if (selectedId == null || selectedId.trim().isEmpty() || "auto".equalsIgnoreCase(selectedId)) {
            for (NetworkInterfaceDTO iface : interfaces) {
                if (iface.isWifi()) {
                    selectedId = iface.id();
                    selectedName = iface.description();
                    break;
                }
            }
            if (selectedId == null || "auto".equalsIgnoreCase(selectedId)) {
                selectedId = "5";
            }
        } else {
            for (NetworkInterfaceDTO iface : interfaces) {
                if (iface.id().equals(selectedId)) {
                    selectedName = iface.description();
                    break;
                }
            }
        }

        int dur = (duration != null && duration > 0) ? duration : 30;

        try {
            File pipelineFile = new File(pipelinePath);
            File workingDir = pipelineFile.getParentFile();
            if (workingDir == null) {
                workingDir = new File(".");
            }

            ProcessBuilder pb = new ProcessBuilder(
                    pythonPath,
                    pipelineFile.getAbsolutePath(),
                    "--interface", selectedId,
                    "--duration", String.valueOf(dur),
                    "--cycle", String.valueOf(dur)
            );
            pb.directory(workingDir);
            pb.redirectErrorStream(true);

            captureProcess = pb.start();
            activeInterfaceId = selectedId;
            activeInterfaceName = selectedName;
            activeDuration = dur;
            startedAt = LocalDateTime.now().toString();

            Thread drainThread = new Thread(() -> {
                try (BufferedReader r = new BufferedReader(new InputStreamReader(captureProcess.getInputStream(), StandardCharsets.UTF_8))) {
                    String l;
                    while ((l = r.readLine()) != null) {
                        log.info("[Pipeline] {}", l);
                    }
                } catch (Exception ignored) {
                }
            });
            drainThread.setDaemon(true);
            drainThread.start();

            log.info("Started packet capture pipeline on interface {} ({}) with duration {}s", selectedId, selectedName, dur);

            return new CaptureStatusDTO(
                    true,
                    activeInterfaceId,
                    activeInterfaceName,
                    startedAt,
                    activeDuration,
                    "Packet capture started on " + activeInterfaceName + " (Interface " + activeInterfaceId + ")"
            );
        } catch (Exception e) {
            log.error("Failed to start packet capture pipeline", e);
            return new CaptureStatusDTO(
                    false,
                    null,
                    null,
                    null,
                    null,
                    "Failed to start capture: " + e.getMessage()
            );
        }
    }

    public synchronized CaptureStatusDTO stopCapture() {
        if (captureProcess != null && captureProcess.isAlive()) {
            captureProcess.destroyForcibly();
            captureProcess = null;
            log.info("Stopped packet capture pipeline on interface {}", activeInterfaceId);
            return new CaptureStatusDTO(
                    false,
                    activeInterfaceId,
                    activeInterfaceName,
                    null,
                    activeDuration,
                    "Packet capture stopped successfully"
            );
        }
        return new CaptureStatusDTO(
                false,
                null,
                null,
                null,
                null,
                "No packet capture is currently active"
        );
    }

    public CaptureStatusDTO getStatus() {
        boolean running = captureProcess != null && captureProcess.isAlive();
        if (!running) {
            return new CaptureStatusDTO(
                    false,
                    activeInterfaceId,
                    activeInterfaceName,
                    null,
                    activeDuration,
                    "Idle - Capture not running"
            );
        }
        return new CaptureStatusDTO(
                true,
                activeInterfaceId,
                activeInterfaceName,
                startedAt,
                activeDuration,
                "Capturing on " + activeInterfaceName + " (Interface " + activeInterfaceId + ")"
        );
    }
}
