
import express from "express";
import mongoose from "mongoose";
import listEndpoints from "express-list-endpoints";
import cors from "cors";
import experienceRoutes from "./services/profiles/index.js";

import profileRouter from './services/profiles/index.js';

import {
  notFoundHandler,
  badRequestHandler,
  genericErrorHandler,
} from "./services/errorHandlers.js";

import posts from './services/posts/index.js'



const server = express();

const port = process.env.PORT || 3001;

// ************************* MIDDLEWARES ********************************

server.use(cors());
server.use(express.json());
server.use('/posts',posts)
server.use("/profiles", experienceRoutes);
server.use('/profile', profileRouter)

// ************************* ROUTES ************************************

// ************************** ERROR HANDLERS ***************************

server.use(notFoundHandler);
server.use(badRequestHandler);
server.use(genericErrorHandler);
///skchskjdcb





mongoose.connect(process.env.MONGO_CONNECTION); //mongodb+srv://manish:mani@cluster0.jo5x0.mongodb.net/test

mongoose.connection.on("connected", () => {
  console.log("Successfully connected to Mongo!");
  server.listen(port, () => {
    console.table(listEndpoints(server));
    console.log(`Server running on port ${port}`);
  });
});

mongoose.connection.on("error", (err) => {
  console.log(err);
});
