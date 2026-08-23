import React, {
	createContext,
	useState,
	useEffect,
	useRef,
	useContext
} from "react";
import { io } from "socket.io-client";
import axios from "axios";
import UserContext from "./UserContext.jsx";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const ListingsContext = createContext(undefined);
export default ListingsContext;

export const ListingsProvider = ({ children }) => {
	const [listings, setListings] = useState([]);
	const [currentListing, setCurrentListing] = useState({});
	const socketRef = useRef(null);
	const { user } = useContext(UserContext);

	useEffect(() => {
		if (!user || user.role !== "LANDLORD_AGENCY") {
			setListings([]);
			setCurrentListing({});
			return;
		}
		(async () => {
			const res = await axios.get(`${BASE_URL}/listings/mine`, {
				withCredentials: true
			});
			setListings(res.data);
		})();
	}, [user]);

	useEffect(() => {
		if (!user || user.role !== "LANDLORD_AGENCY") return;
		socketRef.current = io(`${BASE_URL}/listings`, {
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
				currentListing,
				setCurrentListing
			}}
		>
			{children}
		</ListingsContext.Provider>
	);
};
