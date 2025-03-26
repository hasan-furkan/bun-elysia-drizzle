# Bun + ElysiaJS + Drizzle ORM Starter Project

This project is a learning experiment to explore the combination of **Bun**, **ElysiaJS**, and **Drizzle ORM**. It serves as a minimal yet effective setup to understand how these technologies work together for building modern web applications with high performance and type safety.

## 🚀 Tech Stack

- **[Bun](https://bun.sh/)** - A fast JavaScript runtime that serves as an alternative to Node.js.
- **[ElysiaJS](https://elysiajs.com/)** - A lightweight and efficient framework for building web applications.
- **[Drizzle ORM](https://orm.drizzle.team/)** - A type-safe and SQL-focused ORM for interacting with databases.
- **PostgreSQL** - The relational database used in this project.

## 📌 Features

- **Super Fast Execution** ⚡ thanks to Bun's runtime.
- **Type-Safe ORM** 🔍 with Drizzle ORM.
- **Minimalist and Performant API** 🚀 powered by ElysiaJS.
- **Efficient Database Migrations** 🗂️ with Drizzle's migration system.
- **Pagination & Filtering** 🔄 implemented for handling large datasets.

## 📂 Project Structure
```
/project-root
│── src/
│   ├── db/                  # Database setup & schema definitions
│   ├── filters/             # Filter functions for queries
│   ├── routes/              # API route handlers
│   ├── migrate.ts           # Migration script
│── index.ts                 # Main entry point
│── bun.lockb                # Bun lock file
│── drizzle.config.ts        # Drizzle ORM configuration
│── README.md                # Project documentation
│── test/                    # Test files
│── .env                     # Environment variables
```

## 🛠️ Setup & Installation

### 1️⃣ Install Bun (if not already installed)
```sh
curl -fsSL https://bun.sh/install | bash
```

### 2️⃣ Clone the Repository
```sh
git clone https://github.com/hasan-furkan/bun-elysia-drizzle.git
cd bun-elysia-drizzle
```

### 3️⃣ Install Dependencies
```sh
bun install
```

### 4️⃣ Configure the Database
- Ensure you have PostgreSQL running.
- Update the **.env** file with your database credentials.
- Run database migrations:
```sh
bun run migrate.ts
```

### 5️⃣ Start the Server
```sh
bun run index.ts
```

### 6️⃣ Run Tests
```sh
bun test
```

## 📝 Notes
- This project is for **learning purposes** and might not be production-ready.
- Feel free to contribute and improve the setup!

## 📜 License
MIT License.

