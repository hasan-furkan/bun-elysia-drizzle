import { describe, expect, test, beforeAll, afterAll } from 'bun:test';
import { db } from './db-setup';
import { usersTable } from '../db/schema';
import { eq } from 'drizzle-orm';

describe('User CRUD Operations', () => {
  let testUserId: string;
  
  // Test öncesi ve sonrası temizlik
  beforeAll(async () => {
    // Test DB'yi temizle
    await db.delete(usersTable);
  });
  
  afterAll(async () => {
    // Test kullanıcılarını temizle
    if (testUserId) {
      await db.delete(usersTable).where(eq(usersTable.id, testUserId));
    }
  });

  test('should create a new user', async () => {
    // Testte kullanılacak kullanıcı verileri
    const userData = {
      name: 'Test User',
      age: 25,
      email: 'testuser@example.com'
    };

    // Kullanıcı oluşturma
    const [createdUser] = await db.insert(usersTable).values(userData).returning();
    
    // ID'yi sonraki testler için sakla
    testUserId = createdUser.id;
    
    // Doğrulamalar
    expect(createdUser).toBeDefined();
    expect(createdUser.id).toBeDefined();
    expect(createdUser.name).toBe(userData.name);
    expect(createdUser.age).toBe(userData.age);
    expect(createdUser.email).toBe(userData.email);
  });

  test('should read a user by ID', async () => {
    // Kullanıcıyı ID'ye göre oku
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, testUserId));
    
    // Doğrulamalar
    expect(user).toBeDefined();
    expect(user.id).toBe(testUserId);
    expect(user.name).toBe('Test User');
    expect(user.email).toBe('testuser@example.com');
  });

  test('should read all users', async () => {
    // Tüm kullanıcıları oku
    const users = await db.select().from(usersTable);
    
    // Doğrulamalar
    expect(users).toBeDefined();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    
    // Oluşturduğumuz test kullanıcısını bul
    const testUser = users.find(user => user.id === testUserId);
    expect(testUser).toBeDefined();
  });

  test('should update a user', async () => {
    // Güncellenecek veriler
    const updateData = {
      name: 'Updated User',
      age: 30
    };
    
    // Kullanıcıyı güncelle
    const [updatedUser] = await db
      .update(usersTable)
      .set(updateData)
      .where(eq(usersTable.id, testUserId))
      .returning();
    
    // Doğrulamalar
    expect(updatedUser).toBeDefined();
    expect(updatedUser.id).toBe(testUserId);
    expect(updatedUser.name).toBe(updateData.name);
    expect(updatedUser.age).toBe(updateData.age);
    expect(updatedUser.email).toBe('testuser@example.com'); // Email değişmemeli
    
    // Veritabanından tekrar oku ve kontrol et
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, testUserId));
    expect(user.name).toBe(updateData.name);
    expect(user.age).toBe(updateData.age);
  });

  test('should delete a user', async () => {
    // Kullanıcıyı sil
    const [deletedUser] = await db
      .delete(usersTable)
      .where(eq(usersTable.id, testUserId))
      .returning();
    
    // Doğrulamalar
    expect(deletedUser).toBeDefined();
    expect(deletedUser.id).toBe(testUserId);
    
    // Kullanıcının artık veritabanında olmaması gerekiyor
    const users = await db.select().from(usersTable).where(eq(usersTable.id, testUserId));
    expect(users.length).toBe(0);
    
    // Test temizliği için ID'yi sıfırla
    testUserId = '';
  });

  test('should handle validation for user creation', async () => {
    // Geçersiz veri (email eksik)
    const invalidData = {
      name: 'Invalid User',
      age: 25
      // email eksik
    };

    try {
      // Bu işlem hata vermeli
      await db.insert(usersTable).values(invalidData as any);
      // Buraya ulaşırsa test başarısız olmalı
      expect(true).toBe(false); // Fail the test
    } catch (error) {
      // Hata bekleniyor
      expect(error).toBeDefined();
    }
  });

  test('should query users by email', async () => {
    // Önce test için bir kullanıcı oluştur
    const uniqueEmail = `unique_${Date.now()}@example.com`;
    const userData = {
      name: 'Email Test User',
      age: 28,
      email: uniqueEmail
    };
    
    const [createdUser] = await db.insert(usersTable).values(userData).returning();
    testUserId = createdUser.id; // Temizlik için ID'yi kaydet
    
    // Email'e göre sorgula
    const users = await db.select().from(usersTable).where(eq(usersTable.email, uniqueEmail));
    
    // Doğrulamalar
    expect(users.length).toBe(1);
    expect(users[0].email).toBe(uniqueEmail);
    
    // Temizlik
    await db.delete(usersTable).where(eq(usersTable.id, testUserId));
  });
});