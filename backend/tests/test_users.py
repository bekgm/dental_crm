"""User endpoint tests."""

from __future__ import annotations

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_users(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/users", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "items" in data
    assert "total" in data


@pytest.mark.asyncio
async def test_create_user(client: AsyncClient, auth_headers):
    resp = await client.post(
        "/api/v1/users",
        headers=auth_headers,
        json={
            "email": "doctor1@test.com",
            "password": "Doctor123!",
            "full_name": "Dr. Smith",
            "role": "doctor",
        },
    )
    assert resp.status_code == 201
    assert resp.json()["role"] == "doctor"


@pytest.mark.asyncio
async def test_update_user(client: AsyncClient, auth_headers, admin_user):
    resp = await client.patch(
        f"/api/v1/users/{admin_user.id}",
        headers=auth_headers,
        json={"full_name": "Updated Admin"},
    )
    assert resp.status_code == 200
    assert resp.json()["full_name"] == "Updated Admin"


@pytest.mark.asyncio
async def test_non_admin_cannot_list_users(client: AsyncClient):
    # Register as patient
    reg = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "patient1@test.com",
            "password": "Patient123!",
            "full_name": "Patient One",
            "role": "patient",
        },
    )
    token = reg.json()["access_token"]
    resp = await client.get(
        "/api/v1/users",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 403
