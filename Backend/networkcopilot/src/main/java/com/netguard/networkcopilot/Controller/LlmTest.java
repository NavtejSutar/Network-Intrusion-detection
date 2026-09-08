package com.netguard.networkcopilot.Controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.netguard.networkcopilot.DTO.FlowAnalysis;
import com.netguard.networkcopilot.Service.FlowService;
import com.netguard.networkcopilot.Service.LlmService;

import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/copilot")
public class LlmTest {
    private final ChatClient chatClient;
    private final LlmService llmService;
    private final ChatMemory chatMemory;
    private final FlowService flowService;

    public LlmTest(
        ChatClient chatClient, ChatMemory chatMemory, LlmService llmService, FlowService flowService
    ){
        this.chatClient= chatClient;
        this.chatMemory=chatMemory;
        this.llmService= llmService;
        this.flowService= flowService;
    }

    @GetMapping("/analyze")
    public FlowAnalysis getAnalysisById(@RequestParam Integer id){
        return llmService.analyzeById(id);
    }

    @GetMapping("/test")
    public String generate(
        @RequestParam(defaultValue="MLPS") String prompt
    ){
        return chatClient
            .prompt()
            .system("""
                    You are an expert Network Operations Center AI Copilot.

                    Your job is to help network engineers understand
                    MPLS networks, routing, network failures, anomalies,
                    and telemetry.

                    Give technically accurate but easy-to-understand answers.
                    Do not invent network data.
                    """)
            .user("Explain the following in technical terms"+prompt)
            .call()
            .content();
    }

    @GetMapping("/chat")
    public Flux<String> chat(
            @RequestParam String prompt,
            @RequestParam(defaultValue = "default") String conversationId) {

        return chatClient
                .prompt()
                .tools(flowService)
                .advisors(advisor -> advisor
                        .param(ChatMemory.CONVERSATION_ID, conversationId)
                )
                .system("""
                        You are an expert Network Operations Center (NOC) and Intrusion Detection AI Copilot.

                        You have direct access to tools for querying live network telemetry and intrusion records:
                        - getSummary(): Overall traffic summary, health score, total flows, attacks, and top malicious source IPs.
                        - getLatestSummary(limit): View recent network flows.
                        - getLatestAnomaliesSummary(limit): View recent detected threats, attack types, and confidence scores.
                        - getFlowsByIp(ipAddress, limit): Search flows involving a specific IP (source or destination).
                        - getFlowsByPort(port, limit): Inspect flows communicating over a specific port number.
                        - getFlowsByAttackType(attackType, limit): Query flows by threat classification (e.g., DDoS, PortScan, Bot, Infiltration).
                        - getHighConfidenceAnomalies(minConfidence, limit): Query threats exceeding a confidence threshold.
                        - getRecentFlowsSummary(minutes): Query telemetry recorded in the last N minutes.
                        - getById(id): Deeply inspect a specific flow's 15 XGBoost features.

                        Always use your tools when asked about current network state, IPs, anomalies, or telemetry.
                        Format your answers clearly using Markdown headers, bullet points, and tables.
                        Do not invent network data.
                        """)
                .user(prompt)
                .stream()
                .content();
    }
}
