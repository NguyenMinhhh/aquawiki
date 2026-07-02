package com.aquawiki.controller;

import com.aquawiki.dto.IdentifyResponse;
import com.aquawiki.dto.SpeciesMatch;
import com.aquawiki.service.SpeciesRecognitionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/identify")
@RequiredArgsConstructor
public class IdentificationController {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "webp");
    private static final long MAX_SIZE_BYTES = 8L * 1024 * 1024; // 8 MB

    private final SpeciesRecognitionService recognitionService;

    /** Upload a fish photo → ranked candidate species (FR50). JWT-required (authenticated only). */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public IdentifyResponse identify(@RequestParam("file") MultipartFile file) throws IOException {
        validate(file);
        List<SpeciesMatch> matches = recognitionService.identify(file.getBytes(), file.getContentType());
        return IdentifyResponse.of(matches);
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Chưa có ảnh được tải lên");
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ảnh vượt quá 8MB");
        }
        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (ext == null || !ALLOWED_EXTENSIONS.contains(ext.toLowerCase())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Chỉ chấp nhận ảnh jpg, jpeg, png, webp");
        }
    }
}
