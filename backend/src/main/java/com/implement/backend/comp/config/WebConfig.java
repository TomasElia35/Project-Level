package com.implement.backend.comp.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Mapeamos la URL que guardamos en la BD a la carpeta física
        registry.addResourceHandler("/Imagenes/Planograma/**")
                .addResourceLocations("file:C:/GondolaImagenes/");
    }
}