package com.hivtreatment.enums;

public enum ReportStatus {
    PENDING("Chờ xử lý"),
    IN_PROGRESS("Đang xử lý"),
    REVIEWED("Đã xem"),
    RESOLVED("Đã giải quyết");
    
    private final String displayName;
    
    ReportStatus(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
