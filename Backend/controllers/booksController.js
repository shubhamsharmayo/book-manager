import Book from "../models/book.js";


// Add Book

export const addBook = async (req, res) => {
  try {
    const {
      title,
      author,
      tags,
      status,
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        message: "Title and Author are required",
      });
    }

    const book = await Book.create({
      title,
      author,
      tags,
      status,
      user: req.user,
    });

    res.status(201).json({
      message: "Book added successfully",
      book,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


// Get Logged-in User's Books

export const getBooks = async (req, res) => {
  try {
    const books = await Book.find({
      user: req.user,
    }).sort({
      createdAt: -1,
    });

    res.json({
      books,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};




export const updateBookStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(status)

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const validStatus = [
      "Want to Read",
      "Reading",
      "Completed",
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const book = await Book.findOne({
      _id: id,
      user: req.user, // Only allow owner to update
    });

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    book.status = status;

    await book.save();

    res.json({
      message: "Book status updated successfully",
      book,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


export const updateBook = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      author,
      tags,
      status,
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({
        message: "Title and Author are required",
      });
    }

    const validStatus = [
      "Want to Read",
      "Reading",
      "Completed",
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    const book = await Book.findOne({
      _id: id,
      user: req.user,
    });

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    book.title = title;
    book.author = author;
    book.tags = tags;
    book.status = status;

    await book.save();

    res.status(200).json({
      message: "Book updated successfully",
      book,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


export const getBooksByStatus = async (req, res) => {
   try {
    const { status } = req.query;

    const filter = {
      user: req.user,
    };

    const validStatus = [
      "All",
      "Want to Read",
      "Reading",
      "Completed",
    ];

    if (status) {
      if (!validStatus.includes(status)) {
        return res.status(400).json({
          message: "Invalid status",
        });
      }

      // Only filter if status is not "All"
      if (status !== "All") {
        filter.status = status;
      }
      
    }

    const books = await Book.find(filter).sort({
      createdAt: -1,
    });

    res.status(200).json({
      count: books.length,
      books,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};




export const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOne({
      _id: id,
      user: req.user,
    });

    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    await Book.findByIdAndDelete(id);

    res.status(200).json({
      message: "Book deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};