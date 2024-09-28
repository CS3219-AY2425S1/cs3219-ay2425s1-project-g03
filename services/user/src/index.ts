import express, { NextFunction, Request, Response } from "express";
import cors from "cors";

import userRoutes from "./routes/user-routes";
import authRoutes from "./routes/auth-routes";

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors()); // config cors so that front-end can use
app.options("*", cors());

// To handle CORS Errors
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header("Access-Control-Allow-Origin", "*"); // "*" -> Allow all links to access

  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization",
  );

  // Browsers usually send this before PUT or POST Requests
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "GET, POST, DELETE, PUT, PATCH");
    res.status(200).json({});
    return;
  }

  // Continue Route Processing
  next();
});

app.use("/users", userRoutes);
app.use("/auth", authRoutes);

app.get("/", (req: Request, res: Response) => {
  console.log("Sending Greetings!");
  res.json({
    message: "Hello World from user-service",
  });
});

// Handle When No Route Match Is Found
app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new Error("Route Not Found");
  res.status(404);
  next(error);
});

export default app;
