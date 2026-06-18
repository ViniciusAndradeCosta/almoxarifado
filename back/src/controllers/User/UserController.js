import prisma from '../../database/client.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function createUser(req, res) {
    const { id, email, name, login, password, role } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = await prisma.user.create({
            data: {
                id,
                email,
                name,
                login,
                password: hashedPassword,
                role
            }
        });

        res.json(newUser);
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

async function getUser(req, res) {
    const { id } = req.params;

    try {
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(id)
            }
        });

        res.json(user);
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

async function updateUser(req, res) {
    const { id } = req.params;
    const { email, name, login, password, role } = req.body;

    try {
        const dataToUpdate = { email, name, login, role };

        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, SALT_ROUNDS);
        }

        const user = await prisma.user.update({
            where: {
                id: parseInt(id)
            },
            data: dataToUpdate
        });

        res.json(user);
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

async function deleteUser(req, res) {
    const { id } = req.params;

    try {
        await prisma.user.delete({
            where: {
                id: parseInt(id)
            }
        });

        res.json({ message: 'User deleted' });
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

async function getUsers(req, res) {
    try {
        const users = await prisma.user.findMany();

        res.json(users);
    }
    catch (error) {
        res.json({ error: error.message });
    }
}

async function login(req, res) {
    const { login, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                login
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (passwordMatch) {
            res.json(user);
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export {
    createUser,
    getUser,
    updateUser,
    deleteUser,
    getUsers,
    login
};