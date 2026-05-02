const prisma = require('./lib/prisma');

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    });
    console.log('---VERIFICATION_START---');
    console.log('User found:', !!user);
    if (user) {
      console.log('Password hashed:', user.password.startsWith('$2b$'));
      console.log('Hash prefix:', user.password.substring(0, 4));
    }
    console.log('---VERIFICATION_END---');
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();
