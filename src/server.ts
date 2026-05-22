import express, { Request, Response } from "express";
import router from "./routes/route.ts";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Node + Express + TypeScript server is running!",
  });
});

app.use("/api/v1/", router);
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
