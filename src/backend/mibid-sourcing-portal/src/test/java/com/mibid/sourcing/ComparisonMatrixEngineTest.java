package com.mibid.sourcing;

import com.mibid.sourcing.engine.ComparisonMatrixEngine;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Kiểm thử Đơn vị Comparison Matrix Engine MIBID")
class ComparisonMatrixEngineTest {

    private final ComparisonMatrixEngine engine = new ComparisonMatrixEngine();

    @Test
    @DisplayName("Quy đổi ngoại tệ USD sang VND và tính Landed Cost FOB")
    void testCalculateLandedCostFobUsd() {
        BigDecimal unitPrice = new BigDecimal("1000"); // 1.000 USD
        BigDecimal quantity = new BigDecimal("10");     // 10 cái
        String currency = "USD";
        String incoterm = "FOB";
        Map<String, BigDecimal> exchangeRates = Map.of("USD", new BigDecimal("25400")); // 1 USD = 25.400 VND

        ComparisonMatrixEngine.LandedCostResult result = engine.calculateLandedCost(
                unitPrice, quantity, currency, incoterm, exchangeRates
        );

        assertNotNull(result);
        assertEquals(new BigDecimal("10000"), result.getOriginalAmount()); // 10.000 USD
        assertEquals(new BigDecimal("254000000"), result.getConvertedVndAmount()); // 254.000.000 VND
        assertEquals(new BigDecimal("25400000"), result.getImportTaxVnd()); // 10% thuế = 25.400.000 VND
        assertEquals(new BigDecimal("12700000"), result.getFreightCostVnd()); // 5% cước FOB = 12.700.000 VND
        assertEquals(new BigDecimal("292100000"), result.getTotalLandedCostVnd()); // Tổng = 292.100.000 VND
    }
}
