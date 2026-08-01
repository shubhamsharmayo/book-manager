import express from "express";

const router = express.Router();

import protect from "../Middlewares/authMiddleware.js";

import { addBook, getBooks } from "../controllers/booksController.js";
import { updateBookStatus } from "../controllers/booksController.js";
import {
  updateBook,
  getBooksByStatus,
  deleteBook,
} from "../controllers/booksController.js";

router.post("/addbook", protect, addBook);

router.get("/getbooks", protect, getBooks);
router.patch("/updatebook/:id", protect, updateBookStatus);
router.put("/updatebook/:id", protect, updateBook);
router.get("/status", protect, getBooksByStatus);
router.delete("/delete/:id", protect, deleteBook);

export default router;
