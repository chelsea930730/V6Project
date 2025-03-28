package com.realestate.app.config;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${file.upload.directory}")
    private String uploadDirectory;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/css/**")
                .addResourceLocations("classpath:/static/css/");
        registry.addResourceHandler("/js/**")
                .addResourceLocations("classpath:/static/js/");
        registry.addResourceHandler("/img/**")
                .addResourceLocations("classpath:/static/img/");
        registry.addResourceHandler("/navi.html")  // ✅ `navi.html`에 대한 매핑 추가
                .addResourceLocations("classpath:/static/");

        // 외부 업로드 디렉토리를 정적 리소스로 매핑
        Path uploadPath = Paths.get(uploadDirectory).toAbsolutePath().normalize();
        String uploadUrl = uploadPath.toUri().toASCIIString();

        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadUrl);
    }
}
