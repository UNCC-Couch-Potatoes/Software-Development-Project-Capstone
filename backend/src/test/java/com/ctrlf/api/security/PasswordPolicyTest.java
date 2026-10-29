package com.ctrlf.api.security;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;

class PasswordPolicyTest {
    @Test
    void acceptsStrongPassword() {
        assertNull(PasswordPolicy.problem("Tr4ck-Pixel-Moon", "gamedev"));
    }

    @Test
    void rejectsShortPassword() {
        assertNotNull(PasswordPolicy.problem("Ab1!xyz", "gamedev"));
    }

    @Test
    void rejectsPasswordOver72Characters() {
        assertNotNull(PasswordPolicy.problem("Ab1!" + "x".repeat(69), "gamedev"));
    }

    @Test
    void requiresEachCharacterType() {
        assertNotNull(PasswordPolicy.problem("tr4ck-pixel-moon", "gamedev"), "no uppercase");
        assertNotNull(PasswordPolicy.problem("TR4CK-PIXEL-MOON", "gamedev"), "no lowercase");
        assertNotNull(PasswordPolicy.problem("Track-Pixel-Moon", "gamedev"), "no number");
        assertNotNull(PasswordPolicy.problem("Tr4ckPixelMoon", "gamedev"), "no symbol");
    }

    @Test
    void rejectsPasswordContainingUsername() {
        assertNotNull(PasswordPolicy.problem("GameDev#2026", "gamedev"));
    }
}