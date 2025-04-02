import { drizzle } from 'drizzle-orm/node-postgres';
import { usersTable } from './db/schema';
import { userSchema, userUpdateSchema } from './schema/user';
import { eq } from 'drizzle-orm';
import { paginateAndSort } from './pagination';


const db = drizzle(process.env.DATABASE_URL!);


const addUser = async () => {
    const userName = prompt('Please enter name')?.trim() || ""; 
    const userEmail = prompt('Please enter email')?.trim() || ""; 
    const userAgeInput = prompt('Please enter age')?.trim();

    const userAge = userAgeInput ? parseInt(userAgeInput, 10) : NaN;

    if (!userName || !userEmail) {
        console.log('error: name and email not empty.');
        return;
    }

    if (isNaN(userAge)) {
        console.log('error: age is number.');
        return;
    }

    const validation = userSchema.safeParse({
        name: userName,
        age: userAge, 
        email: userEmail
    })

    if(validation.error) return;

    await db.insert(usersTable).values(validation.data);

    console.log("user is added.");
};


const updateUser = async () => {
    const oldEmail = prompt('Please enter your current email')?.trim() || ""; 

    if (!oldEmail) {
        console.log('error: mail is not empty.');
        return;
    }

    const validation = userUpdateSchema.safeParse({ email: oldEmail });

    if (!validation.success) {
        console.log(validation.error.format());
        return;
    }

    const existingUser = await db.select().from(usersTable).where(eq(usersTable.email, validation.data.email));

    if (existingUser.length === 0) {
        console.log('error: email not find.');
        return;
    }

    console.log("user is find:", existingUser[0]);

    const newEmail = prompt('Please enter your new email')?.trim() || "";
    const newName = prompt('Please enter your new name')?.trim() || "";
    const newAgeInput = prompt('Please enter your new age')?.trim();
    const newAge = newAgeInput ? parseInt(newAgeInput, 10) : NaN;

    if (!newEmail || !newName) {
        console.log('Hata: new email and name not empty.');
        return;
    }

    if (isNaN(newAge)) {
        console.log('error: age is number.');
        return;
    }

    const newValidation = userSchema.safeParse({
        name: newName,
        email: newEmail,
        age: newAge
    });

    if (!newValidation.success) {
        console.log(newValidation.error.format());
        return;
    }

    await db.update(usersTable)
        .set({
            email: newValidation.data.email,
            name: newValidation.data.name,
            age: newValidation.data.age
        })
        .where(eq(usersTable.email, validation.data.email));

    console.log("user updated.");
}


const generateRandomUserData = () => {
    const names = ["Alice", "Bob", "Charlie", "David", "Emma", "Frank", "Grace", "Hannah"];
    const domains = ["gmail.com", "yahoo.com", "outlook.com", "example.com"];

    const name = names[Math.floor(Math.random() * names.length)];
    const uniquePart = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
    const email = `${name.toLowerCase()}.${uniquePart}@${domains[Math.floor(Math.random() * domains.length)]}`;

    return {
      name: `${name} ${uniquePart}`,
      age: Math.floor(Math.random() * 60) + 18,
      email: email
    };
};
  

const insertRandomUsers = async (count: number) => {
  const users = [];
  
  for (let i = 0; i < count; i++) {
    users.push(generateRandomUserData());
    
    if (users.length >= 10000) {
      await db.insert(usersTable).values(users);
      users.length = 0;
    }
  }

  if (users.length > 0) {
    await db.insert(usersTable).values(users);
  }
  console.log(`Successfully inserted ${count} users.`);
};

const addTestUsers = async () => {
  console.time('InsertTime');
  await insertRandomUsers(1000000); // 100.000 kayıt ekle
  console.timeEnd('InsertTime');
};


const getAllUsers = async () => {
    // Start the timer
    console.time('paginateAndSortExecutionTime');

    try {
      const result = await paginateAndSort({
        page: 1,
        pageSize: 10,
        filters: { age: 20, minAge: 18, maxAge: 30 },
        sortBy: 'id',
        sortOrder: 'asc',
        tableName: 'users',
      });
  
      console.log(result);
    } catch (error) {
      console.error('An error occurred during pagination:', error);
    } finally {
      // End the timer and log the time
      console.timeEnd('paginateAndSortExecutionTime');
    }
  };
  
getAllUsers();
// updateUser();
// addUser();
// addTestUsers();
