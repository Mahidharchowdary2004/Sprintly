const prisma = require('../lib/prisma');

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true }
    });
    // Add _id for frontend compatibility
    const formattedUsers = users.map(u => ({ ...u, _id: u.id }));
    res.json(formattedUsers);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { getUsers };
