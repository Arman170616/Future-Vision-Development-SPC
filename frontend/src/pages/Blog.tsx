import { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Calendar, User, Clock, Tag, ArrowRight, Search, ChevronDown, Newspaper, Star, BookOpen, Link2, Check } from 'lucide-react';
import { blogApi, BlogPost, BlogCategory } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import RichText from '../components/RichText';

/** One row of the list: API posts and the static fallback mapped to the same shape. */
interface PostRow {
  key: string;
  title: string;
  excerpt: string;
  content?: string;
  author: string;
  category: string;
  date?: string;
  readTime: string;
  image: string;
  tags: string[];
  featured: boolean;
}

// Shown only when the API has no posts
const fallbackPosts: PostRow[] = [
  {
    key: 'the-future-of-ai-in-software-development',
    title: 'The Future of AI in Software Development',
    excerpt: 'Exploring how artificial intelligence is revolutionizing the way we build and maintain software applications.',
    content: 'Artificial Intelligence is transforming software development in unprecedented ways...',
    author: 'Dr. Sarah Johnson',
    date: '2024-03-20',
    readTime: '8 min read',
    category: 'Technology',
    tags: ['AI', 'Software Development', 'Innovation'],
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: true,
  },
  {
    key: 'building-sustainable-tech-solutions',
    title: 'Building Sustainable Tech Solutions',
    excerpt: 'How we can create technology that not only solves problems but also protects our environment.',
    content: 'Sustainability in technology is no longer optional...',
    author: 'Michael Chen',
    date: '2024-03-15',
    readTime: '6 min read',
    category: 'Sustainability',
    tags: ['Green Tech', 'Environment', 'Innovation'],
    image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: false,
  },
  {
    key: 'remote-work-lessons-from-the-digital-transformation',
    title: 'Remote Work: Lessons from the Digital Transformation',
    excerpt: "Key insights and best practices we've learned from the global shift to remote work.",
    content: 'The pandemic accelerated digital transformation...',
    author: 'Emily Rodriguez',
    date: '2024-03-10',
    readTime: '5 min read',
    category: 'Business',
    tags: ['Remote Work', 'Digital Transformation', 'Productivity'],
    image: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=800',
    featured: false,
  },
];

const toRow = (post: BlogPost): PostRow => ({
  key: post.slug || String(post.id),
  title: post.title,
  excerpt: post.excerpt,
  author: post.author,
  category: post.category_name || '',
  date: post.published_at || post.created_at,
  // "6 min read", "5 min" or just "5" → "N min read"
  readTime: /read/i.test(post.read_time ?? '') ? post.read_time : post.read_time ? `${String(post.read_time).replace(/\s*min\s*$/i, '')} min read` : '',
  image: post.image,
  tags: post.tags ?? [],
  featured: post.featured,
});

/** Post bodies may be HTML (as on the full article page) or plain text with light markdown. */
const looksLikeHtml = (text: string) => /<(p|br|h[1-6]|ul|ol|li|strong|em|a|div|img)\b[^>]*>/i.test(text);

type ContentState = { loading: boolean; content?: string; failed?: boolean };

const Blog = () => {
  const { tr, tt, fmtDate } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState<Record<string, ContentState>>({});
  const [copied, setCopied] = useState<string | null>(null);

  // The open article lives in the URL (?post=slug) so it can be linked to directly
  const openKey = searchParams.get('post');
  const itemRefs = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [postsResponse, categoriesResponse] = await Promise.all([blogApi.getPosts(), blogApi.getCategories()]);
        setBlogPosts(postsResponse.results);
        setCategories(categoriesResponse.results);
      } catch (err) {
        console.error('Error fetching blog data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const fromApi = blogPosts.length > 0;
  const rows = fromApi ? blogPosts.map(toRow) : ([] as typeof fallbackPosts);
  // Featured articles first, then newest
  const sorted = [...rows].sort((a, b) => Number(b.featured) - Number(a.featured) || String(b.date ?? '').localeCompare(String(a.date ?? '')));
  const displayCategories = categories.length > 0 ? ['All', ...categories.map(cat => cat.name)] : ['All', ...new Set(rows.map(r => r.category).filter(Boolean))];

  const filteredPosts = sorted.filter(post => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = !q || [post.title, post.excerpt, post.author, ...post.tags].some(v => v?.toLowerCase().includes(q));
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Load the article body when a post is opened (the list API only carries the excerpt)
  useEffect(() => {
    if (!openKey || !fromApi || contents[openKey]) return;
    setContents(prev => ({ ...prev, [openKey]: { loading: true } }));
    blogApi
      .getPost(openKey)
      .then(post => setContents(prev => ({ ...prev, [openKey]: { loading: false, content: post.content ?? '' } })))
      .catch(() => setContents(prev => ({ ...prev, [openKey]: { loading: false, failed: true } })));
  }, [openKey, fromApi]); // eslint-disable-line react-hooks/exhaustive-deps

  // Bring a deep-linked article into view once the list has rendered
  useEffect(() => {
    if (!loading && openKey) {
      itemRefs.current[openKey]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (key: string) => {
    setSearchParams(openKey === key ? {} : { post: key }, { replace: true });
  };

  const copyLink = async (key: string) => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/blog/${key}`);
      setCopied(key);
      setTimeout(() => setCopied(c => (c === key ? null : c)), 2000);
    } catch {
      /* clipboard blocked: the full-article link is right beside it */
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-300 mx-auto"></div>
          <p className="text-blue-100 mt-4 text-lg">{tr('Loading blog posts...', 'جارٍ تحميل المقالات...')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-16 pb-12 text-center">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="eyebrow glass-effect mb-6 animate-slide-in">
            <Newspaper className="h-4 w-4" />
            {tr('Blog', 'المدونة')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 animate-slide-in">
            {tr('Blog & ', 'المدونة و')}<span className="text-gradient">{tr('Insights', 'الرؤى')}</span>
          </h1>
          <p className="text-lg md:text-xl text-blue-200 max-w-3xl mx-auto leading-relaxed">
            {tr('News, guides and insights on insurance claims, loss adjusting, risk management and marine surveys from our team.', 'أخبار وأدلة ورؤى حول مطالبات التأمين وتسوية الخسائر وإدارة المخاطر والمعاينات البحرية من فريقنا.')}
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
        <div className="glass-effect-strong rounded-2xl p-4 md:p-5 flex flex-col lg:flex-row gap-3 lg:items-center">
          <div className="relative flex-1 lg:max-w-sm">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-blue-300 h-5 w-5" />
            <input
              type="text"
              placeholder={tr('Search articles...', 'ابحث في المقالات...')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full ps-10 pe-4 py-3 bg-blue-900/30 border border-blue-400/30 rounded-lg text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end lg:flex-1">
            {displayCategories.map(category => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategory === category ? 'bg-blue-500 text-white' : 'bg-blue-900/30 text-blue-200 hover:bg-blue-500/30'
                }`}
              >
                {category === 'All' ? tr('All', 'الكل') : tt(category)}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles — expand / collapse list, like the courses page */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-blue-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">{tr('No Articles Found', 'لا توجد مقالات')}</h3>
            <p className="text-blue-200">{tr('Try adjusting your search or category.', 'جرّب تعديل البحث أو التصنيف.')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPosts.map(post => {
              const open = openKey === post.key;
              const body = fromApi ? contents[post.key] : { loading: false, content: post.content };
              const panelId = `post-panel-${post.key}`;

              return (
                <article
                  key={post.key}
                  ref={el => { itemRefs.current[post.key] = el; }}
                  className={`glass-effect-strong rounded-2xl overflow-hidden scroll-mt-28 transition-shadow ${open ? 'shadow-2xl' : ''}`}
                >
                  {/* Header (always visible) */}
                  <button
                    type="button"
                    onClick={() => toggle(post.key)}
                    aria-expanded={open}
                    aria-controls={panelId}
                    className="group w-full text-start p-5 md:p-6 flex items-center gap-4 hover:bg-blue-500/10 transition-colors"
                  >
                    <span className="hidden sm:flex w-14 h-14 shrink-0 rounded-2xl items-center justify-center bg-blue-500/20">
                      <Newspaper className="h-7 w-7 text-blue-300" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-lg md:text-xl font-bold text-white" dir="auto">{post.title}</span>
                        {post.featured && (
                          <span className="inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-300 px-2 py-0.5 rounded-full text-xs font-semibold">
                            <Star className="h-3 w-3" />
                            {tr('Featured', 'مميز')}
                          </span>
                        )}
                      </span>
                      <span className="block text-sm text-blue-200 mb-3">
                        {tr('by', 'بقلم')} {post.author}
                      </span>
                      <span className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-blue-200">
                        {post.category && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300">{tt(post.category)}</span>
                        )}
                        {post.date && <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{fmtDate(post.date)}</span>}
                        {post.readTime && <span className="inline-flex items-center gap-1.5"><Clock className="h-4 w-4" />{tt(post.readTime)}</span>}
                      </span>
                    </span>
                    {post.image && (
                      <span
                        aria-hidden
                        className="relative shrink-0 w-16 h-12 sm:w-24 sm:h-[68px] md:w-28 md:h-20 rotate-3 transition-transform duration-500 ease-out group-hover:-rotate-2 group-hover:-translate-y-1 group-hover:scale-105"
                      >
                        <span className="absolute inset-0 translate-x-[5px] translate-y-[4px] rounded-lg bg-white/60 shadow-sm ring-1 ring-black/5" />
                        <img src={post.image} alt="" loading="lazy" className="relative h-full w-full rounded-lg object-cover ring-2 ring-white shadow-[0_10px_22px_-8px_rgba(0,0,0,0.45)]" />
                      </span>
                    )}
                    <ChevronDown className={`h-6 w-6 shrink-0 text-blue-300 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Details (expand / collapse) */}
                  <div
                    id={panelId}
                    role="region"
                    className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
                  >
                    <div className="overflow-hidden" {...(!open && { inert: '' })}>
                      <div className="border-t border-blue-400/20 p-5 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                          <div className={post.image ? 'lg:col-span-3' : 'lg:col-span-5'}>
                            {post.excerpt && <p className="text-lg text-white font-medium leading-relaxed mb-5" dir="auto">{post.excerpt}</p>}

                            {open && body?.loading && (
                              <div className="space-y-3 mb-6" aria-busy="true">
                                {[100, 92, 96, 70].map((w, i) => <div key={i} className="h-3.5 rounded-full bg-blue-500/15 animate-pulse" style={{ width: `${w}%` }} />)}
                              </div>
                            )}
                            {body?.failed && (
                              <p className="text-blue-200 mb-6">{tr('Could not load the article here — open the full article below.', 'تعذّر تحميل المقال هنا — افتح المقال كاملاً من الأسفل.')}</p>
                            )}
                            {body?.content && (
                              looksLikeHtml(body.content) ? (
                                <div className="prose prose-invert max-w-none text-blue-100 mb-6" dir="auto" dangerouslySetInnerHTML={{ __html: body.content }} />
                              ) : (
                                <RichText text={body.content} className="mb-6" />
                              )
                            )}

                            {post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {post.tags.map(tag => (
                                  <span key={tag} className="inline-flex items-center gap-1 text-xs bg-blue-900/50 text-blue-200 px-2.5 py-1 rounded-full">
                                    <Tag className="h-3 w-3" />
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Article picture beside the text */}
                          {post.image && (
                            <aside className="lg:col-span-2 lg:sticky lg:top-28 self-start">
                              <figure className="glass-effect rounded-2xl overflow-hidden">
                                <img src={post.image} alt={post.title} loading="lazy" className="w-full aspect-[4/3] object-cover" />
                                <figcaption className="px-4 py-2.5 text-sm text-blue-100 flex items-center gap-2">
                                  <User className="h-4 w-4 text-blue-300 shrink-0" />
                                  {post.author}
                                </figcaption>
                              </figure>
                            </aside>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-8 pt-6 border-t border-blue-400/20 flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="sm:me-auto text-sm text-blue-200">
                            {post.date && fmtDate(post.date)}
                            {post.date && post.readTime && ' · '}
                            {post.readTime && tt(post.readTime)}
                          </div>
                          <button
                            type="button"
                            onClick={() => copyLink(post.key)}
                            className="inline-flex items-center justify-center gap-2 glass-effect text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-500/20"
                          >
                            {copied === post.key ? <Check className="h-5 w-5 text-green-300" /> : <Link2 className="h-5 w-5 text-blue-300" />}
                            {copied === post.key ? tr('Link copied', 'تم نسخ الرابط') : tr('Copy link', 'نسخ الرابط')}
                          </button>
                          <Link
                            to={`/blog/${post.key}`}
                            className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
                          >
                            {tr('Open full article', 'افتح المقال كاملاً')}
                            <ArrowRight className="h-5 w-5 rtl:rotate-180" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Newsletter Signup */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <div className="glass-effect-strong rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">{tr('Stay Updated', 'ابقَ على اطلاع')}</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            {tr('Subscribe for practical insights on claims, risk and insurance in Oman.', 'اشترك لتصلك رؤى عملية حول المطالبات والمخاطر والتأمين في عُمان.')}
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder={tr('Enter your email', 'أدخل بريدك الإلكتروني')}
              className="flex-1 min-w-0 px-4 py-3 rounded-lg bg-blue-900/30 border border-blue-400/30 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
              {tr('Subscribe', 'اشترك')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Blog;
