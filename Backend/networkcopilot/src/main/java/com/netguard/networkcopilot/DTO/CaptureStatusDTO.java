package com.netguard.networkcopilot.DTO;

public record CaptureStatusDTO(
    boolean running,
    String interfaceId,
    String interfaceName,
    String startedAt,
    Integer duration,
    String message
) {
}
