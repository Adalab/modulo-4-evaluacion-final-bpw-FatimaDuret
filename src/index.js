const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port: http://localhost:${PORT}`);
});

async function getConnection() {
    const conex = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    await conex.connect();
    console.log('Database connected' + conex.threadId);
    return conex;
}

getConnection();

app.post('/perros', async (req, res) => {
    try {
        const { nombre, raza, edad } = req.body;
        const conn = await getConnection();
        const [result] = await conn.query('INSERT INTO perros (nombre, raza, edad) VALUES (?, ?, ?)', [nombre, raza, edad]);
        res.status(201).json({ id: result.insertId, message: 'Perro creado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/perretes', async (req, res) => {
    try {
        const conn = await getConnection();
        const [rows] = await conn.query('SELECT * FROM perretes');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/perretes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const conn = await getConnection();
        const [rows] = await conn.query('SELECT * FROM perretes WHERE id = ?', [id]);

        if (rows.length === 0) {
            res.status(404).json({ message: 'Perro no encontrado' });
        } else {
            res.json(rows[0]);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/perretes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, raza, edad } = req.body;
        const conn = await getConnection();
        const [result] = await conn.query('UPDATE perretes SET nombre = ?, raza = ?, edad = ? WHERE id = ?', [nombre, raza, edad, id]);

        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Perro no encontrado' });
        } else {
            res.json({ message: 'Perro actualizado correctamente' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/perretes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const conn = await getConnection();
        const [result] = await conn.query('DELETE FROM perretes WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Perro no encontrado' });
        } else {
            res.json({ message: 'Perro eliminado correctamente' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});