package com.realestate.app.geocoding;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class GeocodingService {
    private static final Logger log = LoggerFactory.getLogger(GeocodingService.class);
    private final RestTemplate restTemplate;
    private final String apiKey;

    public GeocodingService(
            @Value("${google.maps.api.key}") String apiKey) {
        this.restTemplate = new RestTemplate();
        this.apiKey = apiKey;
    }

    public GeocodingResult getCoordinates(String address) {
        if (address == null || address.trim().isEmpty()) {
            return null;
        }

        try {
            String url = String.format(
                    "https://maps.googleapis.com/maps/api/geocode/json?address=%s&key=%s",
                    address, apiKey
            );

            var response = restTemplate.getForObject(url, GeocodeResponse.class);

            if (response != null && !response.results.isEmpty()) {
                var location = response.results.get(0).geometry.location;
                return new GeocodingResult(location.lat, location.lng);
            }
        } catch (Exception e) {
            log.error("Geocoding error for address: " + address, e);
        }
        return null;
    }

    // Google Maps API 응답을 파싱하기 위한 내부 클래스들
    private static class GeocodeResponse {
        public List<Result> results;
    }

    private static class Result {
        public Geometry geometry;
    }

    private static class Geometry {
        public Location location;
    }

    private static class Location {
        public double lat;
        public double lng;
    }
}
