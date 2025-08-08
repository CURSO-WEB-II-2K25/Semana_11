import express from "express";
import { signup, signin, signout } from "../controllers/ctrl_Users.js";
import { verifyRol, verifyDuplicates, isRoot } from "../middleware/func_Users.js";

const users = express.Router();

users.post("/signup", [verifyDuplicates, verifyRol, isRoot], signup);
users.post("/signin", signin);
users.post("/signout", signout);

export default users ;
