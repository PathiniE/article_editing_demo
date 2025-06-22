import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Article from '../../lib/models/Article';

export async function GET() {
  try {
    await dbConnect();
    const articles = await Article.find({}).sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, data: articles });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('GET /api/articles error:', error); 
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/articles called'); 
    await dbConnect();
    const body = await request.json();
    console.log('Request body:', body); 
    
    // Validate required fields
    if (!body.title || !body.title.trim()) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }
    
    if (!body.content || !body.content.trim()) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }
    
    const article = await Article.create(body);
    console.log('Article created successfully:', article._id); // Debug log
    return NextResponse.json(
      { success: true, data: article },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('POST /api/articles error:', error); // Debug log
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 400 }
    );
  }
}