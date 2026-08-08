const { z } = require("zod");

// Auth schemas
const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters")
    .trim(),
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password cannot exceed 100 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),
  password: z.string().min(1, "Password is required"),
});

// App schemas
const createAppSchema = z.object({
  name: z
    .string()
    .min(1, "App name is required")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional()
    .default(""),
});

const updateAppSchema = z.object({
  name: z
    .string()
    .min(1, "App name is required")
    .max(100, "Name cannot exceed 100 characters")
    .trim()
    .optional(),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .trim()
    .optional(),
  status: z.enum(["active", "archived"]).optional(),
});

// Service schemas
const createServiceSchema = z.object({
  name: z
    .string()
    .min(1, "Service name is required")
    .max(100, "Name cannot exceed 100 characters")
    .trim(),
  type: z
    .enum(["api", "database", "queue", "cache", "gateway", "worker", "frontend", "other"])
    .optional()
    .default("api"),
  config: z
    .object({
      port: z.number().min(1).max(65535).optional(),
      protocol: z.enum(["http", "https", "grpc", "tcp", "udp"]).optional(),
      healthCheck: z.string().url().optional().or(z.literal("")),
      endpoint: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
  metadata: z
    .object({
      version: z.string().optional(),
      language: z.string().optional(),
      framework: z.string().optional(),
    })
    .optional(),
  position: z
    .object({
      x: z.number().optional().default(0),
      y: z.number().optional().default(0),
    })
    .optional(),
});

const updateServiceSchema = z.object({
  name: z
    .string()
    .min(1, "Service name is required")
    .max(100, "Name cannot exceed 100 characters")
    .trim()
    .optional(),
  type: z
    .enum(["api", "database", "queue", "cache", "gateway", "worker", "frontend", "other"])
    .optional(),
  status: z.enum(["healthy", "degraded", "down", "unknown"]).optional(),
  config: z
    .object({
      port: z.number().min(1).max(65535).optional(),
      protocol: z.enum(["http", "https", "grpc", "tcp", "udp"]).optional(),
      healthCheck: z.string().url().optional().or(z.literal("")),
      endpoint: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
  runtime: z
    .object({
      cpu: z.number().min(0).max(100).optional(),
      memory: z.number().min(0).max(100).optional(),
      requests: z.number().optional(),
      errors: z.number().optional(),
      latency: z.number().optional(),
    })
    .optional(),
  position: z
    .object({
      x: z.number().optional(),
      y: z.number().optional(),
    })
    .optional(),
  metadata: z
    .object({
      version: z.string().optional(),
      language: z.string().optional(),
      framework: z.string().optional(),
    })
    .optional(),
});

const updatePositionSchema = z.object({
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

const updateMetricsSchema = z.object({
  cpu: z.number().min(0).max(100).optional(),
  memory: z.number().min(0).max(100).optional(),
  requests: z.number().optional(),
  errors: z.number().optional(),
  latency: z.number().optional(),
});

// Edge schemas
const createEdgeSchema = z.object({
  source: z.string().min(1, "Source service ID is required"),
  target: z.string().min(1, "Target service ID is required"),
  label: z
    .enum(["HTTP", "HTTPS", "gRPC", "TCP", "UDP", "WebSocket", "Event", "Other"])
    .optional()
    .default("HTTP"),
  metadata: z
    .object({
      timeout: z.number().optional(),
      retries: z.number().optional(),
      circuitBreaker: z.boolean().optional(),
    })
    .optional(),
});

const updateEdgeSchema = z.object({
  label: z
    .enum(["HTTP", "HTTPS", "gRPC", "TCP", "UDP", "WebSocket", "Event", "Other"])
    .optional(),
  metadata: z
    .object({
      timeout: z.number().optional(),
      retries: z.number().optional(),
      circuitBreaker: z.boolean().optional(),
    })
    .optional(),
});

module.exports = {
  signupSchema,
  loginSchema,
  createAppSchema,
  updateAppSchema,
  createServiceSchema,
  updateServiceSchema,
  updatePositionSchema,
  updateMetricsSchema,
  createEdgeSchema,
  updateEdgeSchema,
};
