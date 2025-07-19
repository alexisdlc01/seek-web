import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const UserContext = createContext(undefined);

export default UserContext;

export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(true);
	const navigate = useNavigate();

	const fetchUser = async () => {
		const res = await axios.get("/api/auth/currentUser", {
			withCredentials: true
		});
		return res.data;
	};

	const refreshAccessToken = async () => {
		await axios.post(
			"/api/auth/refresh",
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
			"/api/auth/login",
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
			"/api/auth/logout",
			{},
			{
				withCredentials: true
			}
		);
		setUser(null);
	};

	return (
		<UserContext.Provider value={{ user, loading, login, logout }}>
			{children}
		</UserContext.Provider>
	);
};