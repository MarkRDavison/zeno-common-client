import React from 'react';
import { render, screen } from '@testing-library/react';
import PrivateRoute from './PrivateRoute';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import { AuthProvider } from './AuthContext';

const TestComponent = (): JSX.Element => <div data-testid='auth-child-element'></div>;

describe('PrivateRoute', () => {
    test('Basic provided logged in renders child', () => {            
        const history = createMemoryHistory();
        history.push('/');
        render(
            <AuthProvider value={{
                user: null,
                login: undefined,
                logout: undefined,
                isLoggedIn: true,
                isLoggingIn: true
            }} >
                <Router history={history}>
                    <PrivateRoute path='/' component={TestComponent} />
                </Router>
            </AuthProvider>
        );

        expect(screen.queryByTestId(/auth-child-element/i)).toBeDefined();
    });
    
    test('Basic provided not logged in does not render child', () => {            
        const history = createMemoryHistory();
        history.push('/');
        render(
            <AuthProvider value={{
                user: null,
                login: undefined,
                logout: undefined,
                isLoggedIn: false,
                isLoggingIn: true
            }} >
                <Router history={history}>
                    <PrivateRoute path='/' component={TestComponent} />
                </Router>
            </AuthProvider>
        );

        expect(screen.queryByTestId(/auth-child-element/i)).toBeNull();
    });
    
    test('Basic provided not logged or logging in calls login', () => {            
        const login = jest.fn();
        const history = createMemoryHistory();
        history.push('/');
        render(
            <AuthProvider value={{
                user: null,
                login: login,
                logout: undefined,
                isLoggedIn: false,
                isLoggingIn: false
            }} >
                <Router history={history}>
                    <PrivateRoute path='/' component={TestComponent} />
                </Router>
            </AuthProvider>
        );

        expect(login).toBeCalledTimes(1);
    });
});