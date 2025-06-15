const express = require("express");
const cors = require("cors");
const PORT = process.env.PORT || 4000;
const authRoutes = require("./routes/auth");
const jobRoutes = require("./routes/job");
const connectDB = require("./config/db");
const { PrismaClient } = require("./generated/prisma");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
connectDB();
app.use(
  cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Welcome to the API!" });
});

app.get("/health", async (req, res) => {
  const data = await prisma.jobs.findMany();
  return res
    .status(200)
    .json({ success: true, message: "Server is healthy!", data });
});

app.use("/api/auth", authRoutes);
app.use("/api/job", jobRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
