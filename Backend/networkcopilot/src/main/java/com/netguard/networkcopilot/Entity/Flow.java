package com.netguard.networkcopilot.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Flow {
    
    @Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Integer Id;
    
    private LocalDateTime timestamp;

    private String prediction;

    private Double confidence;

    @Column(name = "bwd_packet_length_std")
    private Double bwdPacketLengthStd;

    @Column(name = "average_packet_size")
    private Double averagePacketSize;

    @Column(name = "bwd_packet_length_mean")
    private Double bwdPacketLengthMean;

    @Column(name = "bwd_header_length")
    private Double bwdHeaderLength;

    @Column(name = "packet_length_std")
    private Double packetLengthStd;

    @Column(name = "max_packet_length")
    private Double maxPacketLength;

    @Column(name = "fwd_packet_length_max")
    private Double fwdPacketLengthMax;

    @Column(name = "idle_mean")
    private Double idleMean;

    @Column(name = "avg_bwd_segment_size")
    private Double avgBwdSegmentSize;

    @Column(name = "total_backward_packets")
    private Double totalBackwardPackets;

    @Column(name = "total_length_bwd_packets")
    private Double totalLengthOfBwdPackets;

    @Column(name = "active_std")
    private Double activeStd;

    @Column(name = "flow_bytes_per_sec")
    private Double flowBytesPerSec;

    @Column(name = "total_fwd_packets")
    private Double totalFwdPackets;

    @Column(name = "idle_max")
    private Double idleMax;

    private String srcIp;

    private String dstIp;

    private Integer srcPort;

    private Integer dstPort;

    private String protocol;

    private Double duration;

    private Integer totalPackets;

    private Integer totalBytes;
    
}
