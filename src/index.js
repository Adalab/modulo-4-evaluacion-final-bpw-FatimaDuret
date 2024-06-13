const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Server is running on port: http://localhost:${PORT}`);
});

async function getConnection() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });

    await conn.connect();
    console.log('Database connected ' + conn.threadId);
    return conn;
}

getConnection();



app.get('/perretes', authorize, async (req, res) => {
    try {
        const conn = await getConnection();
        const [result] = await conn.query('SELECT * FROM perretes');
        res.status(200).json({ info: { count: result.length }, results: result });
        await conn.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/perretes/:id', authorize, async (req, res) => {
    try {
        const { id } = req.params;
        const conn = await getConnection();
        const [result] = await conn.query('SELECT * FROM perretes WHERE id = ?', [id]);

        if (result.length === 0) {
            res.status(404).json({ message: 'Perro no encontrado' });
        } else {
            res.status(200).json(result[0]);
        }
        await conn.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/perretes', authorize, async (req, res) => {
    try {
        const conn = await getConnection();
        const { nombre, raza, edad } = req.body;
        const [result] = await conn.query('INSERT INTO perretes (nombre, raza, edad) VALUES (?, ?, ?)', [nombre, raza, edad]);

        res.status(201).json({ success: true, id: result.insertId });
        await conn.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/perretes/:id', authorize, async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, raza, edad } = req.body;
        const conn = await getConnection();
        const [result] = await conn.query('UPDATE perretes SET nombre = ?, raza = ?, edad = ? WHERE id = ?', [nombre, raza, edad, id]);

        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Perro no encontrado' });
        } else {
            res.status(200).json({ success: true });
        }
        await conn.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/perretes/:id', authorize, async (req, res) => {
    try {
        const { id } = req.params;
        const conn = await getConnection();
        const [result] = await conn.query('DELETE FROM perretes WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            res.status(404).json({ message: 'Perro no encontrado' });
        } else {
            res.status(200).json({ success: true });
        }
        await conn.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoints Bonus
app.post('/register', async (req, res) => {
    try {
        const conn = await getConnection();
        const { email, pass, nombre, direccion } = req.body;

       
        const [existingUser] = await conn.query('SELECT * FROM usuarios_db WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ success: false, message: 'Usuario ya existe' });
        }

       
        const hashedPassword = await bcrypt.hash(pass, 10);

        
        const [result] = await conn.query('INSERT INTO usuarios_db (email, nombre, direccion, password) VALUES (?, ?, ?, ?)', [email, nombre, direccion, hashedPassword]);
        const userId = result.insertId;

       
        const token = jwt.sign({ id: userId, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        res.status(201).json({ success: true, token });
        await conn.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/login', async (req, res) => {
    try {
        const conn = await getConnection();
        const { email, pass } = req.body;

        
        const [user] = await conn.query('SELECT * FROM usuarios_db WHERE email = ?', [email]);
        if (user.length === 0) {
            return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
        }

        
        const isPasswordValid = await bcrypt.compare(pass, user[0].password);
        if (!isPasswordValid) {
            return res.status(401).json({ success: false, message: 'Contraseña incorrecta' });
        }

       
        const token = jwt.sign({ id: user[0].id, email: user[0].email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });

        res.status(200).json({ success: true, token });
        await conn.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function authorize(req, res, next) {
    const tokenString = req.headers.authorization;
    if (!tokenString) {
        res.status(400).json({ success: false, message: 'No estás autorizado' });
    } else {
        try {
            const token = tokenString.split(' ')[1];
            const verifiedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            req.userInfo = verifiedToken;
            next();
        } catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    }
}







