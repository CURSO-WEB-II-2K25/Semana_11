import express from "express";
import { getCategories, addCategories, updCategories, delCategories} from "../controllers/ctrl_Categories.js";
import { verifyToken, isAdmin, isUser, isRoot } from "../middleware/func_Users.js";

const categories = express.Router();

//Usuarios general
categories.get("/", getCategories);
//Admin                                                //put=update
categories.put("/", [verifyToken, isAdmin, isRoot], updCategories);
//User
categories.post("/", [verifyToken, isUser, isRoot], addCategories);
//Guest
categories.delete("/", [verifyToken, isRoot], getCategories);

export default categories ;