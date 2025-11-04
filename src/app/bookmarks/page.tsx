"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bookmark, Star } from "lucide-react";

export default function BookmarksPage() {
  return (
    <div className="w-full animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Bookmarks</h1>
          <p className="text-sm sm:text-base text-gray-600">Your saved regulatory searches and documents</p>
        </div>

        <Card className="transition-all hover:shadow-lg duration-300">
          <CardHeader>
            <CardTitle>Saved Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bookmark className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No bookmarks yet</h3>
              <p className="text-sm text-gray-600 mb-4">Start bookmarking important documents and searches</p>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Star className="w-4 h-4 mr-2" />
                Explore Content
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
