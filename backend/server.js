require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./src/database');

const authRoutes = require('./src/routes/auth');
const conferenceRoutes = require('./src/routes/conferences');
const registrationRoutes = require('./src/routes/registrations');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

initializeDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/conferences', conferenceRoutes);
app.use('/api/registrations', registrationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
