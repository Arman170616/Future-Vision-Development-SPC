import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Tag, Clock, Share2, Heart, MessageCircle } from 'lucide-react';
import { blogApi, BlogPost } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const BlogDetails = () => {
  const { tr, tt, fmtDate } = useLanguage();
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const postData = await blogApi.getPost(slug);
        setPost(postData);
        setError(null);
      } catch (err) {
        setError(tr('Failed to fetch blog post', 'تعذّر تحميل المقال'));
        console.error('Error fetching blog post:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Fallback static data
  const fallbackPost = {
    id: 1,
    title: 'The Future of AI in Business: Transforming Industries',
    slug: 'future-ai-business-transforming-industries',
    content: `
      <p>Artificial Intelligence is no longer a futuristic concept—it's here, and it's revolutionizing how businesses operate across every industry. From healthcare to finance, retail to manufacturing, AI is driving unprecedented levels of efficiency, innovation, and growth.</p>
      
      <h2>The Current State of AI Adoption</h2>
      <p>Today's businesses are leveraging AI in ways that were unimaginable just a decade ago. Machine learning algorithms are predicting customer behavior, natural language processing is enhancing customer service, and computer vision is revolutionizing quality control in manufacturing.</p>
      
      <h2>Key Areas of Impact</h2>
      <h3>1. Customer Experience</h3>
      <p>AI-powered chatbots and recommendation engines are creating personalized experiences that delight customers and drive loyalty. Companies using AI for customer service report 30% higher satisfaction rates.</p>
      
      <h3>2. Operational Efficiency</h3>
      <p>Predictive maintenance, supply chain optimization, and automated workflows are reducing costs and improving productivity across industries.</p>
      
      <h3>3. Data-Driven Decision Making</h3>
      <p>Advanced analytics and machine learning models are enabling businesses to make informed decisions based on real-time insights rather than intuition.</p>
      
      <h2>Challenges and Considerations</h2>
      <p>While the benefits are clear, implementing AI comes with challenges including data privacy concerns, the need for skilled talent, and ensuring ethical AI practices.</p>
      
      <h2>Looking Ahead</h2>
      <p>The future of AI in business is bright. As technology continues to evolve, we can expect even more sophisticated applications that will further transform how we work and serve customers.</p>
    `,
    excerpt: 'Explore how artificial intelligence is revolutionizing business operations across industries and what the future holds for AI adoption.',
    author: 'Dr. Sarah Johnson',
    published_at: '2024-03-15T10:00:00Z',
    category: 'Technology',
    tags: ['AI', 'Business', 'Innovation', 'Future Tech'],
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1200',
    featured: true,
    read_time: 8
  };

  const displayPost = post || fallbackPost;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-300 mx-auto"></div>
          <p className="text-blue-100 mt-4">{tr('Loading blog post...', 'جارٍ تحميل المقال...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-300 text-lg">{error}</p>
          <p className="text-blue-100 mt-2">{tr('Using fallback data...', 'يتم عرض بيانات احتياطية...')}</p>
        </div>
      </div>
    );
  }

  if (!displayPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{tr('Blog Post Not Found', 'المقال غير موجود')}</h1>
          <p className="text-blue-200 mb-8">{tr("The blog post you're looking for doesn't exist.", 'المقال الذي تبحث عنه غير موجود.')}</p>
          <Link
            to="/blog"
            className="inline-flex items-center text-blue-300 hover:text-blue-200 transition-colors duration-200"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            {tr('Back to Blog', 'العودة إلى المدونة')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center text-blue-300 hover:text-blue-200 mb-8 transition-colors duration-200 animate-slide-in"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          {tr('Back to Blog', 'العودة إلى المدونة')}
        </Link>

        {/* Article Header */}
        <article className="glass-effect-strong rounded-2xl overflow-hidden animate-slide-in">
          {/* Hero Image */}
          <div className="relative h-96">
            <img
              src={displayPost.image}
              alt={displayPost.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          </div>

          {/* Article Content */}
          <div className="p-8">
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-blue-200 mb-6">
              <span className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {fmtDate(displayPost.published_at)}
              </span>
              <span className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {displayPost.author}
              </span>
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {tt(`${displayPost.read_time || 5} min read`)}
              </span>
              <span className="bg-blue-500/30 text-blue-200 px-2 py-1 rounded">
                {tt(typeof displayPost.category === 'string' ? displayPost.category : displayPost.category?.name)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{displayPost.title}</h1>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {displayPost.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center bg-blue-500/20 text-blue-200 px-3 py-1 rounded-full text-sm border border-blue-400/30"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {typeof tag === 'string' ? tag : tag.name}
                </span>
              ))}
            </div>

            {/* Content */}
            <div 
              className="prose prose-lg prose-invert max-w-none text-blue-100"
              dangerouslySetInnerHTML={{ __html: displayPost.content }}
            />

            {/* Social Actions */}
            <div className="flex items-center justify-between pt-8 mt-8 border-t border-blue-400/30">
              <div className="flex items-center space-x-4">
                <button className="flex items-center text-blue-300 hover:text-blue-200 transition-colors duration-200">
                  <Heart className="h-5 w-5 mr-2" />
                  {tr('Like', 'إعجاب')}
                </button>
                <button className="flex items-center text-blue-300 hover:text-blue-200 transition-colors duration-200">
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {tr('Comment', 'تعليق')}
                </button>
              </div>
              <button className="flex items-center text-blue-300 hover:text-blue-200 transition-colors duration-200">
                <Share2 className="h-5 w-5 mr-2" />
                {tr('Share', 'مشاركة')}
              </button>
            </div>
          </div>
        </article>

        {/* Author Bio */}
        <div className="glass-effect-strong rounded-xl p-6 mt-8 animate-float">
          <h3 className="text-xl font-bold text-white mb-4">{tr('About the Author', 'عن الكاتب')}</h3>
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 shrink-0 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {displayPost.author.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h4 className="font-semibold text-white">{displayPost.author}</h4>
              <p className="text-blue-200 text-sm mt-1">
                {tr('Technology expert and thought leader with over 10 years of experience in AI and digital transformation.', 'خبير تقني وصاحب رؤية بخبرة تتجاوز 10 سنوات في الذكاء الاصطناعي والتحول الرقمي.')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetails;
