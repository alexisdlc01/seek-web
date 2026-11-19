import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { API_BASE } from "../lib/landlord.js";

const UserContext = createContext(undefined);

export default UserContext;
export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const navigate = useNavigate();
	// Query keys carry no user id: drop the cache whenever the signed-in user changes.
	const queryClient = useQueryClient();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		(async () => {
			const currentUser = await getCurrentUser();
			setUser(currentUser);
			setLoading(false);
		})();
	}, []);

	const getCurrentUser = async () => {
		try {
			const res = await axios.get(`${API_BASE}/auth/currentUser`, {
				withCredentials: true
			});
			return res.data;
		} catch (err) {
			if (err.response.status === 401) {
				try {
					await axios.post(
						`${API_BASE}/auth/refresh`,
						{},
						{
							withCredentials: true
						}
					);
					return await getCurrentUser();
				} catch (err2) {
					return null;
				}
			}
		}
	};

	const login = async (email, password) => {
		try {
			await axios.post(
				`${API_BASE}/auth/login`,
				{
					email,
					password
				},
				{ withCredentials: true }
			);

			try {
				const res = await axios.get(`${API_BASE}/auth/currentUser`, {
					withCredentials: true
				});
				queryClient.clear();
				setUser(res.data);
			} catch (err) {
				if (err.response.status === 401) {
					throw new Error();
				}
			}
		} catch (err) {
			// invalid credentials
			return err.response?.data?.message || "Sign-in failed. Please try again.";
		}
	};

	const logout = async () => {
		try {
			await axios.post(
				`${API_BASE}/auth/logout`,
				{},
				{
					withCredentials: true
				}
			);
			setUser(null);
		} catch (err) {
			console.log("error logging out", err);
		} finally {
			queryClient.clear();
			navigate("/");
		}
	};

	// Returns an error message when the account was not created, undefined otherwise.
	const signup = async (name, email, password, role) => {
		try {
			await axios.post(
				`${API_BASE}/auth/signup`,
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
		} catch (err) {
			const message = err.response?.data?.message;
			return (Array.isArray(message) ? message.join(" ") : message) || "Sign-up failed. Please try again.";
		}
		try {
			// No session yet while email verification is pending: a 401 here is expected.
			const res = await axios.get(`${API_BASE}/auth/currentUser`, {
				withCredentials: true
			});
			queryClient.clear();
			setUser(res.data);
		} catch (err) {
			console.log("Error trying to sign up", err);
		}
	};

	return (
		<UserContext.Provider
			value={{ user, setUser, login, logout, signup, loading }}
		>
			{children}
		</UserContext.Provider>
	);
};
