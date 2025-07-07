package com.hivtreatment.enums;

public enum AppointmentStatus {
    SCHEDULED("Đã lên lịch"),
    CONFIRMED("Đã xác nhận"),
    IN_PROGRESS("Đang diễn ra"),
    COMPLETED("Hoàn thành"),
    CANCELLED("Đã hủy"),
    NO_SHOW("Không đến");

    private final String displayName;

    AppointmentStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
