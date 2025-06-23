'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { IArticle } from '../lib/models/Article';

interface ArticleEditorProps {
  article?: IArticle;
  onSave: (article: Partial<IArticle>) => void;
  onCancel: () => void;
}

interface TinyMCEEditor {
  getContent: () => string;
  setContent: (content: string) => void;
  insertContent: (content: string) => void;
  selection: {
    getNode: () => HTMLElement;
    select: (element: HTMLElement) => void;
  };
  dom: {
    remove: (element: HTMLElement) => void;
    setAttribs: (element: HTMLElement, attrs: Record<string, string | null>) => void;
    setStyle: (element: HTMLElement, property: string, value: string) => void;
    select: (selector: string) => HTMLElement[];
    removeClass: (element: HTMLElement, className: string) => void;
    addClass: (element: HTMLElement, className: string) => void;
  };
  fire: (event: string) => void;
  execCommand: (command: string) => void;
  ui: {
    registry: {
      addButton: (name: string, config: ButtonConfig) => void;
      addContextMenu: (name: string, config: ContextMenuConfig) => void;
    };
  };
  windowManager: {
    open: (config: WindowConfig) => WindowAPI;
    close: () => void;
  };
  on: (event: string, callback: (e: TinyMCEEvent) => void) => void;
  off: (event: string, callback: (e: TinyMCEEvent) => void) => void;
}

interface ButtonConfig {
  icon: string;
  tooltip: string;
  onAction: () => void;
}

interface ContextMenuConfig {
  update: (element: Element) => MenuItem[];
}

interface MenuItem {
  type: 'menuitem' | 'separator';
  text?: string;
  icon?: string;
  onAction?: () => void;
}

interface WindowConfig {
  title: string;
  size: 'small' | 'medium' | 'large';
  body: {
    type: 'panel';
    items: FormItem[];
  };
  buttons: ButtonItem[];
  initialData?: Record<string, string>;
  onAction?: (api: WindowAPI, details: { name: string }) => void;
  onSubmit?: (api: WindowAPI) => void;
}

interface FormItem {
  type: 'input' | 'grid' | 'selectbox' | 'htmlpanel';
  name?: string;
  label?: string;
  placeholder?: string;
  columns?: number;
  items?: FormItem[] | SelectboxItem[];
  html?: string;
}

interface SelectboxItem {
  text: string;
  value: string;
}

interface ButtonItem {
  type: 'custom' | 'cancel' | 'submit';
  text: string;
  name?: string;
  primary?: boolean;
}

interface WindowAPI {
  getData: () => Record<string, string>;
  close: () => void;
}

interface TinyMCEEvent {
  target: HTMLElement;
  element: HTMLElement;
  keyCode: number;
  preventDefault: () => void;
}

interface BlobInfo {
  blob: () => Blob;
  filename: () => string;
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ article, onSave, onCancel }) => {
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<TinyMCEEditor | null>(null);
  
  // Prevent content sync issues
  const isInitializing = useRef(true);
  const lastEditorContent = useRef(content);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    // Get content directly from the editor to ensure we have the latest content
    const currentContent = editorRef.current ? editorRef.current.getContent() : content;
    
    console.log('Editor content before save:', currentContent);
    console.log('Title before save:', title);
        
    // Check if content is empty or just contains empty HTML tags
    const contentText = currentContent.replace(/<[^>]*>/g, '').trim();
    if (!contentText) {
      alert('Please enter some content');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({ title: title.trim(), content: currentContent });
    } finally {
      setIsSaving(false);
    }
  };

  // Simplified image upload handler that forces immediate display
  const handleImageUpload = useCallback((blobInfo: BlobInfo): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        const file = blobInfo.blob();
        const filename = blobInfo.filename();
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          reject('Please select a valid image file');
          return;
        }
        
        // Validate file size (max 10MB for better compatibility)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          reject('Image size must be less than 10MB');
          return;
        }

        const reader = new FileReader();
        reader.onload = () => {
          const dataUrl = reader.result as string;
          console.log('Image converted to data URL, length:', dataUrl.length);
          
          // Force immediate resolve to ensure TinyMCE gets the URL right away
          setTimeout(() => {
            resolve(dataUrl);
          }, 0);
        };
        reader.onerror = () => {
          console.error('Failed to read file:', filename);
          reject('Failed to read image file');
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Image upload error:', error);
        reject('Failed to upload image');
      }
    });
  }, []);

  // Minimal content change handler to prevent flickering
  const handleEditorChange = useCallback((newContent: string) => {
    // Prevent unnecessary updates during initialization
    if (isInitializing.current) {
      return;
    }
    
    // Only update if content genuinely changed
    if (newContent !== lastEditorContent.current) {
      lastEditorContent.current = newContent;
      setContent(newContent);
    }
  }, []);

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
          apiKey=" "
          onInit={(evt, editor) => {
            editorRef.current = editor as TinyMCEEditor;
            console.log('TinyMCE Editor initialized');
            // Mark initialization as complete after a short delay
            setTimeout(() => {
              isInitializing.current = false;
            }, 500);
          }}
          value={content}
          init={{
            height: 600,
            menubar: 'file edit view insert format tools table help',
            // SOLUTION 1: Remove 'paste' from plugins array
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'wordcount', 'help'
              // Removed 'paste' plugin - TinyMCE has built-in paste functionality
            ],
            
            // SOLUTION 2: Alternative - Use CDN for plugins (uncomment if you need paste plugin)
            // external_plugins: {
            //   'paste': 'https://cdn.tiny.cloud/1/no-api-key/tinymce/6/plugins/paste/plugin.min.js'
            // },
            
            // SOLUTION 3: Disable plugin loading entirely (uncomment if needed)
            // plugins: false,
            
            toolbar: 'undo redo | blocks | ' +
              'bold italic backcolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help | ' +
              'image | table tabledelete | tableprops tablerowprops tablecellprops | ' +
              'tableinsertrowbefore tableinsertrowafter tabledeleterow | ' +
              'tableinsertcolbefore tableinsertcolafter tabledeletecol',
            content_style: `
              body { 
                font-family: Helvetica, Arial, sans-serif; 
                font-size: 16px;
                line-height: 1.6;
                padding: 10px;
              }
              table {
                border-collapse: collapse;
                width: 100%;
                margin: 1em 0;
              }
              table td, table th {
                border: 1px solid #ddd;
                padding: 8px;
              }
              table th {
                background-color: #f2f2f2;
                font-weight: bold;
              }
              img {
                max-width: 100%;
                height: auto;
                margin: 10px 0;
                display: block;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
              }
              .mce-content-body img[data-mce-selected] {
                outline: 3px solid #0066cc !important;
                outline-offset: 2px;
              }
            `,
            branding: false,
            
            // Optimized image configuration for immediate display
            image_advtab: true,
            image_uploadtab: true,
            images_upload_handler: handleImageUpload,
            images_reuse_filename: false,
            automatic_uploads: true,
            images_file_types: 'jpg,jpeg,png,gif,webp,svg,bmp',
            
            // Force immediate image processing
            images_upload_base_path: '',
            convert_urls: false,
            
            // Enhanced paste configuration - these work without the paste plugin
            paste_data_images: true,
            paste_as_text: false,
            paste_webkit_styles: 'color font-size',
            paste_retain_style_properties: 'color font-size font-family',
            paste_remove_styles_if_webkit: false,
            
            // Performance optimizations
            skin: 'oxide',
            content_css: false,
            
            // Table configuration
            table_default_attributes: {
              border: '1'
            },
            table_default_styles: {
              'border-collapse': 'collapse',
              'width': '100%'
            },
            
            // Context menu
            contextmenu: 'link image table',
            
            // File picker for images
            file_picker_types: 'image',
            file_picker_callback: (callback: (url: string, meta: { alt: string }) => void, value: string, meta: { filetype: string }) => {
              if (meta.filetype === 'image') {
                const input = document.createElement('input');
                input.setAttribute('type', 'file');
                input.setAttribute('accept', 'image/*');
                
                input.addEventListener('change', (e: Event) => {
                  const target = e.target as HTMLInputElement;
                  const file = target.files?.[0];
                  
                  if (file) {
                    // Validate file
                    if (!file.type.startsWith('image/')) {
                      alert('Please select a valid image file');
                      return;
                    }
                    
                    const maxSize = 10 * 1024 * 1024; // 10MB
                    if (file.size > maxSize) {
                      alert('Image size must be less than 10MB');
                      return;
                    }
                    
                    const reader = new FileReader();
                    reader.addEventListener('load', () => {
                      const dataUrl = reader.result as string;
                      console.log('File picker image loaded:', file.name);
                      callback(dataUrl, {
                        alt: file.name.replace(/\.[^/.]+$/, "")
                      });
                    });
                    reader.readAsDataURL(file);
                  }
                });
                
                input.click();
              }
            },
            
            // Setup function with minimal event handling
            setup: (editor: TinyMCEEditor) => {
              console.log('Setting up TinyMCE editor');

              // Handle image loading to ensure visibility
              editor.on('LoadContent', () => {
                console.log('Content loaded in editor');
              });

              // Handle image selection for better UX
              editor.on('NodeChange', (e: TinyMCEEvent) => {
                if (e.element && e.element.tagName === 'IMG') {
                  console.log('Image selected:', e.element.getAttribute('src')?.substring(0, 50) + '...');
                }
              });

              // Only handle essential content changes to prevent flickering
              let updateTimeout: NodeJS.Timeout;
              editor.on('input', () => {
                if (!isInitializing.current) {
                  // Check for pasted images during content changes
                  const images = editor.dom.select('img[src^="data:"]');
                  if (images.length > 0) {
                    console.log('Found images in content:', images.length);
                    images.forEach((img, index) => {
                      console.log(`Image ${index + 1} src length:`, img.getAttribute('src')?.length);
                    });
                  }
                  
                  clearTimeout(updateTimeout);
                  updateTimeout = setTimeout(() => {
                    const newContent = editor.getContent();
                    if (newContent !== lastEditorContent.current) {
                      lastEditorContent.current = newContent;
                      setContent(newContent);
                    }
                  }, 300);
                }
              });

              // Handle important changes immediately
              editor.on('change', () => {
                if (!isInitializing.current) {
                  const newContent = editor.getContent();
                  if (newContent !== lastEditorContent.current) {
                    lastEditorContent.current = newContent;
                    setContent(newContent);
                  }
                }
              });

              // Clean up
              editor.on('remove', () => {
                clearTimeout(updateTimeout);
              });
            }
          }}
          onEditorChange={handleEditorChange}
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
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