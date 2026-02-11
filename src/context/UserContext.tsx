import { createContext, useState, useEffect } from "react";
import { UserDto } from "../client";
import { useAuthControllerCurrentUser, useAuthControllerLogin, useAuthControllerLogout, useAuthControllerRefreshToken, useAuthControllerSignup } from "../api/auth/auth";

type UserContextState = {
	user: UserDto,
	loading: boolean,
	setUser: (user: UserDto) => void;
	signup: (name: string, email: string, password: string, role: string) => Promise<void>;
}

const UserContext = createContext<UserContextState>(undefined);

export default UserContext;
export const UserProvider = ({ children }) => {
	const [user, setUser] = useState<UserDto>(null);
	const {
		refetch: refetchCurrentUser,
		isLoading: loadingCurrentUser
	} = useAuthControllerCurrentUser({
		query: {
			enabled: false,
			retry: false,
		}
	});
	const { mutateAsync: mutateLogin } = useAuthControllerLogin();
	const { mutateAsync: mutateLogout } = useAuthControllerLogout();
	const { mutateAsync: mutateSignup } = useAuthControllerSignup();
	const { mutateAsync: mutateRefresh } = useAuthControllerRefreshToken();

	useEffect(() => {
		(async () => {
			const resp = await refetchCurrentUser();
			const currentUser = resp.data;
			setUser(currentUser);
			console.log(
				`Logged in as ${currentUser ? currentUser.name : currentUser}`
			);
		})();
	}, []);

	const getCurrentUser = async () => {
		try {
			await refetchCurrentUser();
		} catch (err) {
			if (err.response.status === 401) {
				try {
					await mutateRefresh(void (0));
					return await getCurrentUser();
				} catch (err2) {
					return null;
				}
			}
		}
	};

	const login = async (email: string, password: string) => {
		try {
			await mutateLogin({
				data: {
					email,
					password
				}
			})

			try {
				const resp = await refetchCurrentUser()
				setUser(resp.data);
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
			await mutateLogout(void (0), {});
			setUser(null);
		} catch (err) {
			console.log("error logging out", err);
		}
	};

	const signup = async (name: string, email: string, password: string, role: string) => {
		try {
			await mutateSignup({
				// @ts-ignore
				data: {
					name,
					email,
					password,
					role
				}
			});

			const resp = await refetchCurrentUser();
			setUser(resp.data);
		} catch (err) {
			console.log("Error trying to sign up", err);
		}
	};

	return (
		<UserContext.Provider value={{
			user,
			setUser,
			signup,
			loading: loadingCurrentUser
		}}>
			{children}
		</UserContext.Provider>
	);
};
