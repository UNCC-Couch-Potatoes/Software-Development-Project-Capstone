package com.ctrlf.api.dto;
import java.util.List;
public record ResourcePostRequest(String title, String overview, List<String> tags, String body) {}
