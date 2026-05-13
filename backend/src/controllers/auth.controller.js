import {
  registerUser,
  loginUser,
  getUserById,
} from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const result = await registerUser(req.body);

    res.status(201).json({
      message: "Account created successfully",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body);

    res.json({
      message: "Logged in successfully",
      user: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res, next) {
  try {
    const user = await getUserById(req.user.id);

    res.json({
      user,
    });
  } catch (error) {
    next(error);
  }
}