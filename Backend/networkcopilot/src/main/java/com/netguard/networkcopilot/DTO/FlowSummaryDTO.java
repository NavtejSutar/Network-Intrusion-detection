package com.netguard.networkcopilot.DTO;

public record FlowSummaryDTO(
    Integer id,
    String timestamp,
    String prediction,
    Double confidence,
    String srcIp,
    String dstIp,
    Integer srcPort,
    Integer dstPort,
    String protocol,
    Double duration,
    Integer totalPackets,
    Integer totalBytes
) {
}
