import { describe, it, expect, beforeAll, afterAll, beforeEach } from "@jest/globals";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

import { createTestApp, clearCollections, createTestUser, createAdminUser } from "../helpers/testApp.js";
import User from "../../models/user.model.js";
import Ticket from "../../models/Ticket.model.js";
import TicketReply from "../../models/TicketReply.model.js";

process.env.JWT_SECRET = "test-jwt-secret-for-integration-tests";
process.env.SUPER_ADMIN_EMAIL = "superadmin@placementmentor.com";

describe("Ticket Integration Tests", () => {
  let app;
  let mongoServer;
  let user;
  let admin;
  let userCookies;
  let adminCookies;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
    app = createTestApp();
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await clearCollections();
    user = await createTestUser(User);
    admin = await createAdminUser(User);

    const userLogin = await request(app)
      .post("/api/auth/signin")
      .send({ email: "test@example.com", password: "TestPass123!" });
    userCookies = userLogin.headers["set-cookie"];

    const adminLogin = await request(app)
      .post("/api/auth/signin")
      .send({ email: "admin@example.com", password: "AdminPass123!" });
    adminCookies = adminLogin.headers["set-cookie"];
  });

  /* ================= CREATE TICKET ================= */
  describe("POST /api/tickets/", () => {
    it("creates ticket with valid data", async () => {
      const res = await request(app)
        .post("/api/tickets/")
        .set("Cookie", userCookies)
        .send({
          subject: "Login Issue",
          category: "Login Issue",
          priority: "High",
          description: "Cannot login to my account",
          email: "test@example.com",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.ticketId).toMatch(/^PM-\d{4}$/);
      expect(res.body.data.status).toBe("Open");
      expect(res.body.data.user.email).toBe("test@example.com");
    });

    it("rejects ticket without subject", async () => {
      const res = await request(app)
        .post("/api/tickets/")
        .set("Cookie", userCookies)
        .send({
          category: "Login Issue",
          description: "Cannot login",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Subject is required/);
    });

    it("rejects ticket without description", async () => {
      const res = await request(app)
        .post("/api/tickets/")
        .set("Cookie", userCookies)
        .send({
          subject: "Login Issue",
          category: "Login Issue",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Description is required/);
    });

    it("rejects invalid category", async () => {
      const res = await request(app)
        .post("/api/tickets/")
        .set("Cookie", userCookies)
        .send({
          subject: "Issue",
          category: "InvalidCategory",
          description: "Test",
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/Invalid category/);
    });

    it("defaults priority to Low when invalid", async () => {
      const res = await request(app)
        .post("/api/tickets/")
        .set("Cookie", userCookies)
        .send({
          subject: "Issue",
          category: "Bug Report",
          priority: "Critical",
          description: "Test description",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.priority).toBe("Low");
    });

    it("rejects unauthenticated request", async () => {
      const res = await request(app)
        .post("/api/tickets/")
        .send({
          subject: "Issue",
          category: "Bug Report",
          description: "Test",
        });

      expect(res.status).toBe(401);
    });
  });

  /* ================= GET MY TICKETS ================= */
  describe("GET /api/tickets/my", () => {
    it("returns user's tickets with pagination", async () => {
      await Ticket.create({
        ticketId: "PM-1001",
        user: user._id,
        subject: "Issue 1",
        category: "Bug Report",
        description: "Desc 1",
        email: "test@example.com",
      });

      await Ticket.create({
        ticketId: "PM-1002",
        user: user._id,
        subject: "Issue 2",
        category: "Payment",
        description: "Desc 2",
        email: "test@example.com",
      });

      const res = await request(app)
        .get("/api/tickets/my")
        .set("Cookie", userCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.tickets).toHaveLength(2);
      expect(res.body.data.pagination.total).toBe(2);
    });

    it("filters tickets by status", async () => {
      await Ticket.create({
        ticketId: "PM-1001",
        user: user._id,
        subject: "Open Issue",
        category: "Bug Report",
        description: "Desc",
        email: "test@example.com",
        status: "Open",
      });

      await Ticket.create({
        ticketId: "PM-1002",
        user: user._id,
        subject: "Solved Issue",
        category: "Bug Report",
        description: "Desc",
        email: "test@example.com",
        status: "Solved",
      });

      const res = await request(app)
        .get("/api/tickets/my?status=Open")
        .set("Cookie", userCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.tickets).toHaveLength(1);
      expect(res.body.data.tickets[0].status).toBe("Open");
    });
  });

  /* ================= GET TICKET DETAIL ================= */
  describe("GET /api/tickets/:id", () => {
    it("returns ticket detail for owner", async () => {
      const ticket = await Ticket.create({
        ticketId: "PM-1001",
        user: user._id,
        subject: "My Issue",
        category: "Bug Report",
        description: "Desc",
        email: "test@example.com",
      });

      const res = await request(app)
        .get(`/api/tickets/${ticket._id}`)
        .set("Cookie", userCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.ticket.subject).toBe("My Issue");
    });

    it("allows admin to view any ticket", async () => {
      const ticket = await Ticket.create({
        ticketId: "PM-1001",
        user: user._id,
        subject: "User Issue",
        category: "Bug Report",
        description: "Desc",
        email: "test@example.com",
      });

      const res = await request(app)
        .get(`/api/tickets/${ticket._id}`)
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.ticket.subject).toBe("User Issue");
    });

    it("blocks other users from viewing ticket", async () => {
      const otherUser = await createTestUser(User, {
        email: "other@example.com",
        fullName: "Other User",
      });

      const ticket = await Ticket.create({
        ticketId: "PM-1001",
        user: user._id,
        subject: "Private",
        category: "Bug Report",
        description: "Desc",
        email: "test@example.com",
      });

      const otherLogin = await request(app)
        .post("/api/auth/signin")
        .send({ email: "other@example.com", password: "TestPass123!" });
      const otherCookies = otherLogin.headers["set-cookie"];

      const res = await request(app)
        .get(`/api/tickets/${ticket._id}`)
        .set("Cookie", otherCookies);

      expect(res.status).toBe(403);
    });
  });

  /* ================= REPLY TO TICKET ================= */
  describe("POST /api/tickets/:id/reply", () => {
    it("user can reply to their ticket", async () => {
      const ticket = await Ticket.create({
        ticketId: "PM-1001",
        user: user._id,
        subject: "Issue",
        category: "Bug Report",
        description: "Desc",
        email: "test@example.com",
        status: "Open",
      });

      const res = await request(app)
        .post(`/api/tickets/${ticket._id}/reply`)
        .set("Cookie", userCookies)
        .send({ message: "Any update?" });

      expect(res.status).toBe(201);
      expect(res.body.data.message).toBe("Any update?");
    });

    it("admin reply changes status to In Progress", async () => {
      const ticket = await Ticket.create({
        ticketId: "PM-1001",
        user: user._id,
        subject: "Issue",
        category: "Bug Report",
        description: "Desc",
        email: "test@example.com",
        status: "Open",
      });

      const res = await request(app)
        .post(`/api/tickets/${ticket._id}/reply`)
        .set("Cookie", adminCookies)
        .send({ message: "We are looking into this" });

      expect(res.status).toBe(201);

      const updated = await Ticket.findById(ticket._id);
      expect(updated.status).toBe("In Progress");
      expect(updated.replyCount).toBe(1);
    });

    it("blocks reply to closed ticket", async () => {
      const ticket = await Ticket.create({
        ticketId: "PM-1001",
        user: user._id,
        subject: "Issue",
        category: "Bug Report",
        description: "Desc",
        email: "test@example.com",
        status: "Solved",
      });

      const res = await request(app)
        .post(`/api/tickets/${ticket._id}/reply`)
        .set("Cookie", userCookies)
        .send({ message: "Still broken" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/closed ticket/);
    });

    it("rejects empty message", async () => {
      const ticket = await Ticket.create({
        ticketId: "PM-1001",
        user: user._id,
        subject: "Issue",
        category: "Bug Report",
        description: "Desc",
        email: "test@example.com",
      });

      const res = await request(app)
        .post(`/api/tickets/${ticket._id}/reply`)
        .set("Cookie", userCookies)
        .send({ message: "   " });

      expect(res.status).toBe(400);
    });
  });

  /* ================= REOPEN TICKET ================= */
  describe("PATCH /api/tickets/:id/reopen", () => {
    it("user can reopen solved ticket", async () => {
      const ticket = await Ticket.create({
        ticketId: "PM-1001",
        user: user._id,
        subject: "Issue",
        category: "Bug Report",
        description: "Desc",
        email: "test@example.com",
        status: "Solved",
        solvedAt: new Date(),
      });

      const res = await request(app)
        .patch(`/api/tickets/${ticket._id}/reopen`)
        .set("Cookie", userCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("Open");
      expect(res.body.data.isReopened).toBe(true);
    });

    it("blocks reopening non-solved ticket", async () => {
      const ticket = await Ticket.create({
        ticketId: "PM-1001",
        user: user._id,
        subject: "Issue",
        category: "Bug Report",
        description: "Desc",
        email: "test@example.com",
        status: "Open",
      });

      const res = await request(app)
        .patch(`/api/tickets/${ticket._id}/reopen`)
        .set("Cookie", userCookies);

      expect(res.status).toBe(400);
    });
  });

  /* ================= ADMIN ROUTES ================= */
  describe("GET /api/tickets/admin/all", () => {
    it("admin can view all tickets", async () => {
      await Ticket.create({
        ticketId: "PM-1001",
        user: user._id,
        subject: "User Issue",
        category: "Bug Report",
        description: "Desc",
        email: "test@example.com",
      });

      const res = await request(app)
        .get("/api/tickets/admin/all")
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.tickets).toHaveLength(1);
    });

    it("blocks non-admin from admin routes", async () => {
      const res = await request(app)
        .get("/api/tickets/admin/all")
        .set("Cookie", userCookies);

      expect(res.status).toBe(403);
    });
  });

  describe("PATCH /api/tickets/admin/:id/status", () => {
    it("admin can update ticket status", async () => {
      const ticket = await Ticket.create({
        ticketId: "PM-1001",
        user: user._id,
        subject: "Issue",
        category: "Bug Report",
        description: "Desc",
        email: "test@example.com",
        status: "Open",
      });

      const res = await request(app)
        .patch(`/api/tickets/admin/${ticket._id}/status`)
        .set("Cookie", adminCookies)
        .send({ status: "Solved" });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("Solved");
      expect(res.body.data.solvedAt).toBeDefined();
    });

    it("rejects invalid status", async () => {
      const ticket = await Ticket.create({
        ticketId: "PM-1001",
        user: user._id,
        subject: "Issue",
        category: "Bug Report",
        description: "Desc",
        email: "test@example.com",
      });

      const res = await request(app)
        .patch(`/api/tickets/admin/${ticket._id}/status`)
        .set("Cookie", adminCookies)
        .send({ status: "InvalidStatus" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/tickets/admin/stats", () => {
    it("returns ticket statistics", async () => {
      await Ticket.create({
        ticketId: "PM-1001",
        user: user._id,
        subject: "Open",
        category: "Bug Report",
        description: "Desc",
        email: "test@example.com",
        status: "Open",
        priority: "High",
      });

      await Ticket.create({
        ticketId: "PM-1002",
        user: user._id,
        subject: "Solved",
        category: "Payment",
        description: "Desc",
        email: "test@example.com",
        status: "Solved",
        priority: "Low",
      });

      const res = await request(app)
        .get("/api/tickets/admin/stats")
        .set("Cookie", adminCookies);

      expect(res.status).toBe(200);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.open).toBe(1);
      expect(res.body.data.solved).toBe(1);
      expect(res.body.data.highPriority).toBe(1);
    });
  });
});
