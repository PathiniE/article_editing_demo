'use client';

import React, { useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { IArticle } from '../lib/models/Article';

interface ArticleEditorProps {
  article?: IArticle;
  onSave: (article: Partial<IArticle>) => void;
  onCancel: () => void;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ article, onSave, onCancel }) => {
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<any>(null);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    console.log('Editor content before save:', content); // Debug log
    console.log('Title before save:', title); // Debug log
    
    // Check if content is empty or just contains empty HTML tags
    const contentText = content.replace(/<[^>]*>/g, '').trim();
    if (!contentText) {
      alert('Please enter some content');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ title: title.trim(), content });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Article Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold border-b-2 border-gray-200 focus:border-blue-500 outline-none pb-2"
        />
      </div>

      <div className="mb-6">
        <Editor
          apiKey="7j15ctc84od36f3vb4pypwtc4prqvid1toi4edg1x3xsu8xj"
          onInit={(evt, editor) => editorRef.current = editor}
          initialValue={content}
          init={{
            height: 500,
            menubar: false,
            readonly: false,
            plugins: [
              'lists', 'link', 'searchreplace', 'visualblocks', 'fullscreen',
              'table', 'help', 'wordcount'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist | ' +
              'removeformat | help',
            content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }',
            branding: false
          }}
          onEditorChange={(content) => setContent(content)}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Article'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ArticleEditor;