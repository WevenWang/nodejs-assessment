import { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";
import { User } from "./types";
import { USERS_FILE_PATH } from "./constants";
import { userSchema } from "./validation";

const usersFilePath = path.join(__dirname, USERS_FILE_PATH);

const getUsers = async (): Promise<User[]> => {
	const data = await fs.readFile(usersFilePath, "utf8");
	return JSON.parse(data);
};

const saveUsers = async (users: User[]): Promise<void> => {
	await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
};

export const getAllUsers = async (
	req: Request,
	res: Response
): Promise<void> => {
	const users = await getUsers();
	res.json(users);
};

export const createUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { error } = userSchema.validate(req.body);
	if (error) {
		res.status(400).json({ error: error.details[0].message });
		return;
	}

	const { name, email, address } = req.body;
	const users = await getUsers();
	const newUser: User = { id: users.length + 1, name, email, address };
	users.push(newUser);
	await saveUsers(users);
	res.status(201).json(newUser);
};

export const getUserById = async (
	req: Request,
	res: Response
): Promise<void> => {
	const userId = parseInt(req.params.id);
	const users = await getUsers();
	const user = users.find((u) => u.id === userId);

	if (user) {
		res.json(user);
	} else {
		res.status(404).json({ error: "User not found" });
	}
};

export const updateUser = async (
	req: Request,
	res: Response
): Promise<void> => {
	const { error } = userSchema.validate(req.body);
	if (error) {
		res.status(400).json({ error: error.details[0].message });
		return;
	}

	const userId = parseInt(req.params.id);
	const { name, email, address } = req.body;
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
};

export const deleteUser = async (
	req: Request,
	res: Response
): Promise<void> => {
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
};
