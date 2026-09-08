package com.netguard.networkcopilot.DTO;

import java.util.List;
import java.util.Map;
import com.netguard.networkcopilot.Entity.Flow;

public record FlowPredictionResponse(
    int totalFlows,
    long attacksDetected,
    long benignFlows,
    Map<String, Long> breakdown,
    List<Flow> flows
) {
}
