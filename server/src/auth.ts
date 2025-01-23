import { type Express } from "express";
import { users } from "@db/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { z } from "zod";

const scryptAsync = promisify(scrypt);
const crypto = {
  hash: async (password: string) => {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
  },
  compare: async (suppliedPassword: string, storedPassword: string) => {
    const [hashedPassword, salt] = storedPassword.split(".");
    const hashedPasswordBuf = Buffer.from(hashedPassword, "hex");
    const suppliedPasswordBuf = (await scryptAsync(
      suppliedPassword,
      salt,
      64
    )) as Buffer;
    return timingSafeEqual(hashedPasswordBuf, suppliedPasswordBuf);
  },
};

// Update schema to match frontend data
const registerSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

declare global {
  namespace Express {
    interface SessionData {
      userId: number;
    }
  }
}

export function setupAuth(app: Express) {
  const MemoryStore = createMemoryStore(session);
  const sessionSettings: session.SessionOptions = {
    secret: process.env.REPL_ID || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: app.get("env") === "production",
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
  };

  if (app.get("env") === "production") {
    app.set("trust proxy", 1);
  }

  app.use(session(sessionSettings));

  // Define requireAuth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).send("Not authenticated");
    }
    next();
  };

  app.post("/api/register", async (req, res) => {
    try {
      const result = registerSchema.safeParse(req.body);

      if (!result.success) {
        return res.status(400).send("Invalid input: " + result.error.issues.map(issue => issue.message).join(", "));
      }

      const { email, password } = result.data;

      // Check if email already exists
      const [existingUser] = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existingUser) {
        return res.status(400).send("Email already registered");
      }

      // Generate username from email
      const username = email.split('@')[0];

      const [existingUsername] = await db.select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      if (existingUsername) {
        return res.status(400).send("Username already taken");
      }

      const hashedPassword = await crypto.hash(password);

      // Store timestamp as Unix timestamp (seconds since epoch)
      const now = Math.floor(Date.now() / 1000);

      const [user] = await db.insert(users)
        .values({
          email,
          username,
          password: hashedPassword,
          role: 'user',
          createdAt: now
        })
        .returning();

      req.session.userId = user.id;
      res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (error: any) {
      console.error("Registration error:", error);
      res.status(500).send(error.message);
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).send("Email and password are required");
      }

      const [user] = await db.select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        return res.status(401).send("Invalid credentials");
      }

      const isPasswordValid = await crypto.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).send("Invalid credentials");
      }

      req.session.userId = user.id;
      res.json({ user: { id: user.id, username: user.username, email: user.email, role: user.role } });
    } catch (error: any) {
      console.error("Login error:", error);
      res.status(500).send(error.message);
    }
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Failed to logout");
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/user", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).send("Not authenticated");
    }

    try {
      const [user] = await db.select()
        .from(users)
        .where(eq(users.id, req.session.userId))
        .limit(1);

      if (!user) {
        return res.status(401).send("User not found");
      }

      res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
    } catch (error: any) {
      console.error("Error fetching user:", error);
      res.status(500).send(error.message);
    }
  });

  return { requireAuth };
}