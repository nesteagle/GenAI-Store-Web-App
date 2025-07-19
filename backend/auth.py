"""
Auth0 authentication and authorization for FastAPI.
Handles JWT validation, user management, and permission checks.
"""

import os
from typing import Optional, Sequence

from dotenv import load_dotenv
from sqlmodel import Session, select
from fastapi import Depends, HTTPException, status, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from fastapi_plugin import Auth0FastAPI
import jwt
from jwt import PyJWKClient, PyJWTError
from pydantic import BaseModel

from .database import get_db
from .models import User

load_dotenv()

AUTH0_DOMAIN = os.getenv("AUTH0_DOMAIN")
AUTH0_CLIENT_ID = os.getenv("AUTH0_CLIENT_ID")
AUTH0_CLIENT_SECRET = os.getenv("AUTH0_CLIENT_SECRET")
AUTH0_API_AUDIENCE = os.getenv("AUTH0_API_AUDIENCE")
AUTH0_ISSUER = os.getenv("AUTH0_ISSUER")
AUTH0_ALGORITHM = os.getenv("AUTH0_ALGORITHM")
EMAIL_CUSTOM_CLAIM = "https://fastapi-store-webapp/email"

if not all(
    [
        AUTH0_DOMAIN,
        AUTH0_CLIENT_ID,
        AUTH0_CLIENT_SECRET,
        AUTH0_API_AUDIENCE,
        AUTH0_ISSUER,
    ]
):
    raise Exception("Missing required Auth0 configuration.")

auth = Auth0FastAPI(domain=AUTH0_DOMAIN, audience=AUTH0_API_AUDIENCE)


class UnauthorizedException(HTTPException):
    """HTTP 403 exception for insufficient permissions."""

    def __init__(self, detail: str = "Unauthorized"):
        super().__init__(status.HTTP_403_FORBIDDEN, detail=detail)


class UnauthenticatedException(HTTPException):
    """HTTP 401 exception for missing authentication."""

    def __init__(self):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Requires authentication"
        )


class ExtractedUserData(BaseModel):
    """User data extracted from JWT token."""

    sub: str
    email: str


class JWTValidator:
    """Validates Auth0 JWT tokens and extracts user data."""

    def __init__(
        self,
        domain: str,
        audience: str,
        issuer: str,
        algorithm: str,
        email_claim: str,
    ) -> None:
        jwks_url = f"https://{domain}/.well-known/jwks.json"
        self.jwks_client = PyJWKClient(jwks_url)
        self.audience = audience
        self.issuer = issuer
        self.algorithm = algorithm
        self.email_claim = email_claim

    def extract_user_data(self, token: str) -> ExtractedUserData:
        """Extract and validate user data from JWT token."""
        try:
            signing_key = self.jwks_client.get_signing_key_from_jwt(token).key
            payload = jwt.decode(
                token,
                signing_key,
                algorithms=[self.algorithm],
                audience=self.audience,
                issuer=self.issuer,
                leeway=10,
            )
        except PyJWTError as error:
            raise UnauthorizedException(str(error)) from error
        sub = payload.get("sub")
        email = payload.get(self.email_claim)
        if not sub or not email:
            raise UnauthorizedException("Token does not contain required data")
        return ExtractedUserData(sub=sub, email=email)


jwt_validator = JWTValidator(
    domain=AUTH0_DOMAIN,
    audience=AUTH0_API_AUDIENCE,
    issuer=AUTH0_ISSUER,
    algorithm=AUTH0_ALGORITHM,
    email_claim=EMAIL_CUSTOM_CLAIM,
)


async def extract_user_data_dependency(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer()),
) -> ExtractedUserData:
    """FastAPI dependency for extracting user data from JWT token."""
    if credentials is None:
        raise UnauthenticatedException()
    return jwt_validator.extract_user_data(credentials.credentials)


def require_permissions(required_permissions: Sequence[str]):
    """Create dependency that requires specific Auth0 permissions."""

    def dependency(claims: dict = Depends(auth.require_auth())) -> dict:
        if claims is None:
            raise UnauthorizedException()
        permissions = claims.get("permissions", [])
        for permission in required_permissions:
            if permission not in permissions:
                raise UnauthorizedException("Missing permission")
        return claims

    return dependency


def get_or_create_user(db: Session, user_sub: str, user_email: str) -> User:
    """Retrieve existing user or create new one from Auth0 data."""
    user = db.exec(select(User).where(User.auth0_sub == user_sub)).first()
    if user:
        if user.email != user_email:
            user.email = user_email
            db.commit()
        return user
    user = User(auth0_sub=user_sub, email=user_email)
    db.add(user)
    try:
        db.commit()
        db.refresh(user)
    except Exception:
        db.rollback()
        raise
    return user


def get_current_user(
    user_data: ExtractedUserData = Security(extract_user_data_dependency),
    db: Session = Depends(get_db),
) -> User:
    """FastAPI dependency for getting authenticated user."""
    return get_or_create_user(db, user_data.sub, user_data.email)
