import React from 'react';
import { Route } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface PrivateRouteProps {
    component: () => JSX.Element
    path: string
}

const PrivateRoute = (props: PrivateRouteProps): JSX.Element => {
    const { component, ...rest } = props;
    const { isLoggedIn, isLoggingIn, login } = useAuth();
    
    const renderFunction = (Component: () => JSX.Element) => (props: unknown) => {    
        const ifValue = !!Component && (isLoggedIn || isLoggingIn);
        if (!isLoggedIn && isLoggingIn){
            return <div>LOADING... - still logging in</div>;
        }
        if (ifValue) {
            return <Component {...props} />;
        }
        else {
            login();
            return <div>LOADING... redirect to login</div>;
        }
    };

    return <Route {...rest} render={renderFunction(component)} />;
};

export default PrivateRoute;