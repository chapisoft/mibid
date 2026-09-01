package com.mibid.core.config;

import org.springframework.context.MessageSource;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.support.ResourceBundleMessageSource;
import org.springframework.web.servlet.LocaleResolver;
import org.springframework.web.servlet.i18n.AcceptHeaderLocaleResolver;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

/**
 * Cấu hình Đa ngôn ngữ (I18N) 5 thứ tiếng (Việt, Anh, Trung, Nhật, Hàn) cho Backend Spring Boot.
 * Mặc định: Tiếng Việt (vi).
 */
@Configuration
public class LocaleConfig {

    public static final List<Locale> SUPPORTED_LOCALES = List.of(
            Locale.of("vi"), // Tiếng Việt (Java 21 Locale.of)
            Locale.ENGLISH,   // English
            Locale.SIMPLIFIED_CHINESE, // 中文
            Locale.JAPANESE,  // 日本語
            Locale.KOREAN     // 한국어
    );

    @Bean
    @SuppressWarnings("null")
    public LocaleResolver localeResolver() {
        AcceptHeaderLocaleResolver resolver = new AcceptHeaderLocaleResolver();
        resolver.setSupportedLocales(SUPPORTED_LOCALES);
        resolver.setDefaultLocale(Locale.of("vi"));
        return resolver;
    }

    @Bean
    public MessageSource messageSource() {
        ResourceBundleMessageSource source = new ResourceBundleMessageSource();
        source.setBasenames("i18n/messages");
        source.setDefaultEncoding(StandardCharsets.UTF_8.name());
        source.setUseCodeAsDefaultMessage(true);
        source.setFallbackToSystemLocale(false);
        return source;
    }
}
