import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';

export interface AuthEndpoints {
    userEndpoint: string
    loginEndpoint: string
    logoutEndpoint: string
}

interface AuthProviderProps extends AuthEndpoints {
    children?: JSX.Element
}

export interface UserProfile {
    sub: string
    email_verified: boolean
    name: string
    preferred_username: string
    given_name: string
    family_name: string
    email: string
}

interface ContextProps {
    user: UserProfile | null
    isLoggedIn: boolean
    isLoggingIn: boolean
    login: () => void
    logout: () => void   
}

export const Context = React.createContext<ContextProps>({
    user: null,
    isLoggedIn: false,
    isLoggingIn: true,
    login: undefined,
    logout: undefined
});

export const AuthConsumer = Context.Consumer;
export const AuthProvider = Context.Provider;
export const AuthContext = (props: AuthProviderProps): JSX.Element => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(true);
    useEffect(() => {
        setIsLoggedIn(false);
        setIsLoggingIn(true);
        axios
            .get(props.userEndpoint, {
                withCredentials: true
            })
            .then(r => {
                if (r.data) {
                    setUser(r.data as UserProfile);
                    setIsLoggedIn(true);
                    setIsLoggingIn(false);
                }
                else {                    
                    setUser(null);
                    setIsLoggedIn(false);
                    setIsLoggingIn(false);
                }
            })
            .catch(() => {
                setUser(null);
                setIsLoggedIn(false);
                setIsLoggingIn(false);
            });
    }, [setUser, setIsLoggingIn, setIsLoggedIn]);
    
    return (
        <Context.Provider value={{
            user: user,
            isLoggedIn: isLoggedIn,
            isLoggingIn: isLoggingIn,
            login: () => window.location.assign(`${props.loginEndpoint}?redirect_uri=${window.location.pathname}`),
            logout:() => window.location.assign(props.logoutEndpoint)
        }}>
            {props.children}
        </Context.Provider>
    );
};

export const useAuth = (): ContextProps => useContext(Context);