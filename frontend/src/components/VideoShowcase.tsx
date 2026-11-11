import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Facebook, Film, Instagram, Play, X, Youtube } from 'lucide-react';
import { Video, mediaUrl, videosApi } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const PLATFORM_LABEL: Record<Video['platform'], string> = {
  file: '', direct: '', youtube: 'YouTube', vimeo: 'Vimeo', instagram: 'Instagram', tiktok: 'TikTok', facebook: 'Facebook',
};
const PLATFORM_ICON: Partial<Record<Video['platform'], typeof Play>> = { youtube: Youtube, instagram: Instagram, facebook: Facebook };

const playable = (v: Video) => (v.src ? mediaUrl(v.src) : '');

/** Card picture: the cover image, the video's own first frame, or a branded placeholder. */
const Cover = ({ video, hovering }: { video: Video; hovering: boolean }) => {
  const ref = useRef<HTMLVideoElement>(null);
  const src = playable(video);

  // Uploaded reels preview silently on hover (desktop)
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (hovering) el.play().catch(() => undefined);
    else el.pause();
  }, [hovering]);

  if (src && !video.thumbnail) {
    return <video ref={ref} src={`${src}#t=0.1`} muted loop playsInline preload="metadata" className="absolute inset-0 h-full w-full object-cover" aria-hidden />;
  }
  if (video.thumbnail) {
    return (
      <>
        <img src={mediaUrl(video.thumbnail)} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
        {src && <video ref={ref} src={src} muted loop playsInline preload="none" className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${hovering ? 'opacity-100' : 'opacity-0'}`} aria-hidden />}
      </>
    );
  }
  const Icon = PLATFORM_ICON[video.platform] ?? Film;
  return (
    <span className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[rgba(var(--accent-rgb),0.85)] via-rose-500/70 to-orange-400/70">
      <Icon className="h-14 w-14 text-white/35" />
    </span>
  );
};

const VideoCard = ({ video, title, caption, onOpen, className = '' }: { video: Video; title: string; caption: string; onOpen: () => void; className?: string }) => {
  const [hovering, setHovering] = useState(false);
  const label = PLATFORM_LABEL[video.platform];
  return (
    <button
      type="button"
      onClick={onOpen}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className={`group relative overflow-hidden rounded-3xl bg-black text-start shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)] ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent-rgb))] ${className}`}
      aria-label={`${title} — play`}
    >
      <Cover video={video} hovering={hovering} />
      <span className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
      {label && (
        <span className="absolute top-3 start-3 rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur ltr">{label}</span>
      )}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-[rgb(var(--accent-rgb))] shadow-lg transition-transform duration-300 group-hover:scale-110">
          <Play className="h-6 w-6 translate-x-0.5 fill-current" />
        </span>
      </span>
      <span className="absolute inset-x-0 bottom-0 p-4">
        <span className="block font-semibold leading-snug text-white line-clamp-2" dir="auto">{title}</span>
        {caption && <span className="mt-1 block text-xs text-white/75 line-clamp-2" dir="auto">{caption}</span>}
      </span>
    </button>
  );
};

/** Home-page section: reels in a swipeable strip, videos in a grid, each opening in a player. Hidden when there are none. */
const VideoShowcase = () => {
  const { tr, lang } = useLanguage();
  const [videos, setVideos] = useState<Video[]>([]);
  const [active, setActive] = useState<number | null>(null);
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reels first, then videos — the same order as on the page, so the player's next / previous follow it
    videosApi
      .getVideos()
      .then(r => setVideos([...r.results.filter(v => v.format === 'reel'), ...r.results.filter(v => v.format !== 'reel')]))
      .catch(() => setVideos([]));
  }, []);

  const playing = active === null ? null : videos[active];

  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(null);
      if (e.key === 'ArrowRight') setActive(i => (i === null ? i : (i + 1) % videos.length));
      if (e.key === 'ArrowLeft') setActive(i => (i === null ? i : (i - 1 + videos.length) % videos.length));
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, [playing, videos.length]);

  if (videos.length === 0) return null;

  const titleOf = (v: Video) => (lang === 'ar' && v.title_ar) || v.title;
  const captionOf = (v: Video) => (lang === 'ar' && v.caption_ar) || v.caption;
  const reels = videos.filter(v => v.format === 'reel');
  const wide = videos.filter(v => v.format !== 'reel');
  const open = (v: Video) => setActive(videos.indexOf(v));
  const scrollStrip = (dir: 1 | -1) => {
    const el = strip.current;
    if (!el) return;
    el.scrollBy({ left: dir * (lang === 'ar' ? -1 : 1) * el.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section className="pb-24" aria-labelledby="videos-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 reveal">
          <div className="eyebrow glass-effect mb-5"><Film className="h-4 w-4" />{tr('Videos & Reels', 'فيديوهات وريلز')}</div>
          <h2 id="videos-title" className="text-3xl md:text-5xl font-bold text-fg mb-4">{tr('Watch Us in Action', 'شاهدنا أثناء العمل')}</h2>
          <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed">
            {tr('Our classes, projects and events — in short videos and reels.', 'دوراتنا ومشاريعنا وفعالياتنا في فيديوهات وريلز قصيرة.')}
          </p>
        </div>

        {reels.length > 0 && (
          <div className="relative reveal">
            <div
              ref={strip}
              className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto snap-x snap-mandatory pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {/* w-max + mx-auto: centred while they fit, scrollable from the start once they don't */}
              <div className="flex w-max mx-auto gap-4 md:gap-5">
              {reels.map(v => (
                <VideoCard
                  key={v.id}
                  video={v}
                  title={titleOf(v)}
                  caption={captionOf(v)}
                  onOpen={() => open(v)}
                  className="snap-start shrink-0 w-[62vw] max-w-[250px] sm:w-[230px] aspect-[9/16]"
                />
              ))}
              </div>
            </div>
            {reels.length > 4 && (
              <div className="hidden md:flex justify-end gap-2 mt-3">
                <button type="button" onClick={() => scrollStrip(-1)} className="glass-effect rounded-full p-2.5 text-fg hover:text-accent" aria-label={tr('Previous', 'السابق')}>
                  <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
                </button>
                <button type="button" onClick={() => scrollStrip(1)} className="glass-effect rounded-full p-2.5 text-fg hover:text-accent" aria-label={tr('Next', 'التالي')}>
                  <ChevronRight className="h-5 w-5 rtl:rotate-180" />
                </button>
              </div>
            )}
          </div>
        )}

        {wide.length > 0 && (
          <div className={`flex flex-wrap justify-center gap-5 reveal ${reels.length > 0 ? 'mt-8' : ''}`}>
            {wide.map(v => (
              <VideoCard key={v.id} video={v} title={titleOf(v)} caption={captionOf(v)} onOpen={() => open(v)} className="w-full sm:w-[calc(50%-0.625rem)] lg:w-[calc(33.333%-0.84rem)] aspect-video" />
            ))}
          </div>
        )}
      </div>

      {/* Player */}
      {playing && (
        <div
          className="fixed inset-0 z-[60] flex flex-col items-center justify-center gap-3 bg-black/85 p-3 sm:p-6 backdrop-blur-sm"
          onClick={() => setActive(null)}
          role="dialog"
          aria-modal="true"
          aria-label={titleOf(playing)}
        >
          <button type="button" onClick={() => setActive(null)} className="absolute top-3 end-3 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20" aria-label={tr('Close', 'إغلاق')}>
            <X className="h-6 w-6" />
          </button>
          {videos.length > 1 && (
            <>
              <button type="button" onClick={e => { e.stopPropagation(); setActive((active! - 1 + videos.length) % videos.length); }} className="absolute start-2 sm:start-5 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20" aria-label={tr('Previous', 'السابق')}>
                <ChevronLeft className="h-6 w-6 rtl:rotate-180" />
              </button>
              <button type="button" onClick={e => { e.stopPropagation(); setActive((active! + 1) % videos.length); }} className="absolute end-2 sm:end-5 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/20" aria-label={tr('Next', 'التالي')}>
                <ChevronRight className="h-6 w-6 rtl:rotate-180" />
              </button>
            </>
          )}
          <div
            onClick={e => e.stopPropagation()}
            className={`overflow-hidden rounded-2xl bg-black shadow-2xl ${
              playing.format === 'reel' ? 'w-[min(calc(100vw-6rem),calc(min(80vh,820px)*0.5625))] aspect-[9/16]' : 'w-full max-w-5xl aspect-video'
            }`}
          >
            {playable(playing) ? (
              <video key={playing.id} src={playable(playing)} poster={playing.thumbnail ? mediaUrl(playing.thumbnail) : undefined} controls autoPlay playsInline className="h-full w-full bg-black object-contain" />
            ) : (
              <iframe
                key={playing.id}
                src={playing.embed_url}
                title={titleOf(playing)}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen; clipboard-write"
                allowFullScreen
                className="h-full w-full border-0 bg-black"
              />
            )}
          </div>
          <div onClick={e => e.stopPropagation()} className="max-w-2xl text-center text-white">
            <div className="font-semibold" dir="auto">{titleOf(playing)}</div>
            {captionOf(playing) && <div className="text-sm text-white/70" dir="auto">{captionOf(playing)}</div>}
          </div>
        </div>
      )}
    </section>
  );
};

export default VideoShowcase;
