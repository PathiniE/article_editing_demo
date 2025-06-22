import mongoose from 'mongoose';

export interface IArticle {
  _id?: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    maxlength: [200, 'Title cannot be more than 200 characters'],
  },
  content: {
    type: String,
    required: [true, 'Please provide content'],
  },
}, {
  timestamps: true,
});

export default mongoose.models.Article || mongoose.model('Article', ArticleSchema);