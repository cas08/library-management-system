# Library Management System (DB + Auth)

**Курс:** Backend розробка на Node.js
**ДЗ-2:** Library Management System (База даних + Auth)
**Максимум:** 20 балів
**Бонус:** 5 балів за OAuth (Google)

---

## 🎯 Мета

Розширити backend-застосунок Library Management System:

- перенести зберігання даних з оперативної памʼяті в базу даних (PostgreSQL)
- реалізувати реєстрацію та вхід (аутентифікація через JWT)
- захистити API за допомогою авторизації (ролі USER / ADMIN)
- зберегти REST API та бізнес-логіку з ДЗ-1

---

## 🧱 Технологічні стек

- **Runtime:** Node.js
- **Framework:** Express 5
- **Мова:** TypeScript
- **Валідація:** Zod
- **База даних:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **Аутентифікація:** JWT (jsonwebtoken) + bcrypt
- **OAuth:** Google (passport-google-oauth20) - бонус
- **Frontend:** React + Mantine UI (для тестування API)

---

## 📦 Модель даних

### 📘 Book

| Поле      | Тип     | Опис                    |
|-----------|---------|-------------------------|
| id        | string  | Унікальний ідентифікатор |
| title     | string  | Назва книги             |
| author    | string  | Автор                   |
| year      | number  | Рік видання             |
| isbn      | string  | Унікальний ISBN         |
| available | boolean | Чи доступна книга       |

### 👤 User

| Поле         | Тип             | Опис                              |
|--------------|-----------------|-----------------------------------|
| id           | string          | Унікальний ідентифікатор          |
| name         | string          | Імʼя користувача                  |
| email        | string          | Email (унікальний)                |
| passwordHash | string          | Хеш пароля (не повертається в API)|
| role         | USER \| ADMIN   | Роль для авторизації              |

### 🔄 Loan

| Поле       | Тип                | Опис                    |
|------------|---------------------|-------------------------|
| id         | string              | Унікальний ідентифікатор |
| userId     | string              | Користувач              |
| bookId     | string              | Книга                   |
| loanDate   | Date                | Дата видачі             |
| returnDate | Date \| null        | Дата повернення         |
| status     | ACTIVE \| RETURNED  | Статус позики           |

---

## 🌐 REST API

### 🔐 Auth (публічні)

| Метод | Endpoint        | Опис                              |
|-------|-----------------|-----------------------------------|
| POST  | /auth/register  | Реєстрація (name, email, password)|
| POST  | /auth/login     | Вхід (email, password) → JWT      |

### 📘 Books

| Метод  | Endpoint    | Опис               | Доступ        |
|--------|-------------|---------------------|---------------|
| GET    | /books      | Список книг         | Публічний     |
| GET    | /books/:id  | Книга за ID         | Публічний     |
| POST   | /books      | Створити книгу      | Тільки ADMIN  |
| PUT    | /books/:id  | Оновити книгу       | Тільки ADMIN  |
| DELETE | /books/:id  | Видалити книгу      | Тільки ADMIN  |

### 👤 Users

| Метод | Endpoint    | Опис                 | Доступ              |
|-------|-------------|----------------------|---------------------|
| GET   | /users      | Список користувачів  | Тільки ADMIN        |
| GET   | /users/:id  | Користувач за ID     | Тільки ADMIN        |
| GET   | /users/me   | Поточний користувач  | Авторизований       |

### 🔄 Loans

| Метод | Endpoint           | Опис              | Доступ                        |
|-------|--------------------|-------------------|-------------------------------|
| POST  | /loans             | Видати книгу      | Авторизований (USER/ADMIN)    |
| POST  | /loans/:id/return  | Повернути книгу   | Авторизований (власник/ADMIN) |
| GET   | /loans             | Список позик      | ADMIN - всі; USER - свої      |

---

## 🔑 Авторизація

- Після логіну клієнт надсилає JWT у заголовку: `Authorization: Bearer <token>`
- При невалідному/відсутньому токені - `401 Unauthorized`
- При недостатніх правах - `403 Forbidden`

---

## 📑 Валідація

- Усі POST та PUT запити валідуються через Zod
- Пароль: мінімум 8 символів
- При помилці валідації - `400 Bad Request` з описом

---

## 📌 Бізнес-логіка

### Реєстрація та логін

- Email має бути унікальним
- Пароль зберігається тільки у вигляді хешу (bcrypt)
- При успішному логіні видається JWT

### Видача книги

- Книгу не можна видати, якщо `available = false` або є активна позика
- При видачі: створюється Loan (ACTIVE), книга `available = false`
- Borrower визначається з JWT (не передається в body)

### Повернення книги

- Звичайний USER може повернути тільки свою позику
- ADMIN може повернути будь-яку
- Статус змінюється на RETURNED, встановлюється returnDate, книга `available = true`

---

## 📁 Структура проєкту

```
src/
├── routes/
│   ├── index.ts
│   ├── auth.routes.ts
│   ├── books.routes.ts
│   ├── users.routes.ts
│   └── loans.routes.ts
├── controllers/
│   ├── index.ts
│   ├── auth.controller.ts
│   ├── books.controller.ts
│   ├── users.controller.ts
│   └── loans.controller.ts
├── services/
│   ├── index.ts
│   ├── auth.service.ts
│   ├── books.service.ts
│   ├── users.service.ts
│   └── loans.service.ts
├── middleware/
│   ├── auth.middleware.ts
│   └── role.middleware.ts
├── schemas/
│   ├── index.ts
│   ├── auth.schema.ts
│   ├── book.schema.ts
│   └── loan.schema.ts
├── config/
│   ├── env.ts
│   └── passport.ts
├── db/
│   └── index.ts
├── lib/
│   └── httpError.ts
├── types/
│   ├── express.d.ts
│   └── frontend.ts
├── generated/
│   └── prisma/
├── components/
│   ├── auth/
│   │   └── AuthSection.tsx
│   ├── books/
│   │   └── BooksSection.tsx
│   ├── loans/
│   │   └── LoansSection.tsx
│   ├── shared/
│   │   ├── ResultModal.tsx
│   │   └── Section.tsx
│   └── users/
│       └── UsersSection.tsx
├── api/
│   └── apiFetch.ts
├── App.tsx
├── main.tsx
├── app.ts
└── server.ts
prisma/
├── schema.prisma
└── migrations/
```

---

## 🚀 Запуск

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run server       # backend on :3000
npm run dev          # frontend (Vite)
```

## Корисні посилання

- https://zod.dev/
- https://www.prisma.io/docs
- https://mantine.dev/
- https://dev.to/idrisakintobi/a-step-by-step-guide-to-google-oauth2-authentication-with-javascript-and-bun-4he7
