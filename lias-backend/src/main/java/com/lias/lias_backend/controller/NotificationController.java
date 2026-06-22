package com.lias.lias_backend.controller;

import com.lias.lias_backend.model.Notification;
import com.lias.lias_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<List<Notification>> getAll(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(notificationService.getAllNotifications(userDetails.getUsername()));
    }

    @GetMapping("/non-lues")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<List<Notification>> getNonLues(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(notificationService.getMesNotifications(userDetails.getUsername()));
    }

    @GetMapping("/count")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<Map<String, Long>> countNonLues(
            @AuthenticationPrincipal UserDetails userDetails) {
        long count = notificationService.countNonLues(userDetails.getUsername());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/lire")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<Void> marquerLue(@PathVariable Long id) {
        notificationService.marquerCommeLue(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/lire-toutes")
    @PreAuthorize("hasAnyRole('ADMIN','DIRECTEUR','MEMBRE','DOCTORANT')")
    public ResponseEntity<Void> marquerToutesLues(
            @AuthenticationPrincipal UserDetails userDetails) {
        notificationService.marquerToutesLues(userDetails.getUsername());
        return ResponseEntity.ok().build();
    }
}
