import express from "express";
import cors from "cors";
import expenseRoutes from "./routes/expenseRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// api routes
app.use("/api/expenses", expenseRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
