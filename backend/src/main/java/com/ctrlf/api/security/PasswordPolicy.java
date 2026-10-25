package com.ctrlf.api.security;

import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.regex.Pattern;

public final class PasswordPolicy {
    public static final int MIN_LENGTH = 8;
    public static final int MAX_BYTES = 72;

    private static final Pattern UPPER = Pattern.compile("[A-Z]");
    private static final Pattern LOWER = Pattern.compile("[a-z]");
    private static final Pattern DIGIT = Pattern.compile("[0-9]");
    private static final Pattern SYMBOL = Pattern.compile("[^A-Za-z0-9]");

    private PasswordPolicy() {}

    /** Returns what's wrong with the password, or null if it's acceptable. */
    public static String problem(String password, String username) {
        if (password == null || password.length() < MIN_LENGTH
                || !UPPER.matcher(password).find() || !LOWER.matcher(password).find()
                || !DIGIT.matcher(password).find() || !SYMBOL.matcher(password).find()) {
            return "Password must be at least 8 characters and include an uppercase letter, "
                    + "a lowercase letter, a number, and a symbol.";
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > MAX_BYTES) {
            return "Password must be 72 characters or fewer.";
        }
        if (username != null) {
            String name = username.trim().toLowerCase(Locale.ROOT);
            if (name.length() >= 3 && password.toLowerCase(Locale.ROOT).contains(name)) {
                return "Password can't contain your username.";
            }
        }
        return null;
    }
}