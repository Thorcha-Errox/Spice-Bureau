import User from "../model/User.js";
import jwt from "jsonwebtoken";
import TryCatch from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import { oauth2client } from "../config/googleConfig.js";
import axios from "axios";
import bcrypt from "bcryptjs";

export const loginUser = TryCatch(async (req, res) => {
    const { code } = req.body;

    if (!code) {
        return res.status(400).json({
            message: "Authorization code is required",
        });
    }

    const googleRes = await oauth2client.getToken(code)

    oauth2client.setCredentials(googleRes.tokens)

    const userRes = await axios.get(
        `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${googleRes.tokens.
            access_token}`)
    const { email, name, picture } = userRes.data;

    let user = await User.findOne({ email })

    if (!user) {
        user = await User.create({
            name,
            email,
            image: picture,
        });
    }

    const { image: _, ...userWithoutImage } = user.toObject();

    const token = jwt.sign({ user: userWithoutImage }, process.env.JWT_SEC as string, {
        expiresIn: "15d",
    });

    res.status(200).json({
        message: "Logged Success",
        token,
        user,
    });

});

export const signupEmail = TryCatch(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    let user = await User.findOne({ email });

    if (user) {
        return res.status(400).json({
            message: "User already exists",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
        name,
        email,
        password: hashedPassword,
        image: "https://cdn-icons-png.flaticon.com/512/149/149071.png", // default avatar
    });

    const { image: _, ...userWithoutImageSignup } = user.toObject();

    const token = jwt.sign({ user: userWithoutImageSignup }, process.env.JWT_SEC as string, {
        expiresIn: "15d",
    });

    res.status(201).json({
        message: "Signup Success",
        token,
        user,
    });

});

export const loginEmail = TryCatch(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required",
        });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        return res.status(400).json({
            message: "Invalid Email or Password",
        });
    }

    if (!user.password) {
        return res.status(400).json({
            message: "Please login with Google",
        });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({
            message: "Invalid Email or Password",
        });
    }

    const userWithoutPassword = await User.findById(user._id);

    if (!userWithoutPassword) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    const userData = userWithoutPassword.toObject();
    const { image: _, ...userWithoutImageInner } = userData;

    const token = jwt.sign({ user: userWithoutImageInner }, process.env.JWT_SEC as string, {
        expiresIn: "15d",
    });

    res.status(200).json({
        message: "Logged Success",
        token,
        user: userWithoutPassword,
    });

});

const allowedRoles = ["customer", "rider", "seller"] as const;
type Role = (typeof allowedRoles)[number];

export const addUserRole = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user?._id) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const { role } = req.body as { role: Role };

    if (!allowedRoles.includes(role)) {
        return res.status(400).json({
            message: "Invalid role",
        });
    }

    const user = await User.findByIdAndUpdate(
        req.user._id,
        { role },
        { new: true }
    );

    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    const { image: _, ...userWithoutImageRole } = user.toObject();

    const token = jwt.sign({ user: userWithoutImageRole }, process.env.JWT_SEC as string, {
        expiresIn: "15d",
    });

    res.json({ user, token });

});

export const myProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    res.json(user);
});

export const updateProfile = TryCatch(async (req: AuthenticatedRequest, res) => {
    if (!req.user?._id) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    const { name, phone, image } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        return res.status(404).json({
            message: "User not found",
        });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (image) user.image = image;

    await user.save();
    const { image: _, ...userWithoutImage } = user.toObject();

    const token = jwt.sign({ user: userWithoutImage }, process.env.JWT_SEC as string, {
        expiresIn: "15d",
    });

    res.json({
        message: "Profile Updated successfully",
        user,
    });

});

