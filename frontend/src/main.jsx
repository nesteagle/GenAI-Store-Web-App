import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App'
import './index.css';

const { AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_AUDIENCE } = window.APP_CONFIG;

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Auth0Provider
            domain={AUTH0_DOMAIN}
            clientId={AUTH0_CLIENT_ID}
            authorizationParams={{
                redirect_uri: window.location.origin + "/callback",
                audience: AUTH0_AUDIENCE,
                scope: "openid profile email"
            }}
        >
            <App />
        </Auth0Provider>
    </StrictMode>,
)
