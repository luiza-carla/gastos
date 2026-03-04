const express = require('express');
const path = require('path');
require('dotenv').config();
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const userRoutes = require('./routes/user.routes');
app.use('/usuarios', userRoutes);

module.exports = app;