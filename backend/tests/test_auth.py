"""Auth endpoint tests."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@test.com",
            "password": "StrongP@ss1",
            "full_name": "New User",
            "role": "patient",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


@pytest.mark.asyncio
async def test_register_duplicate(client: AsyncClient, admin_user):
    resp = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "admin@test.com",
            "password": "StrongP@ss1",
            "full_name": "Dup",
            "role": "patient",
        },
    )
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, admin_user):
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "Admin123!"},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_login_bad_password(client: AsyncClient, admin_user):
    resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "wrong"},
    )
    assert resp.status_code == 400


@pytest.mark.asyncio
async def test_me(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "admin@test.com"
    assert data["role"] == "admin"


@pytest.mark.asyncio
async def test_refresh(client: AsyncClient, admin_user):
    login_resp = await client.post(
        "/api/v1/auth/login",
        json={"email": "admin@test.com", "password": "Admin123!"},
    )
    refresh_token = login_resp.json()["refresh_token"]
    resp = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()


@pytest.mark.asyncio
async def test_protected_no_token(client: AsyncClient):
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401
