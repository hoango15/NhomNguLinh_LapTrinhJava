package com.hivtreatment.enums;

public enum UserRole {
    PATIENT("Bệnh nhân"),
    DOCTOR("Bác sĩ"),
    ADMIN("Quản trị viên"),
    STAFF("Nhân viên"),
    MANAGER("Quản lý"),
    GUEST("Khách");

    private final String displayName;

    UserRole(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
