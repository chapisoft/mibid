package com.mibid;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Điểm khởi chạy trung tâm của hệ thống MIBID.
 */
@EnableScheduling
@SpringBootApplication(scanBasePackages = "com.mibid")
@EntityScan(basePackages = "com.mibid")
@EnableJpaRepositories(basePackages = "com.mibid")
public class MibidApplication {

    public static void main(String[] args) {
        SpringApplication.run(MibidApplication.class, args);
    }
}
