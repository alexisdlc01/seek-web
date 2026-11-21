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

	const isLandlord = user?.role === "LANDLORD_AGENCY";
	const userId = user?._id;

	// Drop the previous landlord's data on logout or account switch.
	useEffect(() => {
		setListings([]);
		setCurrentListing({});
	}, [userId, isLandlord]);

	useEffect(() => {
		if (!isLandlord) return;
		reload();
	}, [userId, isLandlord, reload]);

	useEffect(() => {
		if (!isLandlord) return;
		socketRef.current = io(`${API_BASE}/listings`, {
			withCredentials: true,
			transports: ["websocket"]
		});

		const socket = socketRef.current;
		// socket.io fires "connect" on the first connection and every reconnect:
		// it is the initial load, and it recovers events missed while offline.
		socket.on("connect", reload);
		// The server drops the socket when its access token expires and
		// socket.io never retries that. Refresh the cookie through an
		// interceptor-covered call (the interceptor skips /auth/ URLs), then reconnect.
		socket.on("disconnect", async reason => {
			if (reason !== "io server disconnect") return;
			try {
				await axios.get(`${API_BASE}/conversation`, { withCredentials: true });
				if (socketRef.current === socket) socket.connect();
			} catch {
				/* session over: do not reconnect */
			}
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
	}, [userId, isLandlord, reload]);

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
