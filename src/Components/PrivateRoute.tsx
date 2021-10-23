import React from "react";
import { Route } from "react-router-dom";
import { useAuth } from "./AuthContext";

const PrivateRoute = (props: any): JSX.Element => {
    const { component, ...rest } = props;
    const { isLoggedIn, isLoggingIn, login } = useAuth();
    
    const renderFunction = (Component: any) => (props: any) => {    
        var ifValue = !!Component && (isLoggedIn || isLoggingIn);
        if (!isLoggedIn && isLoggingIn){
            return <div>LOADING...</div>;
        }
        if (ifValue) {
            return <Component {...props} />;
        }
        else {
            login();
            return <div>LOADING...</div>;
        }
    }

    return <Route {...rest} render={renderFunction(component)} />;
};

export default PrivateRoute;