package com.mibid.iam.service;

import com.mibid.core.exception.AppException;
import com.mibid.core.exception.ErrorCode;
import com.mibid.iam.domain.User;
import com.mibid.iam.repository.UserRepository;
import com.mibid.security.jwt.JwtTokenProvider;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Data
    @Builder
    public static class AuthResponse {
        private String accessToken;
        private String tokenType;
        private UUID userId;
        private String username;
        private String fullName;
        private String role;
        private UUID tenantId;
    }

    @Transactional(readOnly = true)
    public AuthResponse login(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AppException(ErrorCode.AUTHENTICATION_FAILED, "Tên đăng nhập hoặc mật khẩu không chính xác"));

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new AppException(ErrorCode.USER_ACCOUNT_LOCKED, "Tài khoản người dùng đã bị khóa");
        }

        // Tạo JWT Token
        String token = jwtTokenProvider.generateAccessToken(user.getId(), user.getTenantId(), user.getUsername(), user.getRole());

        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .username(user.getUsername())
                .fullName(user.getFullName())
                .role(user.getRole())
                .tenantId(user.getTenantId())
                .build();
    }

    @Transactional(readOnly = true)
    public List<User> getUsersByTenant(UUID tenantId) {
        return userRepository.findByTenantId(tenantId);
    }
}
