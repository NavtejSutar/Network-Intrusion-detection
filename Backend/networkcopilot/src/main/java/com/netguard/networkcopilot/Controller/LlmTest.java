package com.netguard.networkcopilot.Controller;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/copilot")
public class LlmTest {
    private final ChatClient chatClient;
    private final OpenAiChatModel chatModel;

    public LlmTest(ChatClient chatClient, OpenAiChatModel chatModel){
        this.chatClient= chatClient;
        this.chatModel= chatModel;
    }

    @GetMapping("/test")
    public String generate(
        @RequestParam(defaultValue="TELL ME A DAD JOKE") String prompt
    ){
        return chatClient
            .prompt()
            .user(prompt)
            .call()
            .content();
    }

}
