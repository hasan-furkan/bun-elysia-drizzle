# Testing Guide

Bu klasör, pagination ve filter sistemi için otomatik testleri içerir. Bu README, testleri nasıl çalıştıracağınızı ve yeni testler eklemenin nasıl yapılacağını açıklar.

## Testleri Çalıştırma

Bun'un yerleşik test çerçevesini kullanıyoruz. Testleri çalıştırmak için:

```bash
# Tüm testleri çalıştır
bun test

# Belirli bir test dosyasını çalıştır
bun test test/pagination.test.ts

# Belirli bir test tanımını çalıştır (regex kullanabilirsiniz)
bun test --test-name="should filter users by name"
```

## Test Dosyaları

- **pagination.test.ts**: Pagination sisteminin testi
- **filters.test.ts**: Filter fonksiyonlarının testi

## Test Veritabanı

Testler, aynı veritabanı bağlantısını kullanır ancak test öncesinde ve sonrasında temizlik yapar. `beforeAll` ve `afterAll` hooks kullanılarak veritabanı hazırlanır ve temizlenir.

## Yeni Test Ekleme

1. Mevcut test dosyalarını referans alarak yeni testler ekleyin
2. Yeni bir özellik için tamamen yeni bir test dosyası oluşturmak isterseniz, mevcut kalıpları takip edin
3. Testlerin bağımsız olduğundan emin olun (test verilerine bağımlılıklar oluşturmayın)

## Bun Test API

Bun test API'sinin tam referansı için: https://bun.sh/docs/cli/test

### Örnek Test
```typescript
import { describe, expect, test } from "bun:test";

describe("math", () => {
  test("addition", () => {
    expect(2 + 2).toBe(4);
  });
});
```
