package com.hivtreatment.dto;

public class PatientSearchParams {
    private String name;
    private String gender;
    private Integer age;
    private String phone;
    private String treatmentStatus;
    private Long doctorId;
    private String search; // ✅ thêm trường search

    public PatientSearchParams() {}

    private PatientSearchParams(Builder builder) {
        this.name = builder.name;
        this.gender = builder.gender;
        this.age = builder.age;
        this.phone = builder.phone;
        this.treatmentStatus = builder.treatmentStatus;
        this.doctorId = builder.doctorId;
        this.search = builder.search; // ✅ thêm
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private String gender;
        private Integer age;
        private String phone;
        private String treatmentStatus;
        private Long doctorId;
        private String search; // ✅ thêm

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder gender(String gender) {
            this.gender = gender;
            return this;
        }

        public Builder age(Integer age) {
            this.age = age;
            return this;
        }

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder treatmentStatus(String treatmentStatus) {
            this.treatmentStatus = treatmentStatus;
            return this;
        }

        public Builder doctorId(Long doctorId) {
            this.doctorId = doctorId;
            return this;
        }

        public Builder search(String search) { // ✅ thêm
            this.search = search;
            return this;
        }

        public PatientSearchParams build() {
            return new PatientSearchParams(this);
        }
    }

    // Getters & Setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getTreatmentStatus() { return treatmentStatus; }
    public void setTreatmentStatus(String treatmentStatus) { this.treatmentStatus = treatmentStatus; }

    public Long getDoctorId() { return doctorId; }
    public void setDoctorId(Long doctorId) { this.doctorId = doctorId; }

    public String getSearch() { return search; } // ✅ thêm
    public void setSearch(String search) { this.search = search; } // ✅ thêm
}
