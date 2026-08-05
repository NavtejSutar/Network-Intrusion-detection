package com.netguard.networkcopilot;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
public class TestController {
    
    @Value("${DB_PASSWORD:NOT_FOUND}")
    private String hmm;

    @GetMapping("/test")
    public String t(){
        return hmm;
    }
}
