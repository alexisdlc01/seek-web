import React, {
	createContext,
	useState,
	useEffect,
	useRef,
	useCallback,
	useContext
} from "react";
import { io } from "socket.io-client";
import axios from "axios";
import UserContext from "./UserContext.jsx";

import { API_BASE } from "../lib/landlord.js";

const ListingsContext = createContext(undefined);
export default ListingsContext;

export const ListingsProvider = ({ children }) => {
	const [listings, setListings] = useState([]);
	const [loadError, setLoadError] = useState(null);
	const [currentListing, setCurrentListing] = useState({});
	const socketRef = useRef(null);
	const { user } = useContext(UserContext);

	const reload = useCallback(async () => {
		setLoadError(null);
		try {
			const res = await axios.get(`${API_BASE}/listings/mine`, {
				withCredentials: true
			});
			setListings(res.data);
		} catch (e) {
			setLoadError(e);
		}
	}, []);

	useEffect(() => {
		if (!user || user.role !== "LANDLORD_AGENCY") return;
		reload();
	}, [user, reload]);

	useEffect(() => {
		if (!user || user.role !== "LANDLORD_AGENCY") return;
		socketRef.current = io(`${API_BASE}/listings`, {
			withCredentials: true,
			transports: ["websocket"]
		});

		const handleListingUpdated = updatedListing => {
			setListings(prev =>
				prev.map(listing =>
					listing._id === updatedListing._id
						? updatedListing
						: listing
				)
			);
		};

		const handleListingDeleted = deletedId => {
			setListings(prev => prev.filter(l => l._id !== deletedId));
		};

		const handleListingCreated = newListing => {
			setListings(prev => [...prev, newListing]);
		};

		socketRef.current.on("listingUpdated", handleListingUpdated);
		socketRef.current.on("listingCreated", handleListingCreated);
		socketRef.current.on("listingDeleted", handleListingDeleted);

		return () => {
			socketRef.current.disconnect();
		};
	}, [user]);

	return (
		<ListingsContext.Provider
			value={{
				listings,
				setListings,
				loadError,
				reload,
				currentListing,
				setCurrentListing
			}}
		>
			{children}
		</ListingsContext.Provider>
	);
};
