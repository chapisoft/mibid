package com.mibid.iam.controller;

import com.mibid.core.context.TenantContextHolder;
import com.mibid.core.dto.ResultResponse;
import com.mibid.iam.domain.User;
import com.mibid.iam.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    public static class SwitchTenantRequest {
        private java.util.UUID tenantId;
    }

    @PostMapping("/login")
    public ResponseEntity<ResultResponse<UserService.AuthResponse>> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(ResultResponse.success(userService.login(request.getUsername(), request.getPassword())));
    }

    @PostMapping("/switch-tenant")
    public ResponseEntity<ResultResponse<UserService.AuthResponse>> switchTenant(
            @RequestHeader(value = "X-User-ID", required = false) String userIdHeader,
            @RequestBody SwitchTenantRequest request
    ) {
        java.util.UUID userId = userIdHeader != null ? java.util.UUID.fromString(userIdHeader) : null;
        if (userId == null) {
            // Lấy từ context nếu có
            return ResponseEntity.ok(ResultResponse.success(userService.switchTenant(request.getTenantId(), request.getTenantId())));
        }
        return ResponseEntity.ok(ResultResponse.success(userService.switchTenant(userId, request.getTenantId())));
    }

    @GetMapping
    public ResponseEntity<ResultResponse<List<User>>> listUsers() {
        return ResponseEntity.ok(ResultResponse.success(userService.getUsersByTenant(TenantContextHolder.getTenantId())));
    }
}
