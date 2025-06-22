'use client';

import React, { useState, useEffect } from 'react';
import ArticleEditor from './components/ArticleEditor';
import ArticleList from './components/ArticleList';
import { IArticle } from './lib/models/Article';

export default function Home() {
  const [articles, setArticles] = useState<IArticle[]>([]);
  const [editingArticle, setEditingArticle] = useState<IArticle | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        setArticles(data.data);
      } else {
        console.error('API Error:', data.error);
      }
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  // REPLACE THIS FUNCTION WITH THE DEBUG VERSION
  const handleSave = async (articleData: Partial<IArticle>) => {
    try {
      console.log('Saving article data:', articleData); // Debug log
      
      const url = editingArticle ? `/api/articles/${editingArticle._id}` : '/api/articles';
      const method = editingArticle ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(articleData),
      });

      console.log('Response status:', response.status); // Debug log
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData); // Debug log
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json();
      if (data.success) {
        fetchArticles();
        setShowEditor(false);
        setEditingArticle(null);
      } else {
        alert('Error saving article: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving article:', error);
      alert('Failed to save article. Please try again. Error: ' + error.message);
    }
  };

  const handleEdit = (article: IArticle) => {
    setEditingArticle(article);
    setShowEditor(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        const response = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          fetchArticles();
        } else {
          alert('Error deleting article: ' + data.error);
        }
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Failed to delete article. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    setShowEditor(false);
    setEditingArticle(null);
  };

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Article Management System
        </h1>

        {!showEditor && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowEditor(true)}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 text-lg"
            >
              Create New Article
            </button>
          </div>
        )}

        {showEditor ? (
          <ArticleEditor
            article={editingArticle || undefined}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <div className="max-w-4xl mx-auto">
            {loading ? (
              <div className="text-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading articles...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No articles yet. Create your first article!</p>
              </div>
            ) : (
              <ArticleList
                articles={articles}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        )}
      </div>
    </main>
  );
}