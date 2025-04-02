import { integer, pgTable, varchar, uuid, decimal, index } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  age: integer().notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
}, (table) => { // <-- Üçüncü argüman olarak fonksiyon ekleniyor
  return {
    ageIndex: index("age_idx").on(table.age), // <-- Index tanımı
  };
});

export const productsTable = pgTable("products", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 1000 }),
  price: decimal().notNull(),
  category: varchar({ length: 100 }),
  stock: integer().notNull().default(0),
});
