import { eq, ilike, and, SQL, gte, lte } from 'drizzle-orm'; // Import SQL type, gte, and lte
import { usersTable } from '../db/schema';
// Remove db import if not used directly for select/count anymore
// import { db } from '../db/db'; // No longer needed here

// Define the filter interface specifically for users
export interface UserFilterParams {
  name?: string;
  email?: string;
  age?: number | string;
  minAge?: number | string;
  maxAge?: number | string;
  // Add other filter fields as needed
}

// Renamed function, removed isCountQuery, returns SQL | undefined
export const getUserFilterConditions = (filters: UserFilterParams): SQL | undefined => {
  // Generate the conditions for filtering
  const conditions: SQL[] = []; // Explicitly type as SQL[]

  if (filters.name) {
    // Use prefix search for potential index usage
    conditions.push(ilike(usersTable.name, `${filters.name}%`));
  }

  if (filters.email) {
    // Use prefix search for potential index usage
    conditions.push(ilike(usersTable.email, `${filters.email}%`));
  }

  if (filters.age !== undefined) {
    conditions.push(eq(usersTable.age, typeof filters.age === 'string' ? parseInt(filters.age, 10) : filters.age));
  }

  if (filters.minAge !== undefined) {
    const minAge = typeof filters.minAge === 'string' ? parseInt(filters.minAge, 10) : filters.minAge;
    if (!isNaN(minAge)) { // Ensure parsing was successful
        conditions.push(gte(usersTable.age, minAge));
    }
  }

  // Add maxAge condition
  if (filters.maxAge !== undefined) {
    const maxAge = typeof filters.maxAge === 'string' ? parseInt(filters.maxAge, 10) : filters.maxAge;
    if (!isNaN(maxAge)) { // Ensure parsing was successful
        conditions.push(lte(usersTable.age, maxAge));
    }
  }

  // Return the combined conditions using 'and', or undefined if no conditions
  if (conditions.length > 0) {
    // Use and(...) which accepts an array of conditions
    return and(...conditions);
  }

  return undefined; // Return undefined if no filters are applied
};