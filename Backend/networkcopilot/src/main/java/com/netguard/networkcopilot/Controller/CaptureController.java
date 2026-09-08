package com.netguard.networkcopilot.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.netguard.networkcopilot.DTO.CaptureStatusDTO;
import com.netguard.networkcopilot.DTO.NetworkInterfaceDTO;
import com.netguard.networkcopilot.Service.CaptureService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/capture")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CaptureController {

    private final CaptureService captureService;

    @GetMapping("/interfaces")
    public ResponseEntity<List<NetworkInterfaceDTO>> getInterfaces() {
        return ResponseEntity.ok(captureService.getInterfaces());
    }

    @GetMapping("/status")
    public ResponseEntity<CaptureStatusDTO> getStatus() {
        return ResponseEntity.ok(captureService.getStatus());
    }

    @PostMapping("/start")
    public ResponseEntity<CaptureStatusDTO> startCapture(
            @RequestParam(required = false, defaultValue = "auto") String interfaceId,
            @RequestParam(required = false, defaultValue = "30") Integer duration) {
        return ResponseEntity.ok(captureService.startCapture(interfaceId, duration));
    }

    @PostMapping("/stop")
    public ResponseEntity<CaptureStatusDTO> stopCapture() {
        return ResponseEntity.ok(captureService.stopCapture());
    }
}
