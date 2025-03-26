import { db } from './db-setup';
import { usersTable, productsTable } from '../db/schema';
import { sql } from 'drizzle-orm';

async function migrateTestDb() {
  try {
    console.log('Test veritabanı için tabloları oluşturma...');
    
    // Users tablosunu oluştur
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "age" INTEGER NOT NULL,
        "email" VARCHAR(255) NOT NULL UNIQUE
      );
    `);
    console.log('✅ users tablosu oluşturuldu');
    
    // Products tablosunu oluştur
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "products" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" VARCHAR(255) NOT NULL,
        "description" VARCHAR(1000),
        "price" DECIMAL NOT NULL,
        "category" VARCHAR(100),
        "stock" INTEGER NOT NULL DEFAULT 0
      );
    `);
    console.log('✅ products tablosu oluşturuldu');
    
    console.log('✅ Test veritabanı migrasyonu tamamlandı!');
  } catch (error) {
    console.error('❌ Test veritabanı migrasyonu sırasında hata:', error);
  } finally {
    process.exit(0);
  }
}

migrateTestDb();
