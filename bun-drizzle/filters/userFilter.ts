import { eq, ilike, and, count } from 'drizzle-orm';
import { usersTable } from '../db/schema';
import { db } from '../db/db';

// Define the filter interface specifically for users
export interface UserFilterParams {
  name?: string;
  email?: string;
  age?: number | string;
  // Add other filter fields as needed
}

export const userFilters = (filters: UserFilterParams, isCountQuery: boolean = false) => {
  // Generate the conditions for filtering
  const conditions = [];
  
  if (filters.name) {
    conditions.push(ilike(usersTable.name, `%${filters.name}%`));
  }
  
  if (filters.email) {
    conditions.push(ilike(usersTable.email, `%${filters.email}%`));
  }
  
  if (filters.age !== undefined) {
    conditions.push(eq(usersTable.age, typeof filters.age === 'string' ? parseInt(filters.age, 10) : filters.age));
  }
  
  // Create the query based on whether it's a count query or a select query
  let query;
  if (isCountQuery) {
    query = db.select({ value: count() }).from(usersTable);
  } else {
    query = db.select().from(usersTable);
  }
  
  // Apply conditions if any exist
  if (conditions.length > 0) {
    return query.where(and(...conditions));
  }
  
  return query;
};
