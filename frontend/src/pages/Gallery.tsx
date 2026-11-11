import { useState, useEffect } from 'react';
import { galleryApi, GalleryItem, GalleryStats } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const PlayBadge = ({ size = 'w-6 h-6' }: { size?: string }) => (
  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
    <div className="glass-effect-strong rounded-full p-3">
      <svg className={`${size} text-white`} fill="currentColor" viewBox="0 0 20 20">
        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
      </svg>
    </div>
  </div>
);

const Gallery = () => {
  const { tr, tt, fmtDate } = useLanguage();
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<GalleryItem[]>([]);
  const [stats, setStats] = useState<GalleryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'photos' | 'videos' | 'featured'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchGalleryData();
  }, [activeFilter, selectedCategory]);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [galleryResponse, featuredResponse, statsResponse] = await Promise.all([
        activeFilter === 'featured'
          ? galleryApi.getFeaturedGallery()
          : activeFilter === 'photos'
          ? galleryApi.getPhotos(selectedCategory !== 'all' ? { category: selectedCategory } : {})
          : activeFilter === 'videos'
          ? galleryApi.getVideos(selectedCategory !== 'all' ? { category: selectedCategory } : {})
          : galleryApi.getGallery(selectedCategory !== 'all' ? { category: selectedCategory } : {}),
        galleryApi.getFeaturedGallery(),
        galleryApi.getGalleryStats()
      ]);

      setGalleryItems(galleryResponse?.results || []);
      setFeaturedItems(featuredResponse?.results?.slice(0, 4) || []); // Show top 4 featured
      setStats(statsResponse || null);
    } catch (err) {
      console.error('Error fetching gallery data:', err);
      setError(tr('Failed to load gallery. Please try again later.', 'تعذّر تحميل المعرض. يرجى المحاولة لاحقاً.'));
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item: GalleryItem) => {
    setSelectedItem(item);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setSelectedItem(null);
    document.body.style.overflow = 'unset';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-300 mx-auto"></div>
          <p className="text-blue-100 mt-4">{tr('Loading gallery...', 'جارٍ تحميل المعرض...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center glass-effect-strong rounded-xl p-8">
          <div className="text-xl mb-4">⚠️</div>
          <p className="text-blue-100 mb-4">{error}</p>
          <button
            onClick={fetchGalleryData}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            {tr('Try Again', 'حاول مرة أخرى')}
          </button>
        </div>
      </div>
    );
  }

  const filters = [
    { key: 'all', label: tr('All Items', 'الكل') },
    { key: 'photos', label: tr('Photos', 'الصور') },
    { key: 'videos', label: tr('Videos', 'الفيديو') },
    { key: 'featured', label: tr('Featured', 'المميزة') }
  ];

  const detailRow = (label: string, value: string) => (
    <div>
      <span className="font-medium text-white">{label}</span>
      <span className="ms-2 text-blue-200">{value}</span>
    </div>
  );

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 animate-slide-in">{tr('Gallery', 'المعرض')}</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto animate-slide-in">
            {tr(
              'Explore our moments, memories, and milestones through photos and videos from our activities, events, and achievements.',
              'استكشف لحظاتنا وذكرياتنا ومحطاتنا عبر الصور ومقاطع الفيديو من أنشطتنا وفعالياتنا وإنجازاتنا.'
            )}
          </p>
        </div>

        {/* Stats Section */}
        {stats && (
          <div className="glass-effect-strong rounded-2xl py-8 px-6 mb-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-300">{stats.total_items || 0}</div>
                <div className="text-blue-100">{tr('Total Items', 'إجمالي العناصر')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-300">{stats.photos || 0}</div>
                <div className="text-blue-100">{tr('Photos', 'الصور')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-300">{stats.videos || 0}</div>
                <div className="text-blue-100">{tr('Videos', 'الفيديو')}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-300">{stats.featured_items || 0}</div>
                <div className="text-blue-100">{tr('Featured', 'المميزة')}</div>
              </div>
            </div>
          </div>
        )}

        {/* Featured Section */}
        {featuredItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white text-center mb-8">{tr('Featured Highlights', 'أبرز اللقطات')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl glass-effect cursor-pointer hover:-translate-y-1 transition-all duration-300"
                  onClick={() => openModal(item)}
                >
                  <div className="relative">
                    <img
                      src={item.media_type === 'photo' ? (item.thumbnail_url || item.image_url || item.display_url) : (item.thumbnail_url || item.display_url)}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                    {item.media_type !== 'photo' && <PlayBadge />}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 inset-x-0 p-4">
                      <h3 className="on-media font-semibold text-sm mb-1">{item.title}</h3>
                      <p className="text-gray-200 text-xs capitalize">{tt(item.category)}</p>
                    </div>
                  </div>
                  <div className="absolute top-2 end-2">
                    <span className="bg-black/50 text-amber-200 backdrop-blur text-xs px-2 py-1 rounded-full">
                      ⭐ {tr('Featured', 'مميز')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="glass-effect-strong rounded-2xl p-4 mb-10 sticky top-24 z-10">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Media Type Filter */}
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setActiveFilter(filter.key as typeof activeFilter)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    activeFilter === filter.key
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-100 hover:bg-blue-500/20'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            {stats && stats.categories && stats.categories.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-blue-100">{tr('Category:', 'الفئة:')}</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 bg-blue-900/30 border border-blue-400/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="all">{tr('All Categories', 'جميع الفئات')}</option>
                  {stats.categories.map((category) => (
                    <option key={category} value={category}>
                      {tt(category.charAt(0).toUpperCase() + category.slice(1))}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        {galleryItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-xl font-semibold text-white mb-2">{tr('No items found', 'لا توجد عناصر')}</h3>
            <p className="text-blue-200">{tr('Try adjusting your filters or check back later.', 'جرّب تعديل عوامل التصفية أو عُد لاحقاً.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {galleryItems.map((item) => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-2xl glass-effect-strong cursor-pointer hover:-translate-y-1 transition-all duration-300"
                onClick={() => openModal(item)}
              >
                <div className="relative">
                  <img
                    src={item.media_type === 'photo' ? (item.thumbnail_url || item.image_url || item.display_url) : (item.thumbnail_url || item.display_url)}
                    alt={item.title}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {item.media_type !== 'photo' && <PlayBadge size="w-8 h-8" />}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-white mb-1 group-hover:text-blue-300 transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-sm text-blue-200">
                    <span className="capitalize">{tt(item.category)}</span>
                    {item.taken_date && <span>{fmtDate(item.taken_date)}</span>}
                  </div>
                  {item.location && (
                    <p className="text-xs text-blue-300 mt-1">📍 {item.location}</p>
                  )}
                </div>

                {item.is_featured && (
                  <div className="absolute top-2 end-2">
                    <span className="bg-black/50 text-amber-200 backdrop-blur text-xs px-2 py-1 rounded-full">⭐</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <div className="relative max-w-6xl w-full max-h-full" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={closeModal}
              aria-label={tr('Close', 'إغلاق')}
              className="absolute top-4 end-4 z-10 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Media content */}
            <div className="glass-effect-strong rounded-2xl overflow-hidden">
              {selectedItem.media_type === 'photo' ? (
                <img
                  src={selectedItem.image_url || selectedItem.display_url}
                  alt={selectedItem.title}
                  className="w-full max-h-[70vh] object-contain bg-black/40"
                  onError={(e) => {
                    console.error('Failed to load image:', selectedItem.image_url || selectedItem.display_url, e);
                  }}
                />
              ) : (
                <div className="relative">
                  <video
                    src={selectedItem.video_url}
                    controls
                    className="w-full max-h-[70vh] bg-black"
                    poster={selectedItem.thumbnail_url || selectedItem.display_url}
                    onError={(e) => {
                      console.error('Failed to load video:', selectedItem.video_url, e);
                    }}
                  >
                    <source src={selectedItem.video_url} type="video/mp4" />
                    <p className="p-4 text-center text-blue-200">
                      {tr('Your browser does not support the video tag or the video file is not accessible.', 'متصفحك لا يدعم تشغيل الفيديو أو أن الملف غير متاح.')}
                      <br />
                      <a
                        href={selectedItem.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-300 hover:underline"
                      >
                        {tr('Try opening the video in a new tab', 'جرّب فتح الفيديو في علامة تبويب جديدة')}
                      </a>
                    </p>
                  </video>
                </div>
              )}

              {/* Details */}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-2">{selectedItem.title}</h2>
                {selectedItem.description && (
                  <p className="text-blue-100 mb-4">{selectedItem.description}</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {detailRow(tr('Category:', 'الفئة:'), tt(selectedItem.category))}
                  {selectedItem.taken_date && detailRow(tr('Date:', 'التاريخ:'), fmtDate(selectedItem.taken_date))}
                  {selectedItem.photographer && detailRow(tr('Photographer:', 'المصوّر:'), selectedItem.photographer)}
                  {selectedItem.location && detailRow(tr('Location:', 'الموقع:'), selectedItem.location)}
                  {selectedItem.activity_title && detailRow(tr('Related Activity:', 'النشاط المرتبط:'), selectedItem.activity_title)}
                  {(selectedItem.upcoming_event_title || selectedItem.event_title) &&
                    detailRow(tr('Related Event:', 'الفعالية المرتبطة:'), (selectedItem.upcoming_event_title || selectedItem.event_title) as string)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Gallery;
