import React, { createContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ListingsContext = createContext(undefined);
export default ListingsContext;

export const ListingsProvider = ({ children }) => {
	const [listings, setListings] = useState([]);
	const [currentListing, setCurrentListing] = useState({});
	const socketRef = useRef(null);

	useEffect(() => {
		(async () => {
			const res = await axios.get(`${BASE_URL}/listings/mine`, {
				withCredentials: true
			});
			setListings(res.data);
		})();
	}, []);

	useEffect(() => {
		socketRef.current = io(BASE_URL, { withCredentials: true });

		const handleListingUpdated = updatedListing => {
			setListings(prev =>
				prev.map(listing =>
					listing._id === updatedListing._id ? updatedListing : listing
				)
			);
		};

		const handleListingDeleted = deletedId => {
			setListings(prev => prev.filter(l => l._id !== deletedId));
		};

		socketRef.current.on("listingUpdated", handleListingUpdated);
		socketRef.current.on("listingDeleted", handleListingDeleted);

		return () => {
			socketRef.current.disconnect();
		};
	}, []);

	return (
		<ListingsContext.Provider
			value={{ listings, setListings, currentListing, setCurrentListing }}
		>
			{children}
		</ListingsContext.Provider>
	);
};
