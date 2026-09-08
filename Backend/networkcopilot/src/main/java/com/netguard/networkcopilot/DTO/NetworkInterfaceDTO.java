package com.netguard.networkcopilot.DTO;

public record NetworkInterfaceDTO(
    String id,
    String name,
    String description,
    boolean isWifi
) {
}
