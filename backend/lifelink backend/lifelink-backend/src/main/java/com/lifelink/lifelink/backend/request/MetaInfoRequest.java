package com.lifelink.lifelink.backend.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MetaInfoRequest {
    private Map<String, Object> dynamicInfo;
    private List<String> publicFields;
}
