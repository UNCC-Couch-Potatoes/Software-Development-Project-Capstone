package com.ctrlf.api.entity;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "UserProfile")
public class UserProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserId")
    private Long userId;

    @Column(name = "Username", nullable = false, unique = true, length = 30)
    private String username;

    @Column(name = "Email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "Password", nullable = false, length = 100)
    private String password;

    @Column(name = "FirstName", nullable = false, length = 30)
    private String firstName;

    @Column(name = "LastName", nullable = false, length = 30)
    private String lastName;

    @Column(name = "Skills", nullable = false, length = 1000)
    private String skills;

    @Column(name = "Interests", nullable = false, length = 1000)
    private String interests;

    @Column(name = "Bio", nullable = false, length = 1000)
    private String bio;

    @Column(name = "JoinDate", nullable = false)
    private LocalDate joinDate;

    protected UserProfile() {}

    public UserProfile(String username, String email, String passwordHash,
                       String firstName, String lastName) {
        this.username = username;
        this.email = email;
        this.password = passwordHash;
        this.firstName = firstName;
        this.lastName = lastName;
        this.skills = "";
        this.interests = "";
        this.bio = "";
        this.joinDate = LocalDate.now();
    }

    public Long getUserId() { return userId; }
    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getSkills() { return skills; }
    public String getInterests() { return interests; }
    public String getBio() { return bio; }
    public LocalDate getJoinDate() { return joinDate; }
}