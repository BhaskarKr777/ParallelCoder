import { describe, it, expect } from "vitest";
import request from "supertest";

import app from "../app.js";

const uniqueEmail = () => `test_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;

describe("auth", () => {
  it("registers a new user and sets a session cookie", async () => {
    const email = uniqueEmail();

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email, username: "Tester", password: "TestPass123!" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.password).toBeUndefined();
    expect(res.headers["set-cookie"].some((c) => c.startsWith("accessToken="))).toBe(true);
  });

  it("rejects a duplicate email", async () => {
    const email = uniqueEmail();

    await request(app)
      .post("/api/auth/register")
      .send({ email, username: "Tester", password: "TestPass123!" })
      .expect(201);

    const res = await request(app)
      .post("/api/auth/register")
      .send({ email, username: "Tester2", password: "TestPass123!" });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("rejects a weak password", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: uniqueEmail(), username: "Tester", password: "short" });

    expect(res.status).toBe(400);
  });

  it("logs in with correct credentials and rejects wrong ones", async () => {
    const email = uniqueEmail();
    const password = "TestPass123!";

    await request(app)
      .post("/api/auth/register")
      .send({ email, username: "Tester", password })
      .expect(201);

    const goodLogin = await request(app)
      .post("/api/auth/login")
      .send({ email, password });

    expect(goodLogin.status).toBe(200);

    const badLogin = await request(app)
      .post("/api/auth/login")
      .send({ email, password: "wrong-password" });

    expect(badLogin.status).toBe(401);
  });

  it("rejects /me without a session", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns the current user for a valid session", async () => {
    const email = uniqueEmail();
    const agent = request.agent(app);

    await agent
      .post("/api/auth/register")
      .send({ email, username: "Tester", password: "TestPass123!" })
      .expect(201);

    const res = await agent.get("/api/auth/me");

    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
  });
});
