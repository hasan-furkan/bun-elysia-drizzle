import { sql, count, SQL, asc, desc } from 'drizzle-orm'; // Adjusted imports
import type { AnyColumn } from 'drizzle-orm'; // Import AnyColumn as a type
import { usersTable, productsTable } from './db/schema';
import { db } from './db/db';
// Import the new filter condition functions
import { getUserFilterConditions } from './filters/userFilter';
import type { UserFilterParams } from './filters/userFilter';
import { getProductFilterConditions } from './filters/productFilter';
import type { ProductFilterParams } from './filters/productFilter';

// Define the supported tables
export type TableName = 'users' | 'products';

// Type mapping filter parameters to table names
type FilterParamsMap = {
  users: UserFilterParams;
  products: ProductFilterParams;
};

// Map table names to their Drizzle table objects and filter condition functions
const tableMap = {
  users: {
    table: usersTable,
    filterFn: getUserFilterConditions,
  },
  products: {
    table: productsTable,
    filterFn: getProductFilterConditions,
  },
} as const; // Use 'as const' for stricter typing

// Type for pagination parameters, using the FilterParamsMap
export type PaginationParams<T extends TableName> = {
  page?: number;
  pageSize?: number;
  filters?: FilterParamsMap[T]; // Use the map for filter types
  sortBy?: string; // Keep sortBy as string for now, validation happens inside
  sortOrder?: 'asc' | 'desc';
  tableName: T;
};

// Define count query result type (adjust based on actual return type)
interface CountQueryResult {
  value: number | string;
}

/**
 * Paginate and sort data from a specified table with filtering
 */
export async function paginateAndSort<T extends TableName>({
  page = 1,
  pageSize = 10,
  filters = {} as FilterParamsMap[T], // Default to empty object
  sortBy = 'id', // Default sort column
  sortOrder = 'asc',
  tableName,
}: PaginationParams<T>) {

  const offset = (page - 1) * pageSize;

  // Get table object and filter function from the map
  const tableInfo = tableMap[tableName];
  if (!tableInfo) {
    throw new Error(`Unsupported table: ${tableName}`);
  }
  const { table, filterFn } = tableInfo;

  // Generate the WHERE condition using the appropriate filter function
  // Type assertion needed here
  const whereCondition: SQL | undefined = filterFn(filters as any);

  // --- Base Queries ---
  let dataQuery = db.select().from(table).$dynamic();
  let countQuery = db.select({ value: count() }).from(table).$dynamic();

  // --- Apply Filters ---
  if (whereCondition) {
    dataQuery = dataQuery.where(whereCondition);
    countQuery = countQuery.where(whereCondition);
  }

  // --- Apply Sorting ---
  const column = table[sortBy as keyof typeof table] as AnyColumn | undefined;
  if (sortBy && column) {
      if (sortOrder === 'desc') {
          dataQuery = dataQuery.orderBy(desc(column));
      } else {
          dataQuery = dataQuery.orderBy(asc(column));
      }
  } else {
     // Default sort (e.g., by 'id' if it exists)
     const defaultSortColumn = table['id' as keyof typeof table] as AnyColumn | undefined;
     if(defaultSortColumn) {
        dataQuery = dataQuery.orderBy(asc(defaultSortColumn));
     }
     // Optional: Log a warning if sortBy is invalid
     if (sortBy && !column) {
        console.warn(`Invalid sortBy column: '${sortBy}' for table '${tableName}'. Using default sort.`);
     }
  }

  // --- Apply Pagination (Limit/Offset) ---
  dataQuery = dataQuery.limit(pageSize).offset(offset);

  // --- Execute Queries ---
  const data = await dataQuery;
  const countResult = await countQuery;

  // --- Process Results ---
  // Ensure count is parsed as a number
  const totalCount = parseInt(String(countResult[0]?.value ?? 0), 10);
  const totalPages = Math.ceil(totalCount / pageSize);

  // --- Return Response ---
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
