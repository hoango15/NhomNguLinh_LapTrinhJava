package com.hivtreatment.controller.api;

import com.hivtreatment.entity.Notification;
import com.hivtreatment.entity.User;
import com.hivtreatment.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationApiController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/recent")
    public ResponseEntity<Map<String, Object>> getRecentNotifications(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        List<Notification> notifications = notificationService.getNotificationsByUser(user.getId());
        long unreadCount = notificationService.getUnreadCount(user.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("notifications", notifications.subList(0, Math.min(notifications.size(), 10)));
        response.put("unreadCount", unreadCount);
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        notificationService.markAllAsRead(user.getId());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{id}/mark-read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok().build();
    }
}
