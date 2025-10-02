import { Navigate } from "react-router-dom";
import { useContext } from "react";
import UserContext from "../context/UserContext.jsx";
import { ProgressSpinner } from "primereact/progressspinner";


export default function ProtectedRoute({ children, allowedRoles }) {
	const { user, loading } = useContext(UserContext);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen">
				<ProgressSpinner
					style={{ width: '50px', height: '50px' }}
					strokeWidth="8"
					fill="var(--surface-ground)"
					animationDuration=".5s"
				/>
			</div>
		);
	}


	if (!user) {
		return <Navigate to="/signin/student" replace />;
	}

	if (allowedRoles && !allowedRoles.includes(user.role)) {
		return <Navigate to="/" replace />;
	}

	return children;
}
