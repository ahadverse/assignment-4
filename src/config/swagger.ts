import swaggerJsdoc from "swagger-jsdoc";

const definition = {
  openapi: "3.0.0",
  info: {
    title: "GearUp API",
    version: "1.0.0",
    description:
      "REST API for the GearUp sports and outdoor gear rental platform.",
  },
  servers: [{ url: "/api" }],
  tags: [
    { name: "Auth" },
    { name: "Users" },
    { name: "Categories" },
    { name: "Gear" },
    { name: "Provider" },
    { name: "Rentals" },
    { name: "Payments" },
    { name: "Reviews" },
    { name: "Admin" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    parameters: {
      PageParam: {
        in: "query",
        name: "page",
        schema: { type: "integer", default: 1 },
      },
      LimitParam: {
        in: "query",
        name: "limit",
        schema: { type: "integer", default: 10 },
      },
      IdParam: {
        in: "path",
        name: "id",
        required: true,
        schema: { type: "string" },
      },
    },
    schemas: {
      RegisterInput: {
        type: "object",
        required: ["email", "password", "fullName", "phone"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 8 },
          fullName: { type: "string" },
          phone: { type: "string" },
          role: { type: "string", enum: ["CUSTOMER", "PROVIDER"] },
          address: { type: "string" },
          profilePicture: { type: "string", format: "uri" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
      UpdateProfileInput: {
        type: "object",
        properties: {
          fullName: { type: "string" },
          phone: { type: "string" },
          address: { type: "string" },
          profilePicture: { type: "string", format: "uri" },
        },
      },
      CategoryInput: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
        },
      },
      GearInput: {
        type: "object",
        required: ["categoryId", "name", "description", "brand", "pricePerDay"],
        properties: {
          categoryId: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          brand: { type: "string" },
          pricePerDay: { type: "number" },
          condition: { type: "string", enum: ["NEW", "GOOD", "FAIR"] },
          specifications: { type: "object" },
          stock: { type: "integer" },
          availability: { type: "boolean" },
          images: { type: "array", items: { type: "string", format: "uri" } },
        },
      },
      RentalInput: {
        type: "object",
        required: ["gearId", "rentalStartDate", "rentalEndDate"],
        properties: {
          gearId: { type: "string" },
          rentalStartDate: { type: "string", format: "date-time" },
          rentalEndDate: { type: "string", format: "date-time" },
          quantity: { type: "integer", default: 1 },
        },
      },
      OrderStatusInput: {
        type: "object",
        required: ["status"],
        properties: {
          status: {
            type: "string",
            enum: ["CONFIRMED", "CANCELLED", "PICKED_UP", "RETURNED"],
          },
        },
      },
      PaymentInput: {
        type: "object",
        required: ["rentalOrderId"],
        properties: { rentalOrderId: { type: "string" } },
      },
      ReviewInput: {
        type: "object",
        required: ["rentalOrderId", "rating", "reviewText"],
        properties: {
          rentalOrderId: { type: "string" },
          rating: { type: "integer", minimum: 1, maximum: 5 },
          reviewText: { type: "string" },
        },
      },
      UserStatusInput: {
        type: "object",
        required: ["status"],
        properties: {
          status: { type: "string", enum: ["ACTIVE", "SUSPENDED"] },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterInput" },
            },
          },
        },
        responses: {
          "201": { description: "User registered" },
          "409": { description: "Email already exists" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive a JWT",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginInput" },
            },
          },
        },
        responses: {
          "200": { description: "Login successful" },
          "401": { description: "Invalid credentials" },
        },
      },
    },
    "/auth/me": {
      get: {
        tags: ["Auth"],
        summary: "Get the current authenticated user",
        responses: { "200": { description: "Current user" } },
      },
    },
    "/users/me": {
      patch: {
        tags: ["Users"],
        summary: "Update own profile",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProfileInput" },
            },
          },
        },
        responses: { "200": { description: "Profile updated" } },
      },
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List all categories",
        security: [],
        responses: { "200": { description: "Categories" } },
      },
      post: {
        tags: ["Categories"],
        summary: "Create a category (admin)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryInput" },
            },
          },
        },
        responses: { "201": { description: "Category created" } },
      },
    },
    "/categories/{id}": {
      patch: {
        tags: ["Categories"],
        summary: "Update a category (admin)",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CategoryInput" },
            },
          },
        },
        responses: { "200": { description: "Category updated" } },
      },
      delete: {
        tags: ["Categories"],
        summary: "Delete a category (admin)",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: { "200": { description: "Category deleted" } },
      },
    },
    "/gear": {
      get: {
        tags: ["Gear"],
        summary: "Browse gear with filters",
        security: [],
        parameters: [
          { in: "query", name: "category", schema: { type: "string" } },
          { in: "query", name: "brand", schema: { type: "string" } },
          { in: "query", name: "search", schema: { type: "string" } },
          { in: "query", name: "minPrice", schema: { type: "number" } },
          { in: "query", name: "maxPrice", schema: { type: "number" } },
          {
            in: "query",
            name: "availability",
            schema: { type: "string", enum: ["true", "false"] },
          },
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/LimitParam" },
        ],
        responses: { "200": { description: "Gear list" } },
      },
    },
    "/gear/{id}": {
      get: {
        tags: ["Gear"],
        summary: "Get gear details",
        security: [],
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: {
          "200": { description: "Gear details" },
          "404": { description: "Gear not found" },
        },
      },
    },
    "/gear/{id}/reviews": {
      get: {
        tags: ["Gear"],
        summary: "List reviews for a gear item",
        security: [],
        parameters: [
          { $ref: "#/components/parameters/IdParam" },
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/LimitParam" },
        ],
        responses: { "200": { description: "Reviews" } },
      },
    },
    "/provider/gear": {
      post: {
        tags: ["Provider"],
        summary: "Add gear to inventory (provider)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GearInput" },
            },
          },
        },
        responses: { "201": { description: "Gear created" } },
      },
    },
    "/provider/gear/{id}": {
      put: {
        tags: ["Provider"],
        summary: "Update a gear listing (provider)",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/GearInput" },
            },
          },
        },
        responses: { "200": { description: "Gear updated" } },
      },
      delete: {
        tags: ["Provider"],
        summary: "Remove a gear listing (provider)",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: { "200": { description: "Gear removed" } },
      },
    },
    "/provider/orders": {
      get: {
        tags: ["Provider"],
        summary: "List incoming orders (provider)",
        parameters: [
          { in: "query", name: "status", schema: { type: "string" } },
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/LimitParam" },
        ],
        responses: { "200": { description: "Orders" } },
      },
    },
    "/provider/orders/{id}": {
      patch: {
        tags: ["Provider"],
        summary: "Update order status (provider)",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/OrderStatusInput" },
            },
          },
        },
        responses: {
          "200": { description: "Order updated" },
          "400": { description: "Invalid status transition" },
        },
      },
    },
    "/rentals": {
      post: {
        tags: ["Rentals"],
        summary: "Place a rental order (customer)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RentalInput" },
            },
          },
        },
        responses: { "201": { description: "Order placed" } },
      },
      get: {
        tags: ["Rentals"],
        summary: "List own rental orders",
        parameters: [
          { in: "query", name: "status", schema: { type: "string" } },
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/LimitParam" },
        ],
        responses: { "200": { description: "Orders" } },
      },
    },
    "/rentals/{id}": {
      get: {
        tags: ["Rentals"],
        summary: "Get a rental order",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: {
          "200": { description: "Order" },
          "404": { description: "Order not found" },
        },
      },
    },
    "/payments/create": {
      post: {
        tags: ["Payments"],
        summary: "Create a Stripe checkout session (customer)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PaymentInput" },
            },
          },
        },
        responses: { "201": { description: "Checkout session created" } },
      },
    },
    "/payments/webhook": {
      post: {
        tags: ["Payments"],
        summary: "Stripe webhook (raw body, no auth)",
        security: [],
        responses: { "200": { description: "Event received" } },
      },
    },
    "/payments": {
      get: {
        tags: ["Payments"],
        summary: "Get own payment history (customer)",
        parameters: [
          { in: "query", name: "status", schema: { type: "string" } },
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/LimitParam" },
        ],
        responses: { "200": { description: "Payments" } },
      },
    },
    "/payments/{id}": {
      get: {
        tags: ["Payments"],
        summary: "Get a payment",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        responses: { "200": { description: "Payment" } },
      },
    },
    "/reviews": {
      post: {
        tags: ["Reviews"],
        summary: "Create a review after return (customer)",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/ReviewInput" },
            },
          },
        },
        responses: {
          "201": { description: "Review submitted" },
          "400": { description: "Order not returned or already reviewed" },
        },
      },
    },
    "/admin/users": {
      get: {
        tags: ["Admin"],
        summary: "List all users (admin)",
        parameters: [
          { in: "query", name: "role", schema: { type: "string" } },
          { in: "query", name: "status", schema: { type: "string" } },
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/LimitParam" },
        ],
        responses: { "200": { description: "Users" } },
      },
    },
    "/admin/users/{id}": {
      patch: {
        tags: ["Admin"],
        summary: "Suspend or activate a user (admin)",
        parameters: [{ $ref: "#/components/parameters/IdParam" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UserStatusInput" },
            },
          },
        },
        responses: { "200": { description: "User status updated" } },
      },
    },
    "/admin/gear": {
      get: {
        tags: ["Admin"],
        summary: "List all gear (admin)",
        parameters: [
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/LimitParam" },
        ],
        responses: { "200": { description: "Gear" } },
      },
    },
    "/admin/rentals": {
      get: {
        tags: ["Admin"],
        summary: "List all rental orders (admin)",
        parameters: [
          { in: "query", name: "status", schema: { type: "string" } },
          { $ref: "#/components/parameters/PageParam" },
          { $ref: "#/components/parameters/LimitParam" },
        ],
        responses: { "200": { description: "Orders" } },
      },
    },
  },
};

export const swaggerSpec = swaggerJsdoc({ definition, apis: [] });
