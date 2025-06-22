import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File too large. Maximum size is 5MB.' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const timestamp = Date.now();
    const originalExtension = path.extname(file.name);
    const filename = `${timestamp}${originalExtension}`;

    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (mkdirError) {
      // Directory might already exist, which is fine
      console.log('Directory creation note:', mkdirError);
    }

    // Write file to uploads directory
    const filepath = path.join(uploadsDir, filename);
    await writeFile(filepath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/${filename}`;
    
    return NextResponse.json({
      success: true,
      location: publicUrl,
      filename: filename
    });

  } catch (error: unknown) {
    console.error('Upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: 'Upload failed: ' + errorMessage },
      { status: 500 }
    );
  }
}

// Optional: Add GET method to list uploaded files
export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    
    try {
      const files = await readdir(uploadsDir);
      const fileList = files.map((file: string) => ({
        name: file,
        url: `/uploads/${file}`
      }));
      
      return NextResponse.json({
        success: true,
        files: fileList
      });
    } catch {
      // Directory doesn't exist or is empty
      return NextResponse.json({
        success: true,
        files: []
      });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}