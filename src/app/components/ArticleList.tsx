'use client';

import React from 'react';
import Link from 'next/link';
import { IArticle } from '../lib/models/Article';

interface ArticleListProps {
  articles: IArticle[];
  onEdit: (article: IArticle) => void;
  onDelete: (id: string) => void;
}

const ArticleList: React.FC<ArticleListProps> = ({ articles, onEdit, onDelete }) => {
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <div key={article._id} className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-xl font-bold text-gray-800">{article.title}</h2>
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(article)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(article._id!)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
          
          <p className="text-gray-600 mb-4 line-clamp-3">
            {stripHtml(article.content).substring(0, 200)}...
          </p>
          
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
              Updated: {new Date(article.updatedAt).toLocaleDateString()}
            </span>
            <Link
              href={`/articles/${article._id}`}
              className="text-blue-600 hover:text-blue-800"
            >
              Read More →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ArticleList;