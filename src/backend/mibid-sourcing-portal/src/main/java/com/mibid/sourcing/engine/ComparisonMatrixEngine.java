package com.mibid.sourcing.engine;

import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Map;

/**
 * Engine ma trận so sánh giá: Tự động quy đổi đa ngoại tệ (USD, EUR, JPY, CNY -> VND)
 * và tổng hợp tổng chi phí sở hữu Landed Cost theo Incoterms (FOB, CIF, DDP).
 */
@Slf4j
@Service
public class ComparisonMatrixEngine {

    @Data
    @Builder
    public static class LandedCostResult {
        private BigDecimal originalAmount;
        private String originalCurrency;
        private BigDecimal exchangeRate;
        private BigDecimal convertedVndAmount;
        private BigDecimal importTaxVnd;
        private BigDecimal freightCostVnd;
        private BigDecimal totalLandedCostVnd;
    }

    public LandedCostResult calculateLandedCost(BigDecimal unitPrice, BigDecimal quantity, String currency,
                                               String incoterm, Map<String, BigDecimal> exchangeRates) {
        BigDecimal exchangeRate = exchangeRates.getOrDefault(currency.toUpperCase(), BigDecimal.ONE);
        BigDecimal baseOriginalAmount = unitPrice.multiply(quantity);
        BigDecimal convertedVndAmount = baseOriginalAmount.multiply(exchangeRate).setScale(0, RoundingMode.HALF_UP);

        // Giả lập thuế nhập khẩu và chi phí logistics theo Incoterms
        BigDecimal importTaxRate = "DDP".equalsIgnoreCase(incoterm) ? BigDecimal.ZERO : new BigDecimal("0.10");
        BigDecimal importTaxVnd = convertedVndAmount.multiply(importTaxRate).setScale(0, RoundingMode.HALF_UP);

        BigDecimal freightCostVnd = "FOB".equalsIgnoreCase(incoterm) ?
                convertedVndAmount.multiply(new BigDecimal("0.05")).setScale(0, RoundingMode.HALF_UP) : BigDecimal.ZERO;

        BigDecimal totalLandedCostVnd = convertedVndAmount.add(importTaxVnd).add(freightCostVnd);

        return LandedCostResult.builder()
                .originalAmount(baseOriginalAmount)
                .originalCurrency(currency)
                .exchangeRate(exchangeRate)
                .convertedVndAmount(convertedVndAmount)
                .importTaxVnd(importTaxVnd)
                .freightCostVnd(freightCostVnd)
                .totalLandedCostVnd(totalLandedCostVnd)
                .build();
    }
}
