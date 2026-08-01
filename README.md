# Book Manager

A full-stack book management application built with MongoDB, Express, React (Next.js), and Node.js (MERN stack). The application allows users to manage their book collection with features like adding books, updating book status, and categorizing books by reading status.

## Table of Contents
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [API Documentation](#api-documentation)
  - [Authentication Routes](#authentication-routes)
  - [Book Routes](#book-routes)
- [Database Schemas](#database-schemas)
  - [User Schema](#user-schema)
  - [Book Schema](#book-schema)
- [Environment Variables](#environment-variables)
  - [Backend .env](#backend-env)
  - [Frontend .env](#frontend-env)
- [Setup Instructions](#setup-instructions)
- [Available Scripts](#available-scripts)

## Tech Stack

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (React framework)
- **Styling**: CSS Modules / Global CSS
- **HTTP Client**: Fetch API / Axios (implied by usage)
- **State Management**: React Context / useState/useEffect (implied)
- **Build Tool**: [Next.js](https://nextjs.org/) (includes webpack/babel)
- **Language**: TypeScript

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/) ODM
- **Middleware**: 
  - [cors](https://www.npmjs.com/package/cors) for Cross-Origin Resource Sharing
  - [cors](https://www.npmjs.com/package/cors) for Cross-Origin Resource Sharing
  - [body-parser](https://www.npmjs.com/package/body-parser) for parsing incoming request bodies
  - [cookie-parser](https://www.npmjs.com/package/cookie-parser) for parsing cookies
  - [dotenv](https://www.npmjs.com/package/dotenv) for environment variable management
- **Authentication**: JWT (JSON Web Tokens) via cookies (implied by cookie-parser usage)
- **Validation**: Mongoose schema validation

### DevOps & Tools
- **Version Control**: Git
- **Package Managers**: 
  - Frontend: npm/yarn/pnpm (implied by Next.js)
  - Backend: npm/yarn/pnpm
- **Linting**: ESLint (configured via eslint.config.mjs)
- **Styling**: PostCSS (configured via postcss.config.mjs)
- **Type Checking**: TypeScript (frontend)

## Architecture

### Overall Structure
```
book manger/
├── frontend/                 # Next.js frontend application
│   ├── app/                  # Next.js app directory (app router)
│   ├── public/               # Static assets
│   ├── styles/               # CSS stylesheets
│   ├── component/            # Reusable React components
│   ├── lib/                  # Utility functions and libraries
│   ├── next.config.ts        # Next.js configuration
│   ├── tsconfig.json         # TypeScript configuration
│   ├── eslint.config.mjs     # ESLint configuration
│   ├── postcss.config.mjs    # PostCSS configuration
│   └── package.json          # Frontend dependencies and scripts
│
└── backend/                  # Backend Express.js application
    ├── controllers/          # Request handlers for routes
    ├── Middlewares/          # Custom middleware (authentication, etc.)
    ├── models/               # Mongoose schemas and models
    ├── routes/               # Express route definitions
    ├── config/               # Database configuration
    ├── .env                  # Environment variables (not in repo, example provided)
    ├── server.js             # Entry point for the Express server
    └── package.json          # Backend dependencies and scripts
```

### Data Flow
1. **Client → API Routes**: The Next.js frontend makes API requests to the backend Express server.
2. **API Routes → Controllers**: Express routes delegate request handling to controller functions.
3. **Controllers → Models**: Controllers interact with Mongoose models to perform database operations.
4. **Models → Database**: Mongoose models translate JavaScript objects to MongoDB documents and vice versa.
5. **Database → Models → Controllers → API Routes → Client**: Data flows back in the reverse direction.

### Key Architectural Decisions
- **Separation of Concerns**: Clear separation between frontend (Next.js) and backend (Express/MongoDB).
- **Middleware Usage**: Express middleware handles cross-cutting concerns like CORS, body parsing, and cookie parsing.
- **Authentication**: Protected routes use a custom `protect` middleware to verify user authentication.
- **RESTful API Design**: API endpoints follow REST conventions where appropriate.
- **Environment Configuration**: Sensitive configuration is stored in environment variables.

## API Documentation

### Base URL
```
http://localhost:5000/api
```
*(Note: The backend runs on port 5000 by default, as seen in `Backend/server.js`)*

### Authentication Routes
All authentication routes are prefixed with `/api/auth`

| Method | Endpoint   | Description           | Request Body                     | Response (Success)          | Protected |
|--------|------------|-----------------------|----------------------------------|-----------------------------|-----------|
| POST   | `/login`   | Authenticate user     | `{ email, password }`            | `{ user, token }` (cookie)  | No        |
| POST   | `/register`| Register new user     | `{ name, email, password }`      | `{ user }`                  | No        |
| POST   | `/logout`  | Logout user           | `{}`                             | `{ message }`               | Yes       |

### Book Routes
All book routes are prefixed with `/api/books` and require authentication (protected by `protect` middleware)

| Method | Endpoint         | Description                             | Request Body/Params                         | Response (Success)          |
|--------|------------------|-----------------------------------------|---------------------------------------------|-----------------------------|
| POST   | `/addbook`       | Add a new book                          | `{ title, author, tags[], status, userId }` | `{ book }`                  |
| GET    | `/getbooks`      | Get all books for the logged-in user    | None                                        | `{ books[] }`               |
| PATCH  | `/updatebook/:id`| Update book status                      | `{ status }` (in body)                      | `{ updatedBook }`           |
| PUT    | `/updatebook/:id`| Update book details (title, author, etc)| `{ title, author, tags[] }`                 | `{ updatedBook }`           |
| GET    | `/status`        | Get books grouped by status             | None                                        | `{ WantToRead[], Reading[], Completed[] }` |
| DELETE | `/delete/:id`    | Delete a book                           | `:id` (URL param)                           | `{ message }`               |

#### Request Body Examples
**Add Book**:
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "tags": ["classic", "fiction"],
  "status": "Want to Read",
  "userId": "60d5ec9aff3b3a2b3c7d2e9f"
}
```

**Update Book Status**:
```json
{
  "status": "Reading"
}
```

**Update Book Details**:
```json
{
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "tags": ["classic", "fiction", "literature"]
}
```

#### Response Examples
**Get Books**:
```json
{
  "books": [
    {
      "_id": "60d5ec9aff3b3a2b3c7d2e9f",
      "title": "The Great Gatsby",
      "author": "F. Scott Fitzgerald",
      "tags": ["classic", "fiction"],
      "status": "Want to Read",
      "user": "60d5ec9aff3b3a2b3c7d2e9f",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z",
      "__v": 0
    }
  ]
}
```

**Get Books by Status**:
```json
{
  "WantToRead": [...array of book objects...],
  "Reading": [...array of book objects...],
  "Completed": [...array of book objects...]
}
```

## Database Schemas

### User Schema (`Backend/models/Auth.js`)
```javascript
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  }
});
```
- **Fields**:
  - `name`: User's full name (required, string)
  - `email`: User's email address (required, string, unique)
  - `password`: Hashed password (required, string)
- **Indexes**: Automatic unique index on `email`
- **Methods**: None defined (plain schema)
- **Statics**: None defined (uses default mongoose model methods)

### Book Schema (`Backend/models/book.js`)
```javascript
const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    status: {
      type: String,
      enum: ["Want to Read", "Reading", "Completed"],
      default: "Want to Read",
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the Auth model (despite name mismatch)
      required: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);
```
- **Fields**:
  - `title`: Book title (required, string, trimmed)
  - `author`: Book author (required, string, trimmed)
  - `tags`: Array of strings for categorization (each trimmed)
  - `status`: Reading status (enum: "Want to Read", "Reading", "Completed"; defaults to "Want to Read")
  - `user`: Reference to the User model (required, ObjectId)
- **Indexes**: Automatic index on `_id`; querying by `user` will benefit from MongoDB's automatic indexing on referenced fields
- **Methods**: None defined
- **Statics**: None defined
- **Virtuals**: None defined
- **Timestamps**: Automatically manages `createdAt` and `updatedAt` fields

## Environment Variables

### Backend .env
Create a file named `.env` in the `backend/` directory with the following contents:

```env
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/bookmanager
```
- **PORT**: Port on which the Express server will run (default: 5000)
- **FRONTEND_URL**: Origin of the frontend application (used for CORS configuration)
- **MONGODB_URI**: MongoDB connection string (adjust for your MongoDB instance)

### Frontend .env
Create a file named `.env.local` in the `frontend/` directory (Next.js convention) with the following contents:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```
- **NEXT_PUBLIC_API_URL**: Base URL for API requests (will be exposed to the browser)

> **Note**: Never commit `.env` or `.env.local` files to version control. Add them to `.gitignore`.

## Setup Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (v14 or higher recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)
- [MongoDB](https://www.mongodb.com/try/download/community) (v4.0 or higher)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on the [Backend .env](#backend-env) example above.
4. Start the development server:
   ```bash
   npm run dev
   ```
   *(Note: If you don't have a "dev" script, you may need to use `node server.js` or add a script to package.json)*

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file based on the [Frontend .env](#frontend-env) example above.
4. Start the development server:
   ```bash
   npm run dev
   ```
   *(Next.js dev server typically runs on http://localhost:3000)*

### Database Setup
1. Ensure MongoDB is running locally on the default port (27017).
2. The database name specified in `MONGODB_URI` is `bookmanager`. MongoDB will create this database automatically when data is first inserted.
3. (Optional) Use a MongoDB GUI like MongoDB Compass to inspect the database.

## Available Scripts

### Backend (`backend/package.json`)
- `npm run dev`: Starts the server with nodemon for auto-restart during development
- `npm start`: Starts the server in production mode
- `npm test`: Runs tests (if configured)
- `npm run lint`: Runs ESLint for code linting

### Frontend (`frontend/package.json`)
- `npm run dev`: Starts the Next.js development server on http://localhost:3000
- `npm run build`: Builds the application for production
- `npm start`: Starts the production server
- `npm run lint`: Runs ESLint for code linting

## API Design Notes
- All book-related endpoints are protected by the `protect` middleware which verifies user authentication via cookies.
- The `user` field in the Book schema ensures data isolation between users.
- Error handling is implemented in controllers (though not detailed in this document).
- The API uses standard HTTP status codes:
  - 200: Success
  - 201: Created
  - 400: Bad Request
  - 401: Unauthorized
  - 403: Forbidden
  - 404: Not Found
  - 500: Internal Server Error

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.