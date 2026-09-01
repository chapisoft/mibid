package com.mibid.iam.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Thực thể Danh mục Menu và Khai báo Route động toàn hệ thống MIBID.
 */
@Getter
@Setter
@Entity
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "app_menus")
public class AppMenu {

    @Id
    @Column(name = "id", length = 50, nullable = false)
    private String id;

    @Column(name = "parent_id", length = 50)
    private String parentId;

    @Column(name = "code", length = 50, nullable = false, unique = true)
    private String code;

    @Column(name = "title", length = 100, nullable = false)
    private String title;

    @Column(name = "path", length = 100, nullable = false)
    private String path;

    @Column(name = "icon", length = 50)
    private String icon;

    @Column(name = "module_code", length = 50, nullable = false)
    private String moduleCode;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive;

    @Column(name = "is_system", nullable = false)
    private Boolean isSystem;

    @Column(name = "required_permission", length = 100)
    private String requiredPermission;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
