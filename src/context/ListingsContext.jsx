import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ListingsContext = createContext(undefined);
export default ListingsContext;

export const ListingsProvider = ({ children }) => {
	const [listings, setListings] = useState([]);
	const [currentListing, setCurrentListing] = useState({});

	useEffect(() => {
		(async () => {
			const res = await axios.get(`${BASE_URL}/listings/mine`, {
				withCredentials: true
			});
			setListings(res.data);
		})();
	}, []);

	return (
		<ListingsContext.Provider
			value={{ listings, setListings, currentListing, setCurrentListing }}
		>
			{children}
		</ListingsContext.Provider>
	);
};
