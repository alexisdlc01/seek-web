import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "seek-theme";
const ThemeContext = createContext({ theme: "dark", toggleTheme: () => {} });

const readStored = () => {
	try {
		const v = window.localStorage.getItem(STORAGE_KEY);
		return v === "light" || v === "dark" ? v : "dark";
	} catch {
		return "dark";
	}
};

export const ThemeProvider = ({ children }) => {
	const [theme, setThemeState] = useState(readStored);

	const setTheme = useCallback((next) => {
		setThemeState(next);
		try {
			window.localStorage.setItem(STORAGE_KEY, next);
		} catch {
			/* storage unavailable: theme only lasts for this visit */
		}
	}, []);

	const toggleTheme = useCallback(
		() => setTheme(theme === "dark" ? "light" : "dark"),
		[theme, setTheme]
	);

	return (
		<ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useTheme = () => useContext(ThemeContext);

/**
 * Sets <html data-role data-theme> while a role layout is mounted and removes
 * them on unmount, so the public site and sign-in pages keep the default dark look.
 */
export const useApplyTheme = (role) => {
	const { theme } = useTheme();
	useEffect(() => {
		const root = document.documentElement;
		root.dataset.role = role;
		root.dataset.theme = theme;
		return () => {
			delete root.dataset.role;
			delete root.dataset.theme;
		};
	}, [role, theme]);
};
