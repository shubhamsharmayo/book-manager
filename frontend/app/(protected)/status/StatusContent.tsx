"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Calendar, Loader2, AlertCircle, Check, Tag, X } from "lucide-react";

interface Book {
  _id: string;
  title: string;
  author: string;
  tags: string[];
  status: "Want to Read" | "Reading" | "Completed";
  createdAt: string;
}

interface EditFormData {
  title: string;
  author: string;
  tags: string;
  status: Book["status"];
}

const backendUrl = process.env.NEXT_PUBLIC_NODE_API_URL;

const STATUSES: Book["status"][] = ["Want to Read", "Reading", "Completed"];

const statusStyles: Record<
  Book["status"],
  { badge: string; spine: string; tabActive: string }
> = {
  "Want to Read": {
    badge: "bg-sky-400/20 text-sky-100 border border-sky-300/30",
    spine: "bg-sky-400",
    tabActive: "border-sky-300/40 bg-sky-400/20 text-sky-100",
  },
  Reading: {
    badge: "bg-amber-400/20 text-amber-100 border border-amber-300/30",
    spine: "bg-amber-400",
    tabActive: "border-amber-300/40 bg-amber-400/20 text-amber-100",
  },
  Completed: {
    badge: "bg-emerald-400/20 text-emerald-100 border border-emerald-300/30",
    spine: "bg-emerald-400",
    tabActive: "border-emerald-300/40 bg-emerald-400/20 text-emerald-100",
  },
};

export default function StatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeFilter =
    (searchParams.get("filter") as Book["status"] | "All") || "All";
  const activeTag = searchParams.get("tag") || "All";

  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
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

  const setFilter = (nextStatus: Book["status"] | "All") => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextStatus === "All") {
      params.delete("filter");
    } else {
      params.set("filter", nextStatus);
    }
    router.push(`/status?${params.toString()}`);
  };

  const setTagFilter = (nextTag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (nextTag === "All") {
      params.delete("tag");
    } else {
      params.set("tag", nextTag);
    }
    router.push(`/status?${params.toString()}`);
  };

  const fetchBooks = async (filter: Book["status"] | "All") => {
    setLoading(true);
    setError(null);
    try {
      if (!backendUrl) {
        throw new Error("API URL is not configured");
      }

      const url =
        filter === "All"
          ? `${backendUrl}/books/getbooks`
          : `${backendUrl}/books/status?status=${encodeURIComponent(filter)}`;

      const res = await fetch(url, { credentials: "include" });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Unexpected response from server");
      }

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not load books");
      }

      setBooks(data.books);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Refetch whenever the status filter changes (tag filtering happens
  // client-side below, so it doesn't need its own refetch).
  useEffect(() => {
    fetchBooks(activeFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilter]);

  // Every unique tag present in the currently-fetched (status-filtered)
  // book set — this naturally narrows as you switch status tabs, since
  // it's derived from whatever `books` currently holds.
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    books.forEach((book) => book.tags.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [books]);

  // If the tag currently in the URL no longer exists in this status's
  // book set (e.g. switched status tabs), drop it instead of silently
  // showing an empty list with no explanation.
  useEffect(() => {
    if (
      activeTag !== "All" &&
      !loading &&
      !availableTags.includes(activeTag)
    ) {
      setTagFilter("All");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTag, availableTags, loading]);

  const visibleBooks = useMemo(() => {
    if (activeTag === "All") return books;
    return books.filter((book) => book.tags.includes(activeTag));
  }, [books, activeTag]);

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setEditFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (updateError) setUpdateError(null);
  };

  const handleUpdateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not update book");
      }

      setEditingBookId(null);
      setEditFormData({ title: "", author: "", tags: "", status: "Want to Read" });
      fetchBooks(activeFilter);
    } catch (err) {
      setUpdateError(err instanceof Error ? err.message : "Something went wrong");
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
    setEditFormData({ title: "", author: "", tags: "", status: "Want to Read" });
    setUpdateError(null);
  };

  const handleDeleteBook = async (id: string) => {
    try {
      const res = await fetch(`${backendUrl}/books/delete/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      fetchBooks(activeFilter);
    } catch (err) {
      console.error(err);
    }
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

      fetchBooks(activeFilter);
    } catch (err) {
      console.error("Failed to update status:", err);
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

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Browse by status
          </h1>
          <p className="mt-2 text-sm text-white/60">
            Filter your shelf to see what's next, what's in progress, and what's
            done.
          </p>
        </div>

        {/* Status tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("All")}
            className={`rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm transition ${
              activeFilter === "All"
                ? "border-white/40 bg-white/20 text-white"
                : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10"
            }`}
          >
            All
          </button>

          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full border px-4 py-2 text-sm font-medium backdrop-blur-sm transition ${
                activeFilter === s
                  ? statusStyles[s].tabActive
                  : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Tag filter */}
        {!loading && availableTags.length > 0 && (
          <div className="mb-8 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-white/40">
              <Tag className="h-3 w-3" />
              Tag
            </span>

            <button
              onClick={() => setTagFilter("All")}
              className={`rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm transition ${
                activeTag === "All"
                  ? "border-white/40 bg-white/20 text-white"
                  : "border-white/15 bg-white/5 text-white/50 hover:bg-white/10"
              }`}
            >
              All
            </button>

            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setTagFilter(activeTag === tag ? "All" : tag)}
                className={`rounded-full border px-3 py-1 text-xs font-medium backdrop-blur-sm transition ${
                  activeTag === tag
                    ? "border-fuchsia-300/40 bg-fuchsia-400/20 text-fuchsia-100"
                    : "border-white/15 bg-white/5 text-white/50 hover:bg-white/10"
                }`}
              >
                {tag}
              </button>
            ))}

            {activeTag !== "All" && (
              <button
                onClick={() => setTagFilter("All")}
                className="flex items-center gap-1 text-xs text-white/40 transition hover:text-white/70"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 py-16 text-sm text-white/70 shadow-2xl shadow-black/20 backdrop-blur-2xl">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading your shelf...
          </div>
        ) : error ? (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-2xl border border-red-300/30 bg-red-400/10 px-5 py-4 text-sm text-red-100 backdrop-blur-sm"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        ) : visibleBooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/25 bg-white/5 py-16 text-center backdrop-blur-xl">
            <BookOpen className="mb-3 h-8 w-8 text-white/40" />
            <p className="text-sm text-white/60">
              {activeTag !== "All"
                ? `No books tagged "${activeTag}"${
                    activeFilter !== "All" ? ` in "${activeFilter}"` : ""
                  }.`
                : activeFilter === "All"
                ? "Your shelf is empty."
                : `No books marked "${activeFilter}" yet.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {visibleBooks.map((book) => (
              <div
                key={book._id}
                className="flex overflow-hidden rounded-xl border border-white/20 bg-white/10 shadow-xl shadow-black/10 backdrop-blur-2xl transition hover:bg-white/15"
              >
                {editingBookId === book._id ? (
                  <div className="flex-1 p-5">
                    <form onSubmit={handleUpdateSubmit} className="space-y-4">
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

                        {activeFilter === "All" && (
                          <span
                            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${
                              statusStyles[book.status]?.badge ??
                              "border border-white/20 bg-white/10 text-white/70"
                            }`}
                          >
                            {book.status}
                          </span>
                        )}
                      </div>

                      {book.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {book.tags.map((tag, index) => (
                            <button
                              key={index}
                              onClick={() =>
                                setTagFilter(activeTag === tag ? "All" : tag)
                              }
                              className={`rounded-full border px-2.5 py-1 text-xs transition ${
                                activeTag === tag
                                  ? "border-fuchsia-300/40 bg-fuchsia-400/20 text-fuchsia-100"
                                  : "border-white/15 bg-white/5 text-white/60 hover:bg-white/10"
                              }`}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <p className="flex items-center gap-1.5 text-xs text-white/40">
                          <Calendar className="h-3 w-3" />
                          Added {new Date(book.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              let nextStatus: Book["status"];

                              if (book.status === "Want to Read") {
                                nextStatus = "Reading";
                              } else if (book.status === "Reading") {
                                nextStatus = "Completed";
                              } else {
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
    </main>
  );
}