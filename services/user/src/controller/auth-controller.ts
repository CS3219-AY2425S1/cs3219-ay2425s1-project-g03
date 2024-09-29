import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByUsername as _findUserByUsername } from "../model/repository";
import { formatUserResponse } from "./user-controller";

export async function handleLogin(req, res) {
  const { username, password } = req.body;
  if (username && password) {
    try {
      const user = await _findUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Wrong username and/or password" });
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return res.status(401).json({ message: "Wrong username and/or password" });
      }

      const accessToken = jwt.sign({
        id: user.id,
      }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      return res.status(200).json({ message: "User logged in", data: { accessToken, ...formatUserResponse(user) } });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  } else {
    return res.status(400).json({ message: "Missing username and/or password" });
  }
}

export async function handleVerifyToken(req, res) {
  try {
    const verifiedUser = req.user;
    return res.status(200).json({ message: "Token verified", data: verifiedUser });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
}
