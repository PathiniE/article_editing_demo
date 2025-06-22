import React from 'react';
import { IArticle } from '../lib/models/Article';

interface ArticleViewProps {
  article: IArticle;
}

const ArticleView: React.FC<ArticleViewProps> = ({ article }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{article.title}</h1>
        <p className="text-gray-600">
          Published: {new Date(article.createdAt).toLocaleDateString()} | 
          Updated: {new Date(article.updatedAt).toLocaleDateString()}
        </p>
      </div>
      
      <div 
        className="prose max-w-none prose-gray text-black"
         
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </div>
  );
};

export default ArticleView;