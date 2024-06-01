import { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { User } from "./types";
import { USERS_FILE_PATH } from "./constants";
import logger from "./logger";

const usersFilePath = path.join(__dirname, USERS_FILE_PATH);

const getUsers = async (): Promise<User[]> => {
	try {
		const data = await fs.readFile(usersFilePath, "utf8");
		return JSON.parse(data);
	} catch (error) {
		logger.error("Failed to read users file", error);
		throw error;
	}
};

const saveUsers = async (users: User[]): Promise<void> => {
	try {
		await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
	} catch (error) {
		logger.error("Failed to write users file", error);
		throw error;
	}
};

export const getAllUsers = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const users = await getUsers();
		res.json(users);
	} catch (error) {
		res.status(500).json({ error: "Failed to get users" });
	}
};

export const createUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { name, email, address } = req.body;

	if (!name || !email || !address) {
		res.status(400).json({
			error: "Name, email, and address are required",
		});
	}

	try {
		const users = await getUsers();
		const newUser: User = { id: users.length + 1, name, email, address };
		users.push(newUser);
		await saveUsers(users);
		res.status(201).json(newUser);
	} catch (error) {
		res.status(500).json({ error: "Failed to create user" });
	}
};

export const getUserById = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = parseInt(req.params.id);
		const users = await getUsers();
		const user = users.find((u) => u.id === userId);

		if (user) {
			res.json(user);
		} else {
			res.status(404).json({ error: "User not found" });
		}
	} catch (error) {
		res.status(500).json({ error: "Failed to get user" });
	}
};

export const updateUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { name, email, address } = req.body;

	if (!name || !email || !address) {
		res.status(400).json({
			error: "Name, email, and address are required",
		});
		return;
	}

	try {
		const userId = parseInt(req.params.id);
		const users = await getUsers();
		const user = users.find((u) => u.id === userId);

		if (user) {
			user.name = name;
			user.email = email;
			user.address = address;
			await saveUsers(users);
			res.json(user);
		} else {
			res.status(404).json({ error: "User not found" });
		}
	} catch (error) {
		res.status(500).json({ error: "Failed to update user" });
	}
};

export const deleteUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	try {
		const userId = parseInt(req.params.id);
		const users = await getUsers();
		const userIndex = users.findIndex((u) => u.id === userId);

		if (userIndex !== -1) {
			const updatedUsers = users.filter((u) => u.id !== userId);
			await saveUsers(updatedUsers);
			res.json({ message: "User deleted successfully" });
		} else {
			res.status(404).json({ error: "User not found" });
		}
	} catch (error) {
		res.status(500).json({ error: "Failed to delete user" });
	}
};
