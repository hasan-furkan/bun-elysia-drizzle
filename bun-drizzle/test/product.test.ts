import { describe, expect, test, beforeAll, afterAll } from 'bun:test';
import { db } from './db-setup';
import { productsTable } from '../db/schema';
import { eq } from 'drizzle-orm';

describe('Product CRUD Operations', () => {
  let testProductId: string;
  
  // Test öncesi ve sonrası temizlik
  beforeAll(async () => {
    // Test DB'yi temizle
    await db.delete(productsTable);
  });
  
  // Test sonrası temizlik
  afterAll(async () => {
    // Test ürünlerini temizle
    if (testProductId) {
      await db.delete(productsTable).where(eq(productsTable.id, testProductId));
    }
  });

  test('should create a new product', async () => {
    // Testte kullanılacak ürün verileri
    const productData = {
      name: 'Test Product',
      description: 'This is a test product',
      price: '99.99',
      category: 'Test Category',
      stock: 10
    };

    // Ürün oluşturma
    const [createdProduct] = await db.insert(productsTable).values(productData).returning();
    
    // ID'yi sonraki testler için sakla
    testProductId = createdProduct.id;
    
    // Doğrulamalar
    expect(createdProduct).toBeDefined();
    expect(createdProduct.id).toBeDefined();
    expect(createdProduct.name).toBe(productData.name);
    expect(createdProduct.price).toBe(productData.price);
    expect(createdProduct.category).toBe(productData.category);
    expect(createdProduct.stock).toBe(productData.stock);
  });

  test('should read a product by ID', async () => {
    // Ürünü ID'ye göre oku
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, testProductId));
    
    // Doğrulamalar
    expect(product).toBeDefined();
    expect(product.id).toBe(testProductId);
    expect(product.name).toBe('Test Product');
    expect(product.price).toBe('99.99');
    expect(product.category).toBe('Test Category');
  });

  test('should read all products', async () => {
    // Tüm ürünleri oku
    const products = await db.select().from(productsTable);
    
    // Doğrulamalar
    expect(products).toBeDefined();
    expect(Array.isArray(products)).toBe(true);
    expect(products.length).toBeGreaterThan(0);
    
    // Oluşturduğumuz test ürününü bul
    const testProduct = products.find(product => product.id === testProductId);
    expect(testProduct).toBeDefined();
  });

  test('should update a product', async () => {
    // Güncellenecek veriler
    const updateData = {
      name: 'Updated Product',
      price: '129.99',
      stock: 5
    };
    
    // Ürünü güncelle
    const [updatedProduct] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, testProductId))
      .returning();
    
    // Doğrulamalar
    expect(updatedProduct).toBeDefined();
    expect(updatedProduct.id).toBe(testProductId);
    expect(updatedProduct.name).toBe(updateData.name);
    expect(updatedProduct.price).toBe(updateData.price);
    expect(updatedProduct.stock).toBe(updateData.stock);
    expect(updatedProduct.category).toBe('Test Category'); // Category değişmemeli
    
    // Veritabanından tekrar oku ve kontrol et
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, testProductId));
    expect(product.name).toBe(updateData.name);
    expect(product.price).toBe(updateData.price);
    expect(product.stock).toBe(updateData.stock);
  });

  test('should delete a product', async () => {
    // Ürünü sil
    const [deletedProduct] = await db
      .delete(productsTable)
      .where(eq(productsTable.id, testProductId))
      .returning();
    
    // Doğrulamalar
    expect(deletedProduct).toBeDefined();
    expect(deletedProduct.id).toBe(testProductId);
    
    // Ürünün artık veritabanında olmaması gerekiyor
    const products = await db.select().from(productsTable).where(eq(productsTable.id, testProductId));
    expect(products.length).toBe(0);
    
    // Test temizliği için ID'yi sıfırla
    testProductId = '';
  });

  test('should query products by category', async () => {
    // Önce test için bir ürün oluştur
    const uniqueCategory = `Category_${Date.now()}`;
    const productData = {
      name: 'Category Test Product',
      description: 'Product for category testing',
      price: '49.99',
      category: uniqueCategory,
      stock: 15
    };
    
    const [createdProduct] = await db.insert(productsTable).values(productData).returning();
    testProductId = createdProduct.id; // Temizlik için ID'yi kaydet
    
    // Kategoriye göre sorgula
    const products = await db.select().from(productsTable).where(eq(productsTable.category, uniqueCategory));
    
    // Doğrulamalar
    expect(products.length).toBe(1);
    expect(products[0].category).toBe(uniqueCategory);
    
    // Temizlik
    await db.delete(productsTable).where(eq(productsTable.id, testProductId));
  });
});
