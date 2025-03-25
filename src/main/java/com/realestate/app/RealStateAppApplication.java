package com.realestate.app;

import io.github.cdimascio.dotenv.Dotenv;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RealStateAppApplication {

	public static void main(String[] args) {
		Dotenv dotenv = Dotenv.configure()
				.directory("src/main/resources")
				.ignoreIfMissing()
				.load();

		// 환경변수 등록
		System.setProperty("GOOGLE_CLIENT_ID", dotenv.get("GOOGLE_CLIENT_ID"));
		System.setProperty("GOOGLE_CLIENT_SECRET", dotenv.get("GOOGLE_CLIENT_SECRET"));

		SpringApplication.run(RealStateAppApplication.class, args);
	}

}