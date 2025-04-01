import { eq, ilike, lte, gte, and, sql, SQL } from 'drizzle-orm'; // Import SQL type
import { productsTable } from '../db/schema';
// Remove db import if not used directly for select/count anymore
// import { db } from '../db/db'; // No longer needed here

// Define the filter interface specifically for products
export interface ProductFilterParams {
  name?: string;
  category?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  inStock?: boolean;
  // Add other filter fields as needed
}

// Renamed function, removed isCountQuery, returns SQL | undefined
export const getProductFilterConditions = (filters: ProductFilterParams): SQL | undefined => {
  // Generate the conditions for filtering
  const conditions: SQL[] = []; // Explicitly type as SQL[]

  if (filters.name) {
    conditions.push(ilike(productsTable.name, `%${filters.name}%`));
  }

  if (filters.category) {
    conditions.push(ilike(productsTable.category, `%${filters.category}%`));
  }

  if (filters.minPrice !== undefined) {
    const minPrice = typeof filters.minPrice === 'string' ? filters.minPrice : filters.minPrice.toString();
    // Using sql template tag correctly for parameters is important for safety
    conditions.push(sql`${productsTable.price} >= ${minPrice}`);
    // Alternative using gte for potentially better type safety if price is numeric
    // conditions.push(gte(productsTable.price, minPrice)); // Ensure minPrice is number here
  }

  if (filters.maxPrice !== undefined) {
    const maxPrice = typeof filters.maxPrice === 'string' ? filters.maxPrice : filters.maxPrice.toString();
     // Using sql template tag correctly for parameters is important for safety
    conditions.push(sql`${productsTable.price} <= ${maxPrice}`);
    // Alternative using lte for potentially better type safety if price is numeric
    // conditions.push(lte(productsTable.price, maxPrice)); // Ensure maxPrice is number here
  }

  if (filters.inStock !== undefined) {
    if (filters.inStock) {
      conditions.push(gte(productsTable.stock, 1)); // In stock means stock >= 1
    } else {
      conditions.push(eq(productsTable.stock, 0)); // Out of stock means stock == 0
    }
  }

  // Return the combined conditions using 'and', or undefined if no conditions
  if (conditions.length > 0) {
     // Use and(...) which accepts an array of conditions
    return and(...conditions);
  }

  return undefined; // Return undefined if no filters are applied
};
