require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./src/database');

const authRoutes = require('./src/routes/auth');
const conferenceRoutes = require('./src/routes/conferences');
const registrationRoutes = require('./src/routes/registrations');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:4000', 'http://localhost:3000', 'http://localhost:3001'] }));
app.use(express.json());

// Serve frontend static files
const frontendDist = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendDist));

initializeDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/conferences', conferenceRoutes);
app.use('/api/registrations', registrationRoutes);

// SPA fallback - serve index.html for all non-API routes
app.use((req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
