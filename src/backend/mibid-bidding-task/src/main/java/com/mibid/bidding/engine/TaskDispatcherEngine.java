package com.mibid.bidding.engine;

import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Task Dispatcher Engine: Tự động phân rã và sinh công việc vi mô dựa trên điều kiện gói thầu (condition_rule).
 */
@Slf4j
@Service
public class TaskDispatcherEngine {

    @Data
    @Builder
    public static class GeneratedTask {
        private String taskCode;
        private String title;
        private String departmentCode; // TECHNICAL, COMMERCIAL, LEGAL, FINANCE
        private boolean isMandatory;
        private LocalDateTime dueAt;
    }

    public List<GeneratedTask> dispatchTasksForStage(UUID projectId, String stageCode, String investorType, LocalDateTime deadline) {
        log.info("Phân bổ công việc tự động cho Dự án {} tại bước {} (Chủ đầu tư: {})", projectId, stageCode, investorType);
        List<GeneratedTask> tasks = new ArrayList<>();

        if ("STAGE_PREPARATION".equals(stageCode)) {
            tasks.add(GeneratedTask.builder()
                    .taskCode("TASK_TECH_SPECS")
                    .title("Bóc tách thông số kỹ thuật chi tiết theo HSMT")
                    .departmentCode("TECHNICAL")
                    .isMandatory(true)
                    .dueAt(deadline.minusDays(5))
                    .build());

            tasks.add(GeneratedTask.builder()
                    .taskCode("TASK_LEGAL_DOCS")
                    .title("Thu thập Báo cáo tài chính 3 năm và Giấy phép kinh doanh")
                    .departmentCode("LEGAL")
                    .isMandatory(true)
                    .dueAt(deadline.minusDays(7))
                    .build());
        }

        if ("STATE_OWNED".equals(investorType)) {
            tasks.add(GeneratedTask.builder()
                    .taskCode("TASK_BID_SECURITY")
                    .title("Phát hành Thư bảo lãnh dự thầu ngân hàng theo mẫu số 04")
                    .departmentCode("FINANCE")
                    .isMandatory(true)
                    .dueAt(deadline.minusDays(3))
                    .build());
        }

        return tasks;
    }
}
