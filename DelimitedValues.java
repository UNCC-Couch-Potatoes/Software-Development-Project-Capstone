package com.ctrlf.api.dto;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

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

    /** Turns ["Art", "Music"] into "|Art|Music|" for storage. Empty list becomes "". */
    public static String join(List<String> values) {
        if (values == null || values.isEmpty()) {
            return "";
        }

        List<String> cleaned = values.stream()
            .filter(item -> item != null)
            .map(item -> item.replace("|", "").trim())
            .filter(item -> !item.isEmpty())
            .distinct()
            .toList();

        if (cleaned.isEmpty()) {
            return "";
        }

        return cleaned.stream().collect(Collectors.joining("|", "|", "|"));
    }
}