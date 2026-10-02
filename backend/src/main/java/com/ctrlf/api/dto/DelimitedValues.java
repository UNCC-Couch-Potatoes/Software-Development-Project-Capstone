package com.ctrlf.api.dto;

import java.util.Arrays;
import java.util.List;

public final class DelimitedValues {

    private DelimitedValues() {
    }

    public static List<String> parse(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }

        return Arrays.stream(value.split("\\|"))
            .map(String::trim)
            .filter(item -> !item.isEmpty())
            .distinct()
            .toList();
    }
}
