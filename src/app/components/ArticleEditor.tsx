'use client';

import React, { useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { IArticle } from '../lib/models/Article';

interface ArticleEditorProps {
  article?: IArticle;
  onSave: (article: Partial<IArticle>) => void;
  onCancel: () => void;
}

interface TinyMCEEditor {
  getContent: () => string;
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
}

const ArticleEditor: React.FC<ArticleEditorProps> = ({ article, onSave, onCancel }) => {
  const [title, setTitle] = useState(article?.title || '');
  const [content, setContent] = useState(article?.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<TinyMCEEditor | null>(null);

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

  const handleEditorChange = (newContent: string) => {
    setContent(newContent);
  };

  // Custom image upload handler
  const handleImageUpload = (blobInfo: BlobInfo): Promise<string> => {
    return new Promise((resolve, reject) => {
      // For demo purposes, we'll create a data URL from the blob
      // In production, you'd upload to your server or cloud storage
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject('Failed to read file');
      };
      reader.readAsDataURL(blobInfo.blob());
    });
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
          apiKey=" "
          onInit={(evt, editor) => {
            editorRef.current = editor as TinyMCEEditor;
          }}
          value={content}
          init={{
            height: 600,
            menubar: 'file edit view insert format tools table help',
            plugins: [
              'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
              'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
              'insertdatetime', 'media', 'table', 'wordcount', 'help'
            ],
            toolbar: 'undo redo | blocks | ' +
              'bold italic backcolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help | ' +
              'customimage deleteimage | table tabledelete | tableprops tablerowprops tablecellprops | ' +
              'tableinsertrowbefore tableinsertrowafter tabledeleterow | ' +
              'tableinsertcolbefore tableinsertcolafter tabledeletecol',
            content_style: `
              body { 
                font-family: Helvetica, Arial, sans-serif; 
                font-size: 16px;
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
                margin: 1em 0;
              }
              .mce-img-selected {
                outline: 2px solid #0066cc !important;
                outline-offset: 2px;
              }
            `,
            branding: false,
            
            // Image configuration
            image_advtab: true,
            image_uploadtab: true,
            images_upload_handler: handleImageUpload,
            images_reuse_filename: true,
            
            // Table configuration
            table_default_attributes: {
              border: '1'
            },
            table_default_styles: {
              'border-collapse': 'collapse',
              'width': '100%'
            },
            table_class_list: [
              { title: 'Default', value: '' },
              { title: 'Striped', value: 'table-striped' },
              { title: 'Bordered', value: 'table-bordered' }
            ],
            
            // Context menu configuration - using built-in context menu
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
                    const reader = new FileReader();
                    reader.addEventListener('load', () => {
                      callback(reader.result as string, {
                        alt: file.name
                      });
                    });
                    reader.readAsDataURL(file);
                  }
                });
                
                input.click();
              }
            },
            
            // Setup for handling image deletion and enhanced functionality
            setup: (editor: TinyMCEEditor) => {
              // Add custom button for image deletion in toolbar
              editor.ui.registry.addButton('deleteimage', {
                icon: 'remove',
                tooltip: 'Delete selected image',
                onAction: () => {
                  const selectedNode = editor.selection.getNode();
                  console.log('Delete button clicked, selected node:', selectedNode);
                  
                  if (selectedNode && selectedNode.tagName === 'IMG') {
                    if (confirm('Are you sure you want to delete this image?')) {
                      // Use editor.dom.remove for proper deletion
                      editor.dom.remove(selectedNode);
                      // Trigger content change event
                      editor.fire('change');
                      editor.fire('input');
                      // Update the content state
                      const newContent = editor.getContent();
                      setContent(newContent);
                      console.log('Image deleted, new content:', newContent);
                    }
                  } else {
                    alert('Please select an image to delete');
                  }
                }
              });

              // Custom image dialog with delete option
              editor.ui.registry.addButton('customimage', {
                icon: 'image',
                tooltip: 'Insert/edit image',
                onAction: () => {
                  const selectedNode = editor.selection.getNode();
                  const isImage = selectedNode && selectedNode.tagName === 'IMG';
                  
                  editor.windowManager.open({
                    title: isImage ? 'Edit Image' : 'Insert Image',
                    size: 'large',
                    body: {
                      type: 'panel',
                      items: [
                        {
                          type: 'input',
                          name: 'src',
                          label: 'Source',
                          placeholder: 'Image URL or select file...'
                        },
                        {
                          type: 'input',
                          name: 'alt',
                          label: 'Alternative description',
                          placeholder: 'Describe the image...'
                        },
                        {
                          type: 'grid',
                          columns: 2,
                          items: [
                            {
                              type: 'input',
                              name: 'width',
                              label: 'Width'
                            },
                            {
                              type: 'input',
                              name: 'height',
                              label: 'Height'
                            }
                          ]
                        },
                        {
                          type: 'selectbox',
                          name: 'align',
                          label: 'Alignment',
                          items: [
                            { text: 'None', value: '' },
                            { text: 'Left', value: 'left' },
                            { text: 'Center', value: 'center' },
                            { text: 'Right', value: 'right' }
                          ] as SelectboxItem[]
                        }
                      ]
                    },
                    buttons: [
                      ...(isImage ? [{
                        type: 'custom' as const,
                        text: 'Delete Image',
                        name: 'delete',
                        primary: false
                      }] : []),
                      {
                        type: 'cancel' as const,
                        text: 'Cancel'
                      },
                      {
                        type: 'submit' as const,
                        text: isImage ? 'Update Image' : 'Insert Image',
                        primary: true
                      }
                    ],
                    initialData: isImage ? {
                      src: (selectedNode as HTMLImageElement).src || '',
                      alt: (selectedNode as HTMLImageElement).alt || '',
                      width: (selectedNode as HTMLImageElement).width?.toString() || '',
                      height: (selectedNode as HTMLImageElement).height?.toString() || '',
                      align: (selectedNode as HTMLImageElement).style.float || (selectedNode as HTMLImageElement).getAttribute('align') || ''
                    } : {},
                    onAction: (api: WindowAPI, details: { name: string }) => {
                      if (details.name === 'delete' && selectedNode) {
                        if (confirm('Are you sure you want to delete this image?')) {
                          editor.dom.remove(selectedNode);
                          editor.fire('change');
                          editor.fire('input');
                          const newContent = editor.getContent();
                          setContent(newContent);
                          api.close();
                        }
                      }
                    },
                    onSubmit: (api: WindowAPI) => {
                      const data = api.getData();
                      
                      if (!data.src) {
                        alert('Please provide an image source');
                        return;
                      }

                      if (isImage && selectedNode) {
                        // Update existing image
                        editor.dom.setAttribs(selectedNode, {
                          src: data.src,
                          alt: data.alt,
                          width: data.width || null,
                          height: data.height || null
                        });
                        
                        if (data.align) {
                          if (data.align === 'center') {
                            editor.dom.setStyle(selectedNode, 'float', 'none');
                            editor.dom.setStyle(selectedNode, 'display', 'block');
                            editor.dom.setStyle(selectedNode, 'margin', '0 auto');
                          } else {
                            editor.dom.setStyle(selectedNode, 'float', data.align);
                            editor.dom.setStyle(selectedNode, 'display', '');
                            editor.dom.setStyle(selectedNode, 'margin', '');
                          }
                        }
                      } else {
                        // Insert new image
                        let imgHtml = `<img src="${data.src}" alt="${data.alt}"`;
                        if (data.width) imgHtml += ` width="${data.width}"`;
                        if (data.height) imgHtml += ` height="${data.height}"`;
                        
                        if (data.align && data.align !== 'center') {
                          imgHtml += ` style="float: ${data.align};"`;
                        } else if (data.align === 'center') {
                          imgHtml += ` style="display: block; margin: 0 auto;"`;
                        }
                        
                        imgHtml += '>';
                        editor.insertContent(imgHtml);
                      }
                      
                      editor.fire('change');
                      editor.fire('input');
                      const newContent = editor.getContent();
                      setContent(newContent);
                      api.close();
                    }
                  });
                }
              });

              // Add context menu for right-click on images using modern approach
              editor.ui.registry.addContextMenu('imageactions', {
                update: (element: Element) => {
                  if (element && element.tagName === 'IMG') {
                    return [
                      {
                        type: 'menuitem',
                        text: 'Edit Image Properties',
                        icon: 'image',
                        onAction: () => {
                          editor.selection.select(element as HTMLElement);
                          editor.execCommand('customimage');
                        }
                      },
                      {
                        type: 'separator'
                      },
                      {
                        type: 'menuitem',
                        text: 'Delete Image',
                        icon: 'remove',
                        onAction: () => {
                          if (confirm('Are you sure you want to delete this image?')) {
                            editor.dom.remove(element as HTMLElement);
                            editor.fire('change');
                            editor.fire('input');
                            const newContent = editor.getContent();
                            setContent(newContent);
                          }
                        }
                      },
                      {
                        type: 'separator'
                      },
                      {
                        type: 'menuitem',
                        text: 'Copy Image',
                        icon: 'copy',
                        onAction: () => {
                          editor.selection.select(element as HTMLElement);
                          editor.execCommand('copy');
                        }
                      }
                    ];
                  }
                  return [];
                }
              });

              // Handle double-click on images to open custom properties
              editor.on('dblclick', (e: TinyMCEEvent) => {
                if (e.target && e.target.tagName === 'IMG') {
                  editor.selection.select(e.target);
                  // Show a quick action menu for double-click
                  
                  // Create a simple action menu
                  editor.windowManager.open({
                    title: 'Image Actions',
                    size: 'small',
                    body: {
                      type: 'panel',
                      items: [
                        {
                          type: 'htmlpanel',
                          html: `
                            <div style="text-align: center; padding: 10px;">
                              <p style="margin-bottom: 15px;">What would you like to do with this image?</p>
                              <div style="display: flex; gap: 10px; justify-content: center;">
                                <button id="edit-image-btn" style="
                                  padding: 8px 16px; 
                                  background: #0066cc; 
                                  color: white; 
                                  border: none; 
                                  border-radius: 4px; 
                                  cursor: pointer;
                                  font-size: 14px;
                                ">Edit Properties</button>
                                <button id="delete-image-btn" style="
                                  padding: 8px 16px; 
                                  background: #dc3545; 
                                  color: white; 
                                  border: none; 
                                  border-radius: 4px; 
                                  cursor: pointer;
                                  font-size: 14px;
                                ">Delete Image</button>
                              </div>
                            </div>
                          `
                        }
                      ]
                    },
                    buttons: [
                      {
                        type: 'cancel',
                        text: 'Close'
                      }
                    ],
                    onSubmit: (api: WindowAPI) => {
                      api.close();
                    }
                  });

                  // Add event listeners after a short delay to ensure DOM is ready
                  setTimeout(() => {
                    const editBtn = document.getElementById('edit-image-btn');
                    const deleteBtn = document.getElementById('delete-image-btn');
                    
                    if (editBtn) {
                      editBtn.onclick = () => {
                        editor.windowManager.close();
                        setTimeout(() => {
                          editor.execCommand('customimage');
                        }, 100);
                      };
                    }
                    
                    if (deleteBtn) {
                      deleteBtn.onclick = () => {
                        editor.windowManager.close();
                        setTimeout(() => {
                          if (confirm('Are you sure you want to delete this image?')) {
                            editor.dom.remove(e.target);
                            editor.fire('change');
                            editor.fire('input');
                            const newContent = editor.getContent();
                            setContent(newContent);
                          }
                        }, 100);
                      };
                    }
                  }, 100);
                }
              });

              // Add visual feedback when image is selected
              editor.on('NodeChange', (e: TinyMCEEvent) => {
                // Remove selection class from all images first
                const allImages = editor.dom.select('img');
                allImages.forEach((img: HTMLElement) => {
                  editor.dom.removeClass(img, 'mce-img-selected');
                });
                
                // Add selection class to current image
                if (e.element && e.element.tagName === 'IMG') {
                  editor.dom.addClass(e.element, 'mce-img-selected');
                }
              });

              // Handle keyboard delete for images
              editor.on('keydown', (e: TinyMCEEvent) => {
                if (e.keyCode === 46 || e.keyCode === 8) { // Delete or Backspace
                  const selectedNode = editor.selection.getNode();
                  if (selectedNode && selectedNode.tagName === 'IMG') {
                    e.preventDefault();
                    if (confirm('Are you sure you want to delete this image?')) {
                      editor.dom.remove(selectedNode);
                      editor.fire('change');
                      editor.fire('input');
                      const newContent = editor.getContent();
                      setContent(newContent);
                    }
                  }
                }
              });

              // Ensure content state is updated on any change
              editor.on('change input undo redo', () => {
                const newContent = editor.getContent();
                setContent(newContent);
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