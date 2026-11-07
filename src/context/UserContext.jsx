import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../lib/landlord.js";

const UserContext = createContext(undefined);

export default UserContext;
export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const navigate = useNavigate();
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
			navigate("/");
		}
	};

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
			const res = await axios.get(`${API_BASE}/auth/currentUser`, {
				withCredentials: true
			});
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
