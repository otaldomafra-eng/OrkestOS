import userModel from "../models/userModel.js";
import imagekit from "../config/imagekit.js"
import validator from 'validator'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import fs from 'fs'
import { OAuth2Client } from 'google-auth-library';
import { asyncHandler } from '../utils/asyncHandler.js'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};



// Rota para login do usuário
const loginUser = asyncHandler(async (req, res) => {

    const { identifier, password } = req.body;

    const user = await userModel.findOne({
        $or: [
            { email: identifier },
            { username: identifier }
        ]
    });

    if (!user) {
        return res.json({ success: false, message: "Usuário não encontrado. Por favor, cadastre-se primeiro." })
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
        const token = createToken(user._id)
        const { _id, name, email, username, bio, profile_picture } = user
        return res.json({ success: true, message: "Login realizado com sucesso", token, name, email, username, bio, profile_picture })
    }
    else {
        return res.json({ success: false, message: "Credenciais inválidas." })
    }

})

//Route for Google SignIn
export const googleLogin = asyncHandler(async (req, res) => {

    const { credential } = req.body;

    // Check if credential is provided
    if (!credential) {
        return res.json({ success: false, message: "Token de credencial do Google é obrigatório." });
    }

    // Verify the token and get user information
    const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
    });

    // Extract user information from the token
    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId, email_verified } = payload;

    if (!email_verified) {
        return res.status(400).json({
            success: false,
            message: "Acesso negado. Seu endereço de e-mail do Google não está verificado.",
        });
    }

    let user = await userModel.findOne({ googleId });

    if (!user) {
        const existingEmailUser = await userModel.findOne({ email });

        if (existingEmailUser) {
            return res.status(400).json({
                success: false,
                message: "Já existe uma conta com este e-mail. Por favor, faça login usando seu e-mail e senha."
            });
        }

        const baseUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
        let generatedUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;

        let isUnique = false;
        let iterations = 0;
        const MAX_ITERATIONS = 5;

        while (!isUnique && iterations < MAX_ITERATIONS) {
            const checkUsernameConflict = await userModel.findOne({ username: generatedUsername });

            if (!checkUsernameConflict) {
                isUnique = true;
            } else {
                iterations++;
                if (iterations >= 3) {
                    const randomString = Math.random().toString(36).substring(2, 7);
                    generatedUsername = `${baseUsername}${randomString}`;
                } else {
                    generatedUsername = `${baseUsername}${Math.floor(1000 + Math.random() * 9000)}`;
                }
            }
        }

        //Timestamp fallback if uniqueness is not achieved after max iterations (extremely unlikely)
        if (!isUnique) {
            generatedUsername = `${baseUsername}${Date.now().toString().slice(-5)}`;
        }

        user = await userModel.create({
            name: name || baseUsername,
            username: generatedUsername,
            email,
            googleId,
            profile_picture: picture || ''
        });
    }


    // create a JWT token for the user
    const token = createToken(user._id);

    // Send the token and user info back to the client
    return res.json({
        success: true,
        message: "Login realizado com sucesso",
        token,
        name: user.name,
        email: user.email,
        username: user.username,
        bio: user.bio,
        profile_picture: user.profile_picture
    });

})

// Route for User register
const registerUser = asyncHandler(async (req, res) => {

    const { name, email, password, username } = req.body;

    // Validating password length before any database query
    if (password.length < 8) {
        return res.json({ success: false, message: "A senha deve ter pelo menos 8 caracteres." })
    }

    // Checking if there is the user exists in database with the same email.
    const exists = await userModel.findOne({ email });
    if (exists) {
        return res.json({ success: false, message: "Este e-mail já está cadastrado." })
    }

    const existsUsername = await userModel.findOne({ username });
    if (existsUsername) {
        return res.json({ success: false, message: "Nome de usuário já está em uso." })
    }


    // Validating email format and strong password
    if (!validator.isEmail(email)) {
        return res.json({ success: false, message: "Por favor, insira um e-mail válido." })
    }


    // Hashing User's password
    const salt = await bcrypt.genSalt(12)          // The higher the number the more time it will take to hash users password.
    const hashedPassword = await bcrypt.hash(password, salt)


    // Creating new User in database.
    const newUser = new userModel({
        name,
        username,
        email,
        password: hashedPassword
    })

    // Saving the new user in database.
    const user = await newUser.save()

    const token = createToken(user._id)

    res.json({ success: true, token, bio: user.bio, message: 'Conta criada com sucesso!' })

})

const updateUser = asyncHandler(async (req, res) => {

    const userId = req.user.id; // coming from middleware
    const { name, username, bio } = req.body;

    // Find current user
    const user = await userModel.findById(userId);
    if (!user) {
        return res.json({ success: false, message: "Usuário não encontrado." });
    }

    let isModified = false;

    // If username is being changed → check uniqueness
    if (username && username !== user.username) {
        const existingUsername = await userModel.findOne({
            username,
            _id: { $ne: userId }
        });
        if (existingUsername) {
            return res.json({
                success: false,
                message: "Nome de usuário já está em uso."
            });
        }
    }

    // Update only allowed fields
    if (name && name !== user.name) {
        user.name = name;
        isModified = true;
    }
    if (username && username !== user.username) {
        user.username = username;
        isModified = true;
    }
    if (bio !== undefined && bio !== user.bio) {
        user.bio = bio;
        isModified = true;
    }


    if (!isModified) {
        return res.json({ success: true, message: "Nenhuma alteração realizada." });
    }

    // Save updated user
    const updatedUser = await user.save();

    res.json({
        success: true,
        message: "Perfil atualizado com sucesso.",
        user: {
            name: updatedUser.name,
            username: updatedUser.username,
            bio: updatedUser.bio,
            email: updatedUser.email,
        }
    });

});


const updateUserProfilePic = asyncHandler(async (req, res) => {

    const userId = req.user.id; // coming from middleware

    // Find current user
    const user = await userModel.findById(userId);
    if (!user) {
        return res.json({ success: false, message: "Usuário não encontrado." });
    }

    let isModified = false;


    const profile = req.files.profile && req.files.profile[0];

    if(profile){
        try {
            const buffer = await fs.promises.readFile(profile.path)
            const response = await imagekit.upload({
                file: buffer,
                fileName: profile.originalname,
            })

            const url = imagekit.url({
                path: response.filePath,
                transformation: [
                    {quality: 'auto'},
                    {format: 'webp'},
                    {width: '512'}
                ]
            })
            user.profile_picture = url;
            isModified = true;
        } finally {
            await fs.promises.unlink(profile.path).catch(() => {})
        }
    }


    if (!isModified) {
        return res.json({ success: true, message: "Nenhuma alteração realizada." });
    }

    // Save updated user
    const updatedUser = await user.save();

    res.json({
        success: true,
        message: "Foto de perfil atualizada com sucesso.",
        user: {
            profile_picture: updatedUser.profile_picture,
        }
    });

});


const getUserProfile = asyncHandler(async (req, res) => {
    const userId = req.user.id;

    const user = await userModel.findById(userId);
    if (!user) {
        return res.json({ success: false, message: "Usuário não encontrado." });
    }

    const { _id, name, email, username, bio, profile_picture } = user;
    res.json({ success: true, user: { _id, name, email, username, bio, profile_picture } });
});


export { loginUser, registerUser, updateUser, updateUserProfilePic, getUserProfile }
