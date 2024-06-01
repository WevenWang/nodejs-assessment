import express, { Request, Response, NextFunction } from "express";
import {
	getAllUsers,
	createUser,
	getUserById,
	updateUser,
	deleteUser,
} from "./users";
import { PORT } from "./constants";
import logger from "./logger";

const app = express();

app.use(express.json());

app.get("/users", getAllUsers);
app.post("/users", createUser);
app.get("/users/:id", getUserById);
app.put("/users/:id", updateUser);
app.delete("/users/:id", deleteUser);

app.get("/", (req: Request, res: Response) => {
	res.set("Content-Type", "text/html");
	res.status(200).send("<h1>Hello World</h1>");
});

// Centralized error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
	logger.error(err.stack);
	res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, (error?: any) => {
	if (!error) {
		logger.info(
			`App successfully started and is listening on port ${PORT}`
		);
	} else {
		logger.error(`Error occurred, server can't start`, error);
	}
});
