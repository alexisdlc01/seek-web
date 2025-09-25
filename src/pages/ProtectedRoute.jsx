import { Navigate } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../context/UserContext.jsx";

export default function ProtectedRoute({ children, allowedRoles }) {
	const { user } = useContext(UserContext);

	if (!user) {
		return <Navigate to="/signin/student" replace />;
	}

	if (allowedRoles && !allowedRoles.includes(user.role)) {
		return <Navigate to="/" replace />;
	}

	return children;
}
