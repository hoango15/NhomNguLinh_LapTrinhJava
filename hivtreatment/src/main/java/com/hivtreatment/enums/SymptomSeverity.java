package com.hivtreatment.enums;

public enum SymptomSeverity {
    MILD("Nhẹ"),
    MODERATE("Vừa"),
    SEVERE("Nặng"),
    CRITICAL("Nghiêm trọng");
    
    private final String displayName;
    
    SymptomSeverity(String displayName) {
        this.displayName = displayName;
    }
    
    public String getDisplayName() {
        return displayName;
    }
}
