import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../config/api.js";

const UserContext = createContext(undefined);
const refreshClient = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true
});

let refreshPromise = null;
const AUTH_REQUESTS_THAT_MUST_NOT_REFRESH = new Set([
	"/auth/login",
	"/auth/signup",
	"/auth/verify-email",
	"/auth/forgot-password",
	"/auth/confirmPasswordReset",
	"/auth/refresh"
]);

function refreshSession() {
	if (!refreshPromise) {
		refreshPromise = refreshClient
			.post("/auth/refresh")
			.finally(() => {
				refreshPromise = null;
			});
	}

	return refreshPromise;
}

function isBackendRequest(url) {
	if (!url) return false;

	try {
		const requestUrl = new URL(url, API_BASE_URL);
		const backendUrl = new URL(API_BASE_URL);
		return requestUrl.origin === backendUrl.origin;
	} catch {
		return false;
	}
}

function isAuthRefreshDisabled(url) {
	if (!url) return false;

	try {
		const requestUrl = new URL(url, API_BASE_URL);
		return [...AUTH_REQUESTS_THAT_MUST_NOT_REFRESH].some((path) =>
			requestUrl.pathname.endsWith(path)
		);
	} catch {
		return false;
	}
}

function getErrorMessage(error, fallback) {
	const message = error.response?.data?.message;
	if (Array.isArray(message)) return message.join(" ");
	return message || fallback;
}

export default UserContext;
export const UserProvider = ({ children }) => {
	const [user, setUser] = useState(null);
	const navigate = useNavigate();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		let active = true;
		const interceptor = axios.interceptors.response.use(
			response => response,
			async error => {
				const request = error.config;
				if (
					error.response?.status !== 401 ||
					!request ||
					request._authRetry ||
					request._skipAuthRefresh ||
					isAuthRefreshDisabled(request.url) ||
					!isBackendRequest(request.url)
				) {
					return Promise.reject(error);
				}

				request._authRetry = true;
				try {
					await refreshSession();
					return axios(request);
				} catch {
					if (active) setUser(null);
					return Promise.reject(error);
				}
			}
		);

		void getCurrentUser()
			.then(currentUser => {
				if (active) setUser(currentUser);
			})
			.finally(() => {
				if (active) setLoading(false);
			});

		return () => {
			active = false;
			axios.interceptors.response.eject(interceptor);
		};
	}, []);

	const getCurrentUser = async () => {
		try {
			const res = await axios.get(`${API_BASE_URL}/auth/currentUser`, {
				withCredentials: true
			});
			return res.data;
		} catch {
			return null;
		}
	};

	const login = async (email, password, expectedRole) => {
		try {
			await axios.post(
				`${API_BASE_URL}/auth/login`,
				{
					email,
					password
				},
				{ withCredentials: true }
			);

			const currentUser = await getCurrentUser();
			if (!currentUser) throw new Error("Unable to start a session.");

			if (expectedRole && currentUser.role !== expectedRole) {
				try {
					await axios.post(
						`${API_BASE_URL}/auth/logout`,
						{},
						{ withCredentials: true }
					);
				} catch {
					// Local access is still removed if the server session already expired.
				} finally {
					setUser(null);
				}
				return "This account does not have access through this sign-in page.";
			}

			setUser(currentUser);
			return null;
		} catch (err) {
			return getErrorMessage(err, "Unable to sign in. Please try again.");
		}
	};

	const logout = async () => {
		try {
			await axios.post(
				`${API_BASE_URL}/auth/logout`,
				{},
				{
					withCredentials: true
				}
			);
			setUser(null);
		} catch {
			// The local session must still be cleared if the server session expired.
		} finally {
			setUser(null);
			navigate("/");
		}
	};

	const signup = async (name, email, password) => {
		try {
			const response = await axios.post(
				`${API_BASE_URL}/auth/signup`,
				{
					name,
					email,
					password
				},
				{
					withCredentials: true
				}
			);

			const verificationRequired = Boolean(
				response.data?.verificationRequired ??
				response.data?.verification_required
			);

			if (!verificationRequired) {
				const currentUser = await getCurrentUser();
				if (!currentUser) throw new Error("Unable to start a session.");
				setUser(currentUser);
			}

			return { ok: true, verificationRequired };
		} catch (err) {
			return {
				ok: false,
				error: getErrorMessage(
					err,
					"Unable to create your account. Please try again."
				)
			};
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
