"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export interface BookmarkedDocument {
  id: string;
  title: string;
  description: string;
  date: string;
  organization: string;
  topics: string[];
  bookmarkedAt: string;
}

interface BookmarkContextType {
  bookmarks: BookmarkedDocument[];
  addBookmark: (doc: BookmarkedDocument) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

const STORAGE_KEY = "regulatory-bookmarks";

export function BookmarkProvider({ children }: { children: ReactNode }) {
  const [bookmarks, setBookmarks] = useState<BookmarkedDocument[]>([]);

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to load bookmarks:", error);
      }
    }
  }, []);

  // Save bookmarks to localStorage whenever they change
  useEffect(() => {
    if (bookmarks.length > 0 || localStorage.getItem(STORAGE_KEY)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }
  }, [bookmarks]);

  const addBookmark = (doc: BookmarkedDocument) => {
    setBookmarks((prev) => {
      if (prev.find(b => b.id === doc.id)) {
        return prev;
      }
      return [...prev, { ...doc, bookmarkedAt: new Date().toISOString() }];
    });
  };

  const removeBookmark = (id: string) => {
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
  };

  const isBookmarked = (id: string) => {
    return bookmarks.some(bookmark => bookmark.id === id);
  };

  return (
    <BookmarkContext.Provider value={{ bookmarks, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error("useBookmarks must be used within a BookmarkProvider");
  }
  return context;
}
