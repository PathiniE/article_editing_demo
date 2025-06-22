import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Article from '../../lib/models/Article';

export async function GET() {
  await dbConnect();

  try {
    const articles = await Article.find({}).sort({ updatedAt: -1 });
    return NextResponse.json({ success: true, data: articles });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}

export async function POST(request: NextRequest) {
  await dbConnect();

  try {
    const body = await request.json();
    const article = await Article.create(body);
    return NextResponse.json(
      { success: true, data: article },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}