import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import dbConnect from './src/config/db.js';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();
const app = express();

// Middleware
app.use(cors('*'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan('dev'));

// Get the current directory name using import.meta.url
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to the database
dbConnect();

// template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

// Welcome route
app.get('/', (req, res) => {
  res.send('Welcome,Onpods Backend')
});

// Import and use your routes here
import { userRoutes, adminRoutes, reportRoutes } from './src/routes/v1/index.js';

app.use('/v1', userRoutes);
app.use('/v1', adminRoutes);
app.use('/v1/report', reportRoutes);

// Not Found Middleware
app.use((req, res, next) => {
  const error = new Error(`Not Found: ${req.originalUrl}`);
  res.status(404);
  next(error);
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
