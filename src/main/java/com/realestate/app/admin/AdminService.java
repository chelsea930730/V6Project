package com.realestate.app.admin;

import org.springframework.context.annotation.Lazy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import com.realestate.app.user.Provider;
import com.realestate.app.user.Role;
import com.realestate.app.user.User;
import com.realestate.app.user.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AdminService {
    private final UserRepository userRepository;
    @Lazy
    private final PasswordEncoder passwordEncoder;

    @Value("${file.upload.directory}")
    private String uploadDirectory;

    public void initializeAdminAccount() {
        // 이미 관리자 계정이 존재하는지 확인
        if (userRepository.findByEmail("admin@realestate.com").isPresent()) {
            return;
        }

        User adminUser = User.builder()
                .email("admin@realestate.com")
                .password(passwordEncoder.encode("admin123!@#"))
                .name("관리자")
                .role(Role.ADMIN)
                .provider(Provider.LOCAL)
                .build();

        userRepository.save(adminUser);
    }

    /**
     * 이미지 파일을 저장하고 저장된 경로를 반환합니다.
     *
     * @param file 저장할 이미지 파일
     * @return 저장된 이미지의 경로
     * @throws IOException 파일 저장 중 오류 발생 시
     */
    public String saveImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            return null;
        }

        // 외부 디렉토리에 저장 (application.properties에 정의된 경로 사용)
        Path directory = Paths.get(uploadDirectory);
        if (!Files.exists(directory)) {
            Files.createDirectories(directory);
        }

        // 파일명 중복 방지를 위한 UUID 추가
        String originalFilename = file.getOriginalFilename();
        String fileExtension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String newFilename = UUID.randomUUID() + fileExtension;

        // 파일 저장
        Path targetPath = directory.resolve(newFilename);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

        // 프론트엔드에서 접근 가능한 경로로 변환 (/uploads/파일명)
        return "/uploads/" + newFilename;
    }

    public String uploadImage(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // 이미지 저장 로직
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        String uniqueFileName = System.currentTimeMillis() + "_" + fileName;
        Path uploadPath = Paths.get(uploadDirectory);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        try (InputStream inputStream = file.getInputStream()) {
            Path filePath = uploadPath.resolve(uniqueFileName);
            Files.copy(inputStream, filePath, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + uniqueFileName;
        } catch (IOException e) {
            throw new IOException("이미지 저장 실패: " + fileName, e);
        }
    }
}
