package com.example.demo.web.dto;

public class UserDto {
    private String nombre;
    private String email;
    private String rol;
    private String estado;

    public UserDto(String nombre, String email, String rol, boolean activo) {
        this.nombre = nombre;
        this.email = email;
        this.rol = rol;
        this.estado = activo ? "Activo" : "Inactivo";
    }

    // Getters
    public String getNombre() { return nombre; }
    public String getEmail() { return email; }
    public String getRol() { return rol; }
    public String getEstado() { return estado; }
}
