package com.realestate.app;

import io.github.cdimascio.dotenv.Dotenv;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RealStateAppApplication {

	public static void main(String[] args) {
		try {
			Dotenv dotenv = Dotenv.configure()
					.directory("src/main/resources")
					.ignoreIfMissing()
					.load();

			String clientId = dotenv.get("GOOGLE_CLIENT_ID");
			String clientSecret = dotenv.get("GOOGLE_CLIENT_SECRET");

			if (clientId != null && clientSecret != null) {
				System.setProperty("GOOGLE_CLIENT_ID", clientId);
				System.setProperty("GOOGLE_CLIENT_SECRET", clientSecret);
			} else {
				// 환경 변수가 없을 경우 기본값 사용
				System.out.println("Warning: OAuth credentials not found in oauth.env file");
			}
		} catch (Exception e) {
			System.out.println("Warning: Could not load oauth.env file: " + e.getMessage());
		}

		SpringApplication.run(RealStateAppApplication.class, args);
	}

}
