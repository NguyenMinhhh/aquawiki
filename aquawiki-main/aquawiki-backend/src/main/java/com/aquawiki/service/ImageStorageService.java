package com.aquawiki.service;

import jakarta.annotation.PostConstruct;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Set;

@Service
public class ImageStorageService {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private final Path root = Paths.get("uploads/species");

    @PostConstruct
    public void init() throws IOException {
        Files.createDirectories(root);
    }

    public String store(Long speciesId, MultipartFile file) throws IOException {
        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (ext == null || !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only jpg, jpeg, png, webp files are allowed");
        }
        String filename = speciesId + "-" + System.currentTimeMillis() + "." + ext.toLowerCase();
        Path dest = root.resolve(filename);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);
        return "/uploads/species/" + filename;
    }
}
