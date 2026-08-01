"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  BookOpen,
  Calendar,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";

interface Book {
  _id: string;
  title: string;
  author: string;
  tags: string[];
  status: "Want to Read" | "Reading" | "Completed";
  createdAt: string;
}

interface FormData {
  title: string;
  author: string;
  tags: string;
  status: "Want to Read" | "Reading" | "Completed";
}

type EditFormData = FormData;

const backendUrl = process.env.NEXT_PUBLIC_NODE_API_URL;

const statusStyles: Record<Book["status"], { badge: string; spine: string }> = {
  "Want to Read": {
    badge: "bg-sky-400/20 text-sky-100 border border-sky-300/30",
    spine: "bg-sky-400",
  },
  Reading: {
    badge: "bg-amber-400/20 text-amber-100 border border-amber-300/30",
    spine: "bg-amber-400",
  },
  Completed: {
    badge: "bg-emerald-400/20 text-emerald-100 border border-emerald-300/30",
    spine: "bg-emerald-400",
  },
};

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<EditFormData>({
    title: "",
    author: "",
    tags: "",
    status: "Want to Read",
  });
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    title: "",
    author: "",
    tags: "",
    status: "Want to Read",
  });

  const fetchBooks = async () => {
    setLoadingBooks(true);
    try {
      const res = await fetch(`${backendUrl}/books/getbooks`, {
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok) {
        setBooks(data.books);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingBooks(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) setError(null);
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setEditFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (updateError) setUpdateError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`${backendUrl}/books/addbook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          tags: formData.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          status: formData.status,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not add book");
      }

      setFormData({ title: "", author: "", tags: "", status: "Want to Read" });
      fetchBooks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Guard BEFORE entering the loading/try state — otherwise an early
    // return here leaves `updating` stuck at true with no way to recover.
    if (!editingBookId) return;

    setUpdating(true);
    setUpdateError(null);

    try {
      const res = await fetch(
        `${backendUrl}/books/updatebook/${editingBookId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            title: editFormData.title,
            author: editFormData.author,
            tags: editFormData.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
            status: editFormData.status,
          }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not update book");
      }

      setEditingBookId(null);
      setEditFormData({
        title: "",
        author: "",
        tags: "",
        status: "Want to Read",
      });
      fetchBooks();
    } catch (err) {
      setUpdateError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    } finally {
      setUpdating(false);
    }
  };

  const startEditing = (book: Book) => {
    setEditingBookId(book._id);
    setEditFormData({
      title: book.title,
      author: book.author,
      tags: book.tags.join(", "),
      status: book.status,
    });
    setUpdateError(null);
  };

  const cancelEditing = () => {
    setEditingBookId(null);
    setEditFormData({
      title: "",
      author: "",
      tags: "",
      status: "Want to Read",
    });
    setUpdateError(null);
  };

  const handleStatusChange = async (book: Book, newStatus: Book["status"]) => {
    try {
      const res = await fetch(`${backendUrl}/books/updatebook/${book._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not update status");
      }

      fetchBooks();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };


  const handleDeleteBook = async (id:string) => {
  try {
    const res = await fetch(
      `${backendUrl}/books/delete/${id}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message);
    }

    fetchBooks();
  } catch (err) {
    console.error(err);
  }
};

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#1a1042] px-4 py-10 sm:px-8">
      {/* Ambient gradient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-fuchsia-500/40 blur-[100px]" />
        <div className="absolute right-0 top-40 h-[28rem] w-[28rem] rounded-full bg-indigo-500/40 blur-[110px]" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-cyan-400/30 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your Reading Shelf
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Track what you're reading, what's next, and what you've finished.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Add Book */}
          <div className="rounded-2xl border border-white/20 bg-white/10 p-7 shadow-2xl shadow-black/20 backdrop-blur-2xl lg:col-span-2 lg:sticky lg:top-10 lg:self-start">
            <h2 className="mb-5 text-xl font-bold text-white">Add a book</h2>

            {error && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-2 rounded-lg border border-red-300/30 bg-red-400/10 px-3.5 py-2.5 text-sm text-red-100 backdrop-blur-sm"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="title"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  placeholder="The Midnight Library"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none backdrop-blur-sm transition placeholder:text-white/40 focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
                />
              </div>

              <div>
                <label
                  htmlFor="author"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60"
                >
                  Author
                </label>
                <input
                  id="author"
                  type="text"
                  name="author"
                  placeholder="Matt Haig"
                  value={formData.author}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none backdrop-blur-sm transition placeholder:text-white/40 focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
                />
              </div>

              <div>
                <label
                  htmlFor="tags"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60"
                >
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  name="tags"
                  placeholder="fiction, fantasy, favorites"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none backdrop-blur-sm transition placeholder:text-white/40 focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
                />
                <p className="mt-1 text-xs text-white/40">
                  Separate tags with commas
                </p>
              </div>

              <div>
                <label
                  htmlFor="status"
                  className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none backdrop-blur-sm transition focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20 [&>option]:bg-[#2a1d5c] [&>option]:text-white"
                >
                  <option>Want to Read</option>
                  <option>Reading</option>
                  <option>Completed</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-gradient-to-r from-fuchsia-500/80 to-indigo-500/80 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 backdrop-blur-sm transition hover:from-fuchsia-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:from-gray-500/50 disabled:to-gray-500/50"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                {submitting ? "Adding..." : "Add book"}
              </button>
            </form>
          </div>

          {/* Book List */}
          <div className="lg:col-span-3 flex min-h-0 flex-col">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="mb-5 text-xl font-bold text-white">
                Recently added
              </h2>
              <div className="w-35 rounded-2xl bg-gradient-to-r from-blue-600 to-red-600 p-2 text-white shadow-lg">
                <span className="ml-2 mr-2 text-lg">📚</span>
                <span className="font-semibold">{books.length} Books</span>
              </div>
            </div>

            {loadingBooks ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 py-16 text-sm text-white/70 shadow-2xl shadow-black/20 backdrop-blur-2xl">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading your shelf...
              </div>
            ) : books.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/25 bg-white/5 py-16 text-center backdrop-blur-xl">
                <BookOpen className="mb-3 h-8 w-8 text-white/40" />
                <p className="text-sm text-white/60">
                  Your shelf is empty — add your first book to get started.
                </p>
              </div>
            ) : (
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                {books.map((book) => (
                  <div
                    key={book._id}
                    className="flex overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-xl shadow-black/10 backdrop-blur-2xl transition hover:bg-white/15"
                  >
                    {editingBookId === book._id ? (
                      <div className="flex-1 p-5">
                        <form
                          onSubmit={handleUpdateSubmit}
                          className="space-y-4"
                        >
                          <div>
                            <label
                              htmlFor={`edit-title-${book._id}`}
                              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60"
                            >
                              Title
                            </label>
                            <input
                              id={`edit-title-${book._id}`}
                              type="text"
                              name="title"
                              placeholder="The Midnight Library"
                              value={editFormData.title}
                              onChange={handleEditChange}
                              required
                              className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none backdrop-blur-sm transition placeholder:text-white/40 focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-author-${book._id}`}
                              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60"
                            >
                              Author
                            </label>
                            <input
                              id={`edit-author-${book._id}`}
                              type="text"
                              name="author"
                              placeholder="Matt Haig"
                              value={editFormData.author}
                              onChange={handleEditChange}
                              required
                              className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none backdrop-blur-sm transition placeholder:text-white/40 focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
                            />
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-tags-${book._id}`}
                              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60"
                            >
                              Tags
                            </label>
                            <input
                              id={`edit-tags-${book._id}`}
                              type="text"
                              name="tags"
                              placeholder="fiction, fantasy, favorites"
                              value={editFormData.tags}
                              onChange={handleEditChange}
                              className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none backdrop-blur-sm transition placeholder:text-white/40 focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20"
                            />
                            <p className="mt-1 text-xs text-white/40">
                              Separate tags with commas
                            </p>
                          </div>

                          <div>
                            <label
                              htmlFor={`edit-status-${book._id}`}
                              className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-white/60"
                            >
                              Status
                            </label>
                            <select
                              id={`edit-status-${book._id}`}
                              name="status"
                              value={editFormData.status}
                              onChange={handleEditChange}
                              className="w-full rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm text-white outline-none backdrop-blur-sm transition focus:border-white/40 focus:bg-white/15 focus:ring-2 focus:ring-white/20 [&>option]:bg-[#2a1d5c] [&>option]:text-white"
                            >
                              <option>Want to Read</option>
                              <option>Reading</option>
                              <option>Completed</option>
                            </select>
                          </div>

                          {updateError && (
                            <div
                              role="alert"
                              className="flex items-start gap-2 rounded-lg border border-red-300/30 bg-red-400/10 px-3.5 py-2.5 text-sm text-red-100 backdrop-blur-sm"
                            >
                              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                              <span>{updateError}</span>
                            </div>
                          )}

                          <div className="flex gap-3">
                            <button
                              type="submit"
                              disabled={updating}
                              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/20 bg-gradient-to-r from-fuchsia-500/80 to-indigo-500/80 py-2.5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/20 backdrop-blur-sm transition hover:from-fuchsia-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:from-gray-500/50 disabled:to-gray-500/50"
                            >
                              {updating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                              {updating ? "Updating..." : "Save changes"}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditing}
                              disabled={updating}
                              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3.5 py-2.5 text-sm font-semibold text-white outline-none backdrop-blur-sm transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <>
                        <div
                          className={`w-1.5 shrink-0 ${statusStyles[book.status]?.spine ?? "bg-white/30"}`}
                        />
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-lg font-bold leading-tight text-white">
                                {book.title}
                              </h3>
                              <p className="mt-0.5 text-sm text-white/60">
                                {book.author}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${
                                statusStyles[book.status]?.badge ??
                                "border border-white/20 bg-white/10 text-white/70"
                              }`}
                            >
                              {book.status}
                            </span>
                          </div>

                          {book.tags.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {book.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs text-white/60"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="mt-4 flex items-center justify-between">
                            <p className="flex items-center gap-1.5 text-xs text-white/40">
                              <Calendar className="h-3 w-3" />
                              Added{" "}
                              {new Date(book.createdAt).toLocaleDateString()}
                            </p>

                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  let nextStatus: Book["status"];

                                  if (book.status === "Want to Read") {
                                    nextStatus = "Reading";
                                  } else if (book.status === "Reading") {
                                    nextStatus = "Completed";
                                  } else {
                                    // Completed → Want to Read
                                    nextStatus = "Want to Read";
                                  }

                                  handleStatusChange(book, nextStatus);
                                }}
                                className="text-xs font-medium text-white/60 transition hover:text-white"
                              >
                                Change Status
                              </button>
                              <button
                                onClick={() => startEditing(book)}
                                className="text-xs font-medium text-white/60 transition hover:text-white"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBook(book._id)}
                                className="text-xs font-medium text-white/60 transition hover:text-white"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
