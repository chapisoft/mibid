package com.mibid.core.interceptor;

import com.mibid.core.context.TenantContextHolder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.lang.Nullable;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.UUID;

/**
 * HTTP Handler Interceptor trích xuất tenant_id từ Header hoặc JWT
 * và gắn vào TenantContextHolder cho toàn bộ phiên xử lý Request.
 */
@Slf4j
public class TenantRlsInterceptor implements HandlerInterceptor {

    public static final String TENANT_HEADER = "X-Tenant-Id";

    @Override
    public boolean preHandle(@NonNull HttpServletRequest request,
                             @NonNull HttpServletResponse response,
                             @NonNull Object handler) {
        String tenantHeader = request.getHeader(TENANT_HEADER);
        if (tenantHeader != null && !tenantHeader.isBlank()) {
            try {
                UUID tenantId = UUID.fromString(tenantHeader.trim());
                TenantContextHolder.setTenantId(tenantId);
                log.debug("Kích hoạt Tenant Context thành công: {}", tenantId);
            } catch (IllegalArgumentException e) {
                log.warn("Định dạng X-Tenant-Id không hợp lệ: {}", tenantHeader);
            }
        }
        return true;
    }

    @Override
    public void afterCompletion(@NonNull HttpServletRequest request,
                                @NonNull HttpServletResponse response,
                                @NonNull Object handler,
                                @Nullable Exception ex) {
        TenantContextHolder.clear();
    }
}
