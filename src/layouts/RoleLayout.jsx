import { useContext } from "react";
import UserContext from "../context/UserContext.jsx";
import LandlordLayout from "./LandlordLayout.jsx";
import StudentLayout from "./StudentLayout.jsx";

/** For routes shared by both roles (e.g. /edit-profile): pick the layout from the user's role. */
export default function RoleLayout() {
	const { user } = useContext(UserContext);
	return user?.role === "STUDENT" ? <StudentLayout /> : <LandlordLayout />;
}
