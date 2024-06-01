import dotenv from "dotenv";

dotenv.config();

export const PORT = process.env.PORT || 3000;
export const USERS_FILE_PATH =
	process.env.USERS_FILE_PATH || "../data/users.json";
