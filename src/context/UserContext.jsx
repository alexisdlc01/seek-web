import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const UserContext = createContext(undefined);

export default UserContext;
export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	useEffect(() => {
		(async () => {
			const currentUser = await getCurrentUser();
			setUser(currentUser);
			console.log(
				`Logged in as ${currentUser ? currentUser.name : currentUser}`
			);
		})();
	}, []);

	const getCurrentUser = async () => {
		try {
			const res = await axios.get(`${BASE_URL}/auth/currentUser`, {
				withCredentials: true
			});
			return res.data;
		} catch (err) {
			if (err.response.status === 401) {
				try {
					await axios.post(
						`${BASE_URL}/auth/refresh`,
						{},
						{
							withCredentials: true
						}
					);
					await getCurrentUser();
				} catch (err2) {
					return null;
				}
			}
		}
	};

	const login = async (email, password) => {
		try {
			await axios.post(
				`${BASE_URL}/auth/login`,
				{
					email,
					password
				},
				{ withCredentials: true }
			);

			try {
				const res = await axios.get(`${BASE_URL}/auth/currentUser`, {
					withCredentials: true
				});
				setUser(res.data);
			} catch (err) {
				if (err.response.status === 401) {
					throw new Error();
				}
			}
		} catch (err) {
			// invalid credentials
			return err.response.data.message;
		}
	};

	const logout = async () => {
		try {
			await axios.post(
				`${BASE_URL}/auth/logout`,
				{},
				{
					withCredentials: true
				}
			);
			setUser(null);
		} catch (err) {
			console.log("error logging out", err);
		}
	};

	const signup = async (name, email, password, role = "STUDENT") => {
		try {
			await axios.post(
				`${BASE_URL}/auth/signup`,
				{
					name,
					email,
					password,
					role
				},
				{
					withCredentials: true
				}
			);
			const res = await axios.get(`${BASE_URL}/auth/currentUser`, {
				withCredentials: true
			});
			setUser(res.data);
		} catch (err) {
			console.log("Error trying to sign up", err);
		}
	};

	return (
		<UserContext.Provider value={{ user, setUser, login, logout, signup }}>
			{children}
		</UserContext.Provider>
	);
};
