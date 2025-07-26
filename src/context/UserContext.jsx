import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const UserContext = createContext(undefined);

export default UserContext;
export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	const fetchUser = async () => {
		const res = await axios.get(`${BASE_URL}/auth/currentUser`, {
			withCredentials: true
		});
		return res.data;
	};

	const refreshAccessToken = async () => {
		await axios.post(
			`${BASE_URL}/auth/refresh`,
			{},
			{
				withCredentials: true
			}
		);
	};

	useEffect(() => {
		const loadUser = async () => {
			try {
				const userData = await fetchUser();
				setUser(userData);
			} catch {
				try {
					await refreshAccessToken();
					const userData = await fetchUser();
					setUser(userData);
				} catch {
					setUser(null);
				}
			} finally {
				setLoading(false);
			}
		};
		loadUser();
	}, []);

	const login = async (email, password) => {
		await axios.post(
			`${BASE_URL}/auth/login`,
			{ email, password },
			{
				withCredentials: true
			}
		);
		const userData = await fetchUser();
		setUser(userData);
		navigate("/");
	};

	const logout = async () => {
		await axios.post(
			`${BASE_URL}/auth/logout`,
			{},
			{
				withCredentials: true
			}
		);
		setUser(null);
	};

	const signup = async (name, email, password) => {
		await axios.post(
			"/api/auth/signup",
			{
				name,
				email,
				password
			},
			{
				withCredentials: true
			}
		);
	};

	return (
		<UserContext.Provider value={{ user, loading, login, logout }}>
			{children}
		</UserContext.Provider>
	);
};
