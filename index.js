import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import dbConnect from './src/config/db.js';
import morgan from 'morgan';

// Import your routes and other modules

dotenv.config();
const app = express();

// Middleware
app.use(cors('*'));
app.use(express.json());
app.use(morgan('dev'))

// Connect to the database
dbConnect();

// Import and use your routes here
import {userRoutes,adminRoutes} from "./src/routes/v1/index.js";

app.use('/v1',userRoutes);
app.use('/v1',adminRoutes);

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

// Welcome route
app.get('/',(req,res)=>{
  res.send('Hello,Have a good day!')
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
