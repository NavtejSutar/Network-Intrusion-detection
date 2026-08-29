package com.netguard.networkcopilot.DTO;

public record FlowAnalysis(
    String prediction,
    String severity,
    Double confidence,
    String reason,
    String recommendation
) {
    
}
