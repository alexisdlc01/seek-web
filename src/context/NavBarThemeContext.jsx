import { createContext, useContext, useState } from "react";

const NavbarThemeContext = createContext();

export const NavbarThemeProvider = ({ children }) => {
	const [theme, setTheme] = useState("dark"); // or "dark", or any custom object

	return (
		<NavbarThemeContext.Provider value={{ theme, setTheme }}>
			{children}
		</NavbarThemeContext.Provider>
	);
};

export const useNavbarTheme = () => useContext(NavbarThemeContext);
