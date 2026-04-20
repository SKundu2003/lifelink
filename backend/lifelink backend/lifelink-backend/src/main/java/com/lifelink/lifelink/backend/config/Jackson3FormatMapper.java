package com.lifelink.lifelink.backend.config;

import org.hibernate.type.descriptor.WrapperOptions;
import org.hibernate.type.descriptor.java.JavaType;
import org.hibernate.type.format.FormatMapper;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

/**
 * Custom Hibernate FormatMapper for Jackson 3 (tools.jackson).
 * This bridge allows Hibernate 7 to use Jackson 3 for JSONB mapping.
 */
public class Jackson3FormatMapper implements FormatMapper {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public <T> T fromString(CharSequence charSequence, JavaType<T> javaType, WrapperOptions wrapperOptions) {
        try {
            return objectMapper.readValue(charSequence.toString(), javaType.getJavaTypeClass());
        } catch (JacksonException e) {
            throw new RuntimeException("Could not deserialize JSON string", e);
        }
    }

    @Override
    public <T> String toString(T value, JavaType<T> javaType, WrapperOptions wrapperOptions) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JacksonException e) {
            throw new RuntimeException("Could not serialize object to JSON", e);
        }
    }
}
