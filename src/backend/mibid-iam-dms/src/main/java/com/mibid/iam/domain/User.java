package com.mibid.iam.domain;

import com.mibid.core.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

/**
 * Thực thể Người dùng (User) trong hệ thống MIBID.
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User extends BaseEntity {

    @Column(name = "username", nullable = false, length = 128)
    private String username;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "role", nullable = false, length = 64)
    private String role; // ADMIN, BID_MANAGER, SOURCING_SPECIALIST, VENDOR

    @Column(name = "status", nullable = false, length = 32)
    private String status; // ACTIVE, LOCKED, INACTIVE
}
