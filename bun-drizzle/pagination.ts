import { sql, count } from 'drizzle-orm';
import { usersTable, productsTable } from './db/schema';
import { db } from './db/db';
import { userFilters } from './filters/userFilter';
import type { UserFilterParams } from './filters/userFilter';
import { productFilters } from './filters/productFilter';
import type { ProductFilterParams } from './filters/productFilter';

// Define the supported tables
export type TableName = 'users' | 'products';

// Define filter map to associate table names with their filter types
type FilterMap = {
  users: UserFilterParams;
  products: ProductFilterParams;
};

// Type for pagination parameters
export type PaginationParams<T extends TableName> = {
  page?: number;
  pageSize?: number;
  filters?: FilterMap[T];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  tableName: T;
};

// Define count query result type
interface CountQueryResult {
  value: number;
}

// Helper to get the table by name
function getTable(tableName: TableName) {
  switch (tableName) {
    case 'users':
      return usersTable;
    case 'products':
      return productsTable;
    default:
      throw new Error(`Unsupported table: ${tableName}`);
  }
}

/**
 * Paginate and sort data from a specified table
 */
export async function paginateAndSort<T extends TableName>({
  page = 1,
  pageSize = 10,
  filters = {} as FilterMap[T],
  sortBy = 'id',
  sortOrder = 'asc',
  tableName,
}: PaginationParams<T>) {
  const offset = (page - 1) * pageSize;
  const table = getTable(tableName);
  
  // Get filtered query based on table type
  let dataQuery;
  let countQuery;
  
  if (tableName === 'users') {
    // For users table
    dataQuery = userFilters(filters as UserFilterParams);
    
    // Create a count query using the filter function's count parameter
    countQuery = userFilters(filters as UserFilterParams, true);
  } 
  else if (tableName === 'products') {
    // For products table
    dataQuery = productFilters(filters as ProductFilterParams);
    
    // Create a count query using the filter function's count parameter
    countQuery = productFilters(filters as ProductFilterParams, true);
  } 
  else {
    // Generic fallback
    dataQuery = db.select().from(table);
    countQuery = db.select({ value: count() }).from(table);
  }
  
  // Apply sorting
  if (sortBy && sortBy in table) {
    const column = table[sortBy as keyof typeof table];
    if (sortOrder === 'asc') {
      dataQuery = dataQuery.orderBy(sql`${column} ASC`);
    } else {
      dataQuery = dataQuery.orderBy(sql`${column} DESC`);
    }
  }
  
  // Apply pagination
  const data = await dataQuery.limit(pageSize).offset(offset);
  
  // Execute count query with proper type assertion
  const countResult = await countQuery as unknown as CountQueryResult[];
  const totalCount = countResult[0]?.value || 0;
  
  const totalPages = Math.ceil(totalCount / pageSize);
  
  // Return results with pagination metadata
  return {
    data,
    pagination: {
      currentPage: page,
      pageSize,
      totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1,
    },
  };
}