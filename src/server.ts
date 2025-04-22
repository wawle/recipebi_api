import path from "path";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import mongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import hpp from "hpp";
import cors from "cors";
import errorHandler from "./middleware/error";
import connectDB from "./config/db";
import fs from "fs";

// Load env vars
const envPath = path.join(__dirname, "config", "config.env");
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error("Error loading .env file:", result.error);
  process.exit(1);
}

// Validate required environment variables
const requiredEnvVars = ["JWT_SECRET", "JWT_EXPIRE", "MONGO_URI", "PORT"];
const missingEnvVars = requiredEnvVars.filter(
  (envVar) => !process.env[envVar]
);

if (missingEnvVars.length > 0) {
  console.error(
    "Missing required environment variables:",
    missingEnvVars.join(", ")
  );
  process.exit(1);
}

// Connect to database
connectDB();

// Route files
import authRouter from "./routes/auth";
import usersRouter from "./routes/users";
import cookBookRouter from "./routes/cook-book";
import recipeRouter from "./routes/recipe";
import libraryRouter from "./routes/library";
const app = express();

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Dev logging middleware
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Sanitize data
app.use(mongoSanitize());

// Set security headers
app.use(helmet());

// Prevent HTTP parameter pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Uploads klasörünün varlığını kontrol et ve yoksa oluştur
const uploadsDir = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(path.join(__dirname, "../public"))) {
  fs.mkdirSync(path.join(__dirname, "../public"), { recursive: true });
  console.log("Public klasörü oluşturuldu");
}

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Uploads klasörü oluşturuldu");
}

// Statik dosyaları serve et
// Ana public klasörü
app.use(express.static(path.join(__dirname, "../public")));
// Uploads klasörünü doğrudan /uploads yolundan erişilebilir yap
app.use(
  "/uploads",
  express.static(path.join(__dirname, "../public/uploads"))
);

// Mount routers
// for current user actions
app.use("/api/v1/auth", authRouter);
// for admin actions
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/cookbooks", cookBookRouter);
app.use("/api/v1/recipes", recipeRouter);
app.use("/api/v1/libraries", libraryRouter);
app.use(errorHandler);

const PORT = process.env.PORT;

app.listen(PORT, () =>
  console.log(
    `Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  )
);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
