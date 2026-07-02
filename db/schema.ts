import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const registrations = pgTable("registrations", {
  id: serial().primaryKey(),
  ticketRef: text("ticket_ref").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  institution: text("institution").notNull(),
  seating: text("seating").notNull(), // 'hall_pass' | 'overflow'
  selfieKey: text("selfie_key").notNull(),
  deviceId: text("device_id"),
  checkedIn: boolean("checked_in").notNull().default(false),
  checkedInAt: timestamp("checked_in_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const admins = pgTable("admins", {
  id: serial().primaryKey(),
  email: text().notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: serial().primaryKey(),
  token: text().notNull().unique(),
  adminId: integer("admin_id")
    .notNull()
    .references(() => admins.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventSettings = pgTable("event_settings", {
  id: serial().primaryKey(),
  mainHallCapacity: integer("main_hall_capacity").notNull().default(2000),
});
