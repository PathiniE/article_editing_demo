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
        className="article-content"
        style={{
          fontFamily: 'Helvetica, Arial, sans-serif',
          lineHeight: '1.6',
          fontSize: '16px',
          color: '#000'
        }}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
      
      <style dangerouslySetInnerHTML={{
        __html: `
          .article-content h1 {
            font-size: 2em !important;
            font-weight: bold !important;
            margin: 1em 0 0.5em 0 !important;
            color: #333 !important;
          }
          
          .article-content h2 {
            font-size: 1.5em !important;
            font-weight: bold !important;
            margin: 1em 0 0.5em 0 !important;
            color: #333 !important;
          }
          
          .article-content h3 {
            font-size: 1.3em !important;
            font-weight: bold !important;
            margin: 1em 0 0.5em 0 !important;
            color: #333 !important;
          }
          
          .article-content h4 {
            font-size: 1.1em !important;
            font-weight: bold !important;
            margin: 1em 0 0.5em 0 !important;
            color: #333 !important;
          }
          
          .article-content h5 {
            font-size: 1em !important;
            font-weight: bold !important;
            margin: 1em 0 0.5em 0 !important;
            color: #333 !important;
          }
          
          .article-content h6 {
            font-size: 0.9em !important;
            font-weight: bold !important;
            margin: 1em 0 0.5em 0 !important;
            color: #333 !important;
          }
          
          .article-content p {
            margin: 1em 0 !important;
          }
          
          .article-content ul {
            list-style-type: disc !important;
            margin: 1em 0 !important;
            padding-left: 40px !important;
          }
          
          .article-content ol {
            list-style-type: decimal !important;
            margin: 1em 0 !important;
            padding-left: 40px !important;
          }
          
          .article-content li {
            margin: 0.5em 0 !important;
            padding-left: 5px !important;
            display: list-item !important;
          }
          
          .article-content ul ul {
            list-style-type: circle !important;
            margin: 0.5em 0 !important;
          }
          
          .article-content ul ul ul {
            list-style-type: square !important;
          }
          
          .article-content ol ol {
            list-style-type: lower-alpha !important;
            margin: 0.5em 0 !important;
          }
          
          .article-content table {
            border-collapse: collapse !important;
            width: 100% !important;
            margin: 1em 0 !important;
            border: 1px solid #ddd !important;
          }
          
          .article-content table td,
          .article-content table th {
            border: 1px solid #ddd !important;
            padding: 8px 12px !important;
            text-align: left !important;
          }
          
          .article-content table th {
            background-color: #f2f2f2 !important;
            font-weight: bold !important;
          }
          
          .article-content table tr:nth-child(even) {
            background-color: #f9f9f9 !important;
          }
          
          .article-content img {
            max-width: 100% !important;
            height: auto !important;
            margin: 10px 0 !important;
            display: block !important;
            border-radius: 4px !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1) !important;
          }
          
          .article-content a {
            color: #0066cc !important;
            text-decoration: underline !important;
          }
          
          .article-content a:hover {
            color: #004499 !important;
          }
          
          .article-content strong {
            font-weight: bold !important;
          }
          
          .article-content em {
            font-style: italic !important;
          }
          
          .article-content u {
            text-decoration: underline !important;
          }
          
          .article-content blockquote {
            border-left: 4px solid #ddd !important;
            margin: 1em 0 !important;
            padding-left: 1em !important;
            color: #666 !important;
            font-style: italic !important;
          }
          
          .article-content code {
            background-color: #f4f4f4 !important;
            padding: 2px 4px !important;
            border-radius: 3px !important;
            font-family: monospace !important;
            font-size: 0.9em !important;
          }
          
          .article-content pre {
            background-color: #f4f4f4 !important;
            padding: 1em !important;
            border-radius: 4px !important;
            overflow-x: auto !important;
            margin: 1em 0 !important;
          }
          
          .article-content pre code {
            background: none !important;
            padding: 0 !important;
          }
          
          .article-content hr {
            border: none !important;
            border-top: 1px solid #ddd !important;
            margin: 2em 0 !important;
          }
        `
      }} />
    </div>
  );
};

export default ArticleView;