const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createUser() {
  try {
    const user = await prisma.user.create({
      data: {
        id: 'temp-user-id',
        email: 'test@example.com'
      }
    });
    
    console.log('User created:', user);
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('User already exists');
    } else {
      console.error('Error creating user:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createUser(); 