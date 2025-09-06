import express from "express";
import { getLinks, createLink, getLinkById, deleteLink } from "../controllers/linkController.js";

const router = express.Router();

router.get("/", getLinks);
router.post("/", createLink);
router.get("/:id", getLinkById);
router.delete("/:id", deleteLink);

export default router;
