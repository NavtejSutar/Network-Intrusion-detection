package com.netguard.networkcopilot.Service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import com.netguard.networkcopilot.DTO.FlowAnalysis;
import com.netguard.networkcopilot.Entity.Flow;
import com.netguard.networkcopilot.Repo.FlowRepo;

@Service
public class LlmService {
    
    private final ChatClient chatClient;
    private final FlowRepo flowRepo;

    public LlmService(
        ChatClient chatClient,FlowRepo flowRepo
    ){
        this.chatClient=chatClient;
        this.flowRepo= flowRepo;
    }

    public FlowAnalysis analyzeById(Integer id){
        Flow flow=flowRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Flow not found: " + id));

        return chatClient
                .prompt()
                .system("""
                        You are an expert Network Operations Center AI Copilot.

                        Analyze network flow data and determine whether the
                        traffic appears normal or suspicious.

                        Base your analysis ONLY on the provided data.

                        Return:
                        - prediction
                        - severity
                        - confidence
                        - reason
                        - recommendation

                        Do not invent network information.
                        """)
                .user("""
                        Analyze this network flow:

                        Source IP: %s
                        Destination IP: %s
                        Source Port: %d
                        Destination Port: %d
                        Protocol: %s

                        Duration: %s seconds
                        Total Packets: %d
                        Total Bytes: %d

                        ML Prediction: %s
                        ML Confidence: %s

                        BWD Packet Length Std: %s
                        Average Packet Size: %s
                        BWD Packet Length Mean: %s
                        BWD Header Length: %s
                        Packet Length Std: %s
                        Max Packet Length: %s
                        FWD Packet Length Max: %s
                        Flow Bytes/sec: %s
                        Total FWD Packets: %s
                        Total BWD Packets: %s
                        """.formatted(
                        flow.getSrcIp(),
                        flow.getDstIp(),
                        flow.getSrcPort(),
                        flow.getDstPort(),
                        flow.getProtocol(),

                        flow.getDuration(),
                        flow.getTotalPackets(),
                        flow.getTotalBytes(),

                        flow.getPrediction(),
                        flow.getConfidence(),

                        flow.getBwdPacketLengthStd(),
                        flow.getAveragePacketSize(),
                        flow.getBwdPacketLengthMean(),
                        flow.getBwdHeaderLength(),
                        flow.getPacketLengthStd(),
                        flow.getMaxPacketLength(),
                        flow.getFwdPacketLengthMax(),
                        flow.getFlowBytesPerSec(),
                        flow.getTotalFwdPackets(),
                        flow.getTotalBackwardPackets()
                ))
                .call()
                .entity(FlowAnalysis.class);
    }
}
