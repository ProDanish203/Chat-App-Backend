import { config } from "dotenv";
import { connDb } from "./config/db.js";
import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
// Middlewares
import { errorMiddleware } from "./middlewares/error.middleware.js";
// Routes
import authRoute from "./routes/auth.route.js";
import userRoute from "./routes/user.route.js";
import requestRoute from "./routes/request.route.js";
import chatsRoute from "./routes/chat.route.js";
//
import { app, server } from "./socket/socket.js";

// .env config
config();

const corsOptions = {
    credentials: true,
    origin:
        process.env.NODE_ENV === "production"
            ? "http://localhost:3000"
            : "http://localhost:3000",
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.static("public"));
// For url inputs
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(morgan("dev"));
app.use(cookieParser());
app.disable("x-powered-by");

app.get("/", (req, res) => {
    res.status(200).json({
        message: "Chat application - API",
    });
});

// Routes
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/request", requestRoute);
app.use("/api/v1/chats", chatsRoute);

// Custom middleware for errors
app.use(errorMiddleware);

const port = process.env.PORT || 5000;

connDb()
    .then(() => {
        server.listen(port, () => {
            console.log(`Server is listening live on port:${port}`);
        });
    })
    .catch((error) => {
        console.log(`Database Connection Error: ${error}`);
    });

export default app;
