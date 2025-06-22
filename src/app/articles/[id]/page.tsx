import Link from 'next/link';
import ArticleView from '../../components/ArticleView';
import { IArticle } from '../../lib/models/Article';
import dbConnect from '../../lib/mongodb';
import Article from '../../lib/models/Article';
import { notFound } from 'next/navigation';

async function getArticle(id: string): Promise<IArticle | null> {
  await dbConnect();

  try {
    const article = await Article.findById(id).lean();
    if (!article) {
      return null;
    }
    return JSON.parse(JSON.stringify(article));
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);
  
  if (!article) {
    return {
      title: 'Article Not Found'
    };
  }

  return {
    title: `${article.title} - TinyMCE Demo`,
    description: article.title,
  };
}

export default async function ArticlePage({ params }: { params: { id: string } }) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            ← Back to Articles
          </Link>
        </div>
        
        <ArticleView article={article} />
      </div>
    </main>
  );
}