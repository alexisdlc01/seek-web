import { createContext, useContext, useEffect, useState } from "react";

const NavBadgeContext = createContext({ badges: {}, setBadge: () => {} });

export const NavBadgeProvider = ({ children }) => {
	const [badges, setBadges] = useState({});
	const setBadge = (key, value) =>
		setBadges((b) => (b[key] === value ? b : { ...b, [key]: value }));
	return (
		<NavBadgeContext.Provider value={{ badges, setBadge }}>
			{children}
		</NavBadgeContext.Provider>
	);
};

export const useNavBadges = () => useContext(NavBadgeContext);

/** Pages call this to publish a count to the sidebar (e.g. useNavBadge("applicants", n)). */
export const useNavBadge = (key, value) => {
	const { setBadge } = useNavBadges();
	useEffect(() => {
		setBadge(key, value);
	}, [key, value]);
};
