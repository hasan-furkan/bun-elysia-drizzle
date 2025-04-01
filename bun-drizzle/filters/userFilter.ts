import { eq, ilike, and, SQL } from 'drizzle-orm'; // Import SQL type
import { usersTable } from '../db/schema';
// Remove db import if not used directly for select/count anymore
// import { db } from '../db/db'; // No longer needed here

// Define the filter interface specifically for users
export interface UserFilterParams {
  name?: string;
  email?: string;
  age?: number | string;
  // Add other filter fields as needed
}

// Renamed function, removed isCountQuery, returns SQL | undefined
export const getUserFilterConditions = (filters: UserFilterParams): SQL | undefined => {
  // Generate the conditions for filtering
  const conditions: SQL[] = []; // Explicitly type as SQL[]

  if (filters.name) {
    conditions.push(ilike(usersTable.name, `%${filters.name}%`));
  }

  if (filters.email) {
    conditions.push(ilike(usersTable.email, `%${filters.email}%`));
  }

  if (filters.age !== undefined) {
    conditions.push(eq(usersTable.age, typeof filters.age === 'string' ? parseInt(filters.age, 10) : filters.age));
  }

  // Return the combined conditions using 'and', or undefined if no conditions
  if (conditions.length > 0) {
    // Use and(...) which accepts an array of conditions
    return and(...conditions);
  }

  return undefined; // Return undefined if no filters are applied
};