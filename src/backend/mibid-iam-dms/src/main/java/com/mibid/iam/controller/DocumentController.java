package com.mibid.iam.controller;

import com.mibid.core.context.TenantContextHolder;
import com.mibid.core.dto.ResultResponse;
import com.mibid.iam.domain.Document;
import com.mibid.iam.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;

    @GetMapping
    public ResponseEntity<ResultResponse<List<DocumentService.DocumentDto>>> listDocuments() {
        return ResponseEntity.ok(ResultResponse.success(documentService.getDocuments(TenantContextHolder.getTenantId())));
    }

    @GetMapping("/expiring")
    public ResponseEntity<ResultResponse<List<DocumentService.DocumentDto>>> listExpiringDocuments(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(ResultResponse.success(documentService.getExpiringDocuments(TenantContextHolder.getTenantId(), days)));
    }

    @PostMapping("/presigned-upload")
    public ResponseEntity<ResultResponse<Map<String, String>>> getPresignedUploadUrl(@RequestParam String filename) {
        String url = documentService.generateUploadUrl(filename);
        return ResponseEntity.ok(ResultResponse.success(Map.of("uploadUrl", url)));
    }

    @PostMapping
    public ResponseEntity<ResultResponse<Document>> createDocument(@RequestBody Document document) {
        document.setTenantId(TenantContextHolder.getTenantId());
        return ResponseEntity.ok(ResultResponse.success(documentService.uploadDocumentMetadata(document)));
    }
}
