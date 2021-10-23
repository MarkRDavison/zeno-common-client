import React from 'react';
import { render, act, screen } from '@testing-library/react';
import PrivateRoute from './PrivateRoute'
import { createMemoryHistory } from 'history'
import { Router, Route } from 'react-router-dom'
import { AuthContext, AuthEndpoints, UserProfile } from './AuthContext';
import axios from 'axios';
import { useAuth } from './AuthContext'

const rootLocation = 'https://testlocation.com'
const rootPathname = '/'
const authEndpoints: AuthEndpoints = {
    userEndpoint: '',
    loginEndpoint: 'https://login.endppoint/auth/login',
    logoutEndpoint: ''
}
const mockLocation: Location = {
    ancestorOrigins: undefined,
    assign: jest.fn(),
    reload: jest.fn(),
    hash: undefined,
    host: undefined,
    hostname: undefined,
    href: rootLocation,
    origin: undefined,
    pathname: rootPathname,
    port: undefined,
    protocol: undefined,
    replace: jest.fn(),
    search: undefined
};
let location: Location;
jest.mock('axios');
beforeEach(()=>{
    jest.clearAllMocks()
    location = window.location;
    delete window.location;
    window.location = mockLocation;
})
afterEach(() => {
    window.location = location;
})

const TestComponent = (): JSX.Element => {
    const { 
        logout
    } = useAuth();
    return (
        <div data-testid='auth-child-element'>
            <button data-testid='LOGOUT' onClick={logout}>LOGOUT</button>
        </div>
    )
}
const userProfile: UserProfile = {
    sub: 'asdasdasdasd',
    email_verified: false,
    name: 'name',
    preferred_username: 'username',
    given_name: 'first',
    family_name: 'last',
    email: 'email'
}

describe('AuthContext', () => {
    test('Accessing private route initially checks existing logged in user', async () => {
        jest.spyOn(axios, 'get').mockResolvedValue({data: userProfile});
        const history = createMemoryHistory({initialEntries: [rootPathname]});

        await act(async () => {
            render(
                <AuthContext {...authEndpoints}>
                    <Router history={history}>
                        <PrivateRoute path={rootPathname} component={TestComponent} />
                    </Router>
                </AuthContext>
            );
        });
                
        expect(screen.queryByTestId(/auth-child-element/i)).toBeDefined()
    })

    test('Accessing public route initially checks existing logged in user', async () => {
        jest.spyOn(axios, 'get').mockResolvedValue({data: userProfile});
        const history = createMemoryHistory({initialEntries: [rootPathname]});

        await act(async () => {
            render(
                <AuthContext {...authEndpoints}>
                    <Router history={history}>
                        <Route path={rootPathname} component={TestComponent} />
                    </Router>
                </AuthContext>
            );
        });
                
        expect(screen.queryByTestId(/auth-child-element/i)).toBeDefined()
    })

    test('Accessing public route where checking for user throws sets not logged in', async () => {
        jest.spyOn(axios, 'get').mockRejectedValue(new Error());
        const history = createMemoryHistory({initialEntries: [rootPathname]});

        await act(async () => {
            render(
                <AuthContext {...authEndpoints}>
                    <Router history={history}>
                        <Route path={rootPathname} component={TestComponent} />
                    </Router>
                </AuthContext>
            );
        });
                
        expect(screen.queryByTestId(/auth-child-element/i)).toBeDefined()
    })

    test('Accessing private route with no logged in user redirects to loginEndpoint', async () => {
        jest.spyOn(axios, 'get').mockResolvedValue({data: null});
        const history = createMemoryHistory({initialEntries: [rootPathname]});
        
        await act(async () => {
            render(
                <AuthContext {...authEndpoints}>
                    <Router history={history}>
                        <PrivateRoute path={rootPathname} component={TestComponent} />
                    </Router>
                </AuthContext>
            );
        });

        expect(mockLocation.assign).toBeCalledWith(authEndpoints.loginEndpoint + '?redirect_uri=' + rootPathname);
    })

    test('Logging out redirects to logout endpoint', async () => {
        jest.spyOn(axios, 'get').mockResolvedValue({data: userProfile});
        const history = createMemoryHistory({initialEntries: [rootPathname]});
        
        await act(async () => {
            render(
                <AuthContext {...authEndpoints}>
                    <Router history={history}>
                        <PrivateRoute path={rootPathname} component={TestComponent} />
                    </Router>
                </AuthContext>
            );
        });
        
        const button = screen.queryByTestId(/LOGOUT/i)
        act(() => button.click())
        expect(mockLocation.assign).toBeCalledWith(authEndpoints.logoutEndpoint);
    })
})