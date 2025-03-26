import { eq, ilike, lte, gte, and, sql, count } from 'drizzle-orm';
import { productsTable } from '../db/schema';
import { db } from '../db/db';

// Define the filter interface specifically for products
export interface ProductFilterParams {
  name?: string;
  category?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  inStock?: boolean;
  // Add other filter fields as needed
}

export const productFilters = (filters: ProductFilterParams, isCountQuery: boolean = false) => {
  // Generate the conditions for filtering
  const conditions = [];
  
  if (filters.name) {
    conditions.push(ilike(productsTable.name, `%${filters.name}%`));
  }
  
  if (filters.category) {
    conditions.push(ilike(productsTable.category, `%${filters.category}%`));
  }
  
  if (filters.minPrice !== undefined) {
    const minPrice = typeof filters.minPrice === 'string' ? filters.minPrice : filters.minPrice.toString();
    conditions.push(sql`${productsTable.price} >= ${minPrice}`);
  }
  
  if (filters.maxPrice !== undefined) {
    const maxPrice = typeof filters.maxPrice === 'string' ? filters.maxPrice : filters.maxPrice.toString();
    conditions.push(sql`${productsTable.price} <= ${maxPrice}`);
  }
  
  if (filters.inStock !== undefined) {
    if (filters.inStock) {
      conditions.push(gte(productsTable.stock, 1));
    } else {
      conditions.push(eq(productsTable.stock, 0));
    }
  }
  
  // Create the query based on whether it's a count query or a select query
  let query;
  if (isCountQuery) {
    query = db.select({ value: count() }).from(productsTable);
  } else {
    query = db.select().from(productsTable);
  }
  
  // Apply conditions if any exist
  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }
  
  return query;
};
