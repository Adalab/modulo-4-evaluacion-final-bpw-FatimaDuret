CREATE DATABASE perretes;

USE perretes;

CREATE TABLE perretes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(60) NOT NULL,
    raza VARCHAR(60) NOT NULL,
    edad INT NOT NULL
);

INSERT INTO perretes (nombre, raza, edad)
VALUES ('Carmiña', 'Chucho', 6);

INSERT INTO perretes (nombre, raza, edad)
VALUES ('Ringo', 'Caniche', 12);