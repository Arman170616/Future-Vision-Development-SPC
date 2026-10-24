import { Calendar, Users, Trophy, Heart, Lightbulb, Globe, Camera, Video } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { activitiesApi, Activity, UpcomingEvent, galleryApi, GalleryItem } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

const Activities = () => {
  const { tr, tt, fmtDate } = useLanguage();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'activities' | 'events' | 'gallery'>('activities');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch activities and events first (essential data)
        const [activitiesResponse, eventsResponse] = await Promise.all([
          activitiesApi.getActivities(),
          activitiesApi.getUpcomingEvents()
        ]);

        setActivities(activitiesResponse.results);
        setUpcomingEvents(eventsResponse.results);
        
        // Try to fetch gallery data separately (optional)
        try {
          const galleryResponse = await galleryApi.getFeaturedGallery();
          setGalleryItems(galleryResponse.results.slice(0, 6)); // Show top 6 for preview
        } catch (galleryErr) {
          console.warn('Failed to fetch gallery data, continuing without it:', galleryErr);
          setGalleryItems([]); // Set empty array if gallery fails
        }
        
        setError(null); // Clear any previous errors
      } catch (err) {
        setError(tr('Failed to fetch activities data', 'تعذّر تحميل بيانات الأنشطة'));
        console.error('Error fetching activities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fallback static data for development
  const fallbackActivities = [
    {
      id: 1,
      title: 'Annual Tech Innovation Summit 2024',
      date: 'March 15, 2024',
      type: 'Conference',
      image: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Our flagship event bringing together technology leaders, innovators, and entrepreneurs to discuss the future of tech.',
      participants: '500+',
      highlights: [
        'Keynote speeches from industry leaders',
        'Interactive workshops on emerging technologies',
        'Networking opportunities with tech professionals',
        'Startup pitch competition with $50K prize pool'
      ]
    },
    {
      id: 2,
      title: 'Community Coding Bootcamp',
      date: 'February 20, 2024',
      type: 'Education',
      image: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Free coding bootcamp for local students and professionals looking to upskill in modern web development.',
      participants: '150+',
      highlights: [
        '6-week intensive program',
        'Focus on React, Node.js, and cloud technologies',
        'Mentorship from senior developers',
        'Job placement assistance for graduates'
      ]
    },
    {
      id: 3,
      title: 'Green Tech Initiative Launch',
      date: 'January 10, 2024',
      type: 'Sustainability',
      image: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Launching our commitment to sustainable technology solutions and carbon-neutral operations.',
      participants: '200+',
      highlights: [
        'Partnership with local environmental organizations',
        'Introduction of green coding practices',
        'Solar-powered office infrastructure',
        'Employee sustainability training programs'
      ]
    },
    {
      id: 4,
      title: 'Digital Literacy Program',
      date: 'December 5, 2023',
      type: 'Community Outreach',
      image: 'https://images.pexels.com/photos/1181605/pexels-photo-1181605.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Teaching digital skills to underserved communities, focusing on basic computer literacy and internet safety.',
      participants: '300+',
      highlights: [
        'Free computer classes for seniors',
        'Mobile app development for small businesses',
        'Internet safety workshops for parents',
        'Digital banking and e-commerce training'
      ]
    },
    {
      id: 5,
      title: 'Innovation Lab Opening',
      date: 'November 18, 2023',
      type: 'Facility',
      image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: 'Grand opening of our state-of-the-art innovation lab equipped with the latest technology and development tools.',
      participants: '250+',
      highlights: [
        'VR/AR development stations',
        '3D printing and prototyping equipment',
        'AI and machine learning research lab',
        'Collaborative workspace for startups'
      ]
    },
    {
      id: 6,
      title: 'Hackathon for Good',
      date: 'October 14, 2023',
      type: 'Competition',
      image: 'https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=800',
      description: '48-hour hackathon focused on developing solutions for social and environmental challenges.',
      participants: '120+',
      highlights: [
        'Teams from 20+ universities',
        'Focus on healthcare and education solutions',
        'Mentorship from industry experts',
        'Winning solutions implemented in real projects'
      ]
    }
  ];

  const fallbackUpcomingEvents = [
    {
      title: 'AI & Machine Learning Workshop',
      date: 'April 20, 2024',
      type: 'Workshop',
      description: 'Hands-on workshop covering the latest in AI and ML technologies.'
    },
    {
      title: 'Cybersecurity Awareness Week',
      date: 'May 5-9, 2024',
      type: 'Education',
      description: 'Week-long series of events focused on cybersecurity best practices.'
    },
    {
      title: 'Startup Investor Meetup',
      date: 'June 15, 2024',
      type: 'Networking',
      description: 'Connect local startups with potential investors and mentors.'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'conference':
        return <Users className="h-5 w-5" />;
      case 'education':
        return <Lightbulb className="h-5 w-5" />;
      case 'sustainability':
        return <Globe className="h-5 w-5" />;
      case 'community outreach':
        return <Heart className="h-5 w-5" />;
      case 'competition':
        return <Trophy className="h-5 w-5" />;
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'conference':
        return 'bg-blue-100 text-blue-800';
      case 'education':
        return 'bg-green-100 text-green-800';
      case 'sustainability':
        return 'bg-emerald-100 text-emerald-800';
      case 'community outreach':
        return 'bg-pink-100 text-pink-800';
      case 'competition':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Use API data if available, otherwise fallback to static data
  const displayActivities = activities.length > 0 ? activities : fallbackActivities;
  const displayUpcomingEvents = upcomingEvents.length > 0 ? upcomingEvents : fallbackUpcomingEvents;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-300 mx-auto"></div>
          <p className="text-blue-100 mt-4">{tr('Loading activities...', 'جارٍ تحميل الأنشطة...')}</p>
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

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-slide-in">
            {tr('Our Activities', 'أنشطتنا')}
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto animate-slide-in">
            {tr('Discover the events, initiatives, and community programs that drive our mission to foster innovation and make a positive impact.', 'اكتشف الفعاليات والمبادرات والبرامج المجتمعية التي تقود رسالتنا في تعزيز الابتكار وصناعة أثر إيجابي.')}
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="glass-effect-strong rounded-xl p-1.5 sm:p-2 flex w-full sm:w-auto sm:inline-flex">
            <button
              onClick={() => setActiveTab('activities')}
              className={`flex-1 sm:flex-none justify-center px-2.5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-medium transition-all duration-200 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 min-w-0 text-center leading-tight ${
                activeTab === 'activities'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-blue-100 hover:text-white hover:bg-blue-500/20'
              }`}
            >
              <Trophy className="h-4 w-4" />
              {tr('Recent Activities', 'أحدث الأنشطة')}
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`flex-1 sm:flex-none justify-center px-2.5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-medium transition-all duration-200 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 min-w-0 text-center leading-tight ${
                activeTab === 'events'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-blue-100 hover:text-white hover:bg-blue-500/20'
              }`}
            >
              <Calendar className="h-4 w-4" />
              {tr('Upcoming Events', 'الفعاليات القادمة')}
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`flex-1 sm:flex-none justify-center px-2.5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg font-medium transition-all duration-200 flex flex-col sm:flex-row items-center gap-1 sm:gap-2 min-w-0 text-center leading-tight ${
                activeTab === 'gallery'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-blue-100 hover:text-white hover:bg-blue-500/20'
              }`}
            >
              <Camera className="h-4 w-4" />
              {tr('Gallery', 'المعرض')}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'activities' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              <div className="glass-effect-strong p-6 rounded-xl text-center animate-float">
                <div className="text-3xl font-bold text-blue-300 mb-2">25+</div>
                <div className="text-blue-100">{tr('Events Hosted', 'فعاليات نظّمناها')}</div>
              </div>
              <div className="glass-effect-strong p-6 rounded-xl text-center animate-float" style={{ animationDelay: '1s' }}>
                <div className="text-3xl font-bold text-green-300 mb-2">2000+</div>
                <div className="text-blue-100">{tr('Participants', 'مشارك')}</div>
              </div>
              <div className="glass-effect-strong p-6 rounded-xl text-center animate-float" style={{ animationDelay: '2s' }}>
                <div className="text-3xl font-bold text-purple-300 mb-2">50+</div>
                <div className="text-blue-100">{tr('Partners', 'شريك')}</div>
              </div>
              <div className="glass-effect-strong p-6 rounded-xl text-center animate-float" style={{ animationDelay: '3s' }}>
                <div className="text-3xl font-bold text-orange-300 mb-2">15+</div>
                <div className="text-blue-100">{tr('Countries', 'دولة')}</div>
              </div>
            </div>

            {/* Past Activities */}
            <section className="mb-16">
              <h2 className="text-3xl font-bold text-white mb-8 animate-slide-in">{tr('Recent Activities', 'أحدث الأنشطة')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayActivities.map((activity) => (
                  <div key={activity.id} className="glass-effect-strong rounded-xl overflow-hidden hover:bg-blue-500/20 transition-all duration-300 animate-float">
                    <div className="relative">
                      <img
                        src={activity.image}
                        alt={activity.title}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-4 start-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(activity.type)}`}>
                          {getTypeIcon(activity.type)}
                          <span className="ms-1">{tt(activity.type)}</span>
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-center text-sm text-blue-200 mb-2">
                        <Calendar className="h-4 w-4 mr-2" />
                        {fmtDate(activity.date)}
                        <span className="mx-2">•</span>
                        <Users className="h-4 w-4 mr-2" />
                        <span className="ltr">{activity.participants}</span>&nbsp;{tr('participants', 'مشارك')}
                      </div>

                      <h3 className="text-xl font-bold text-white mb-3">{activity.title}</h3>
                      <p className="text-blue-100 mb-4">{activity.description}</p>

                      <div>
                        <h4 className="font-semibold text-white mb-2">{tr('Key Highlights:', 'أبرز المحطات:')}</h4>
                        <ul className="text-sm text-blue-200 space-y-1">
                          {activity.highlights.slice(0, 3).map((highlight, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-blue-300 mr-2">•</span>
                              {typeof highlight === 'string' ? highlight : highlight.highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'events' && (
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 animate-slide-in">{tr('Upcoming Events', 'الفعاليات القادمة')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayUpcomingEvents.map((event, index) => (
                <div key={index} className="glass-effect-strong p-8 rounded-xl border-s-4 border-blue-400 animate-float hover:bg-blue-500/20 transition-all duration-300">
                  <div className="flex items-center mb-4">
                    <Calendar className="h-6 w-6 text-blue-300 mr-3" />
                    <span className="text-blue-200 font-medium">{fmtDate(event.date)}</span>
                    <span className="ms-auto text-sm bg-blue-500/30 text-blue-200 px-3 py-1 rounded-full">
                      {tt(event.type)}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{event.title}</h3>
                  <p className="text-blue-100">{event.description}</p>
                  <div className="mt-4 pt-4 border-t border-blue-500/20">
                    <button className="text-blue-300 hover:text-white font-medium transition-colors">
                      {tr('Learn More →', 'اعرف المزيد ←')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {displayUpcomingEvents.length === 0 && (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{tr('No Upcoming Events', 'لا توجد فعاليات قادمة')}</h3>
                <p className="text-blue-100">{tr('Check back soon for new events and activities!', 'تابعنا قريباً لمعرفة الفعاليات والأنشطة الجديدة!')}</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'gallery' && (
          <section className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold text-white animate-slide-in">{tr('Gallery Highlights', 'لقطات من المعرض')}</h2>
              <button
                onClick={() => navigate('/gallery')}
                className="text-blue-300 hover:text-white font-medium transition-colors"
              >
                {tr('View Full Gallery →', 'عرض المعرض كاملاً ←')}
              </button>
            </div>
            
            {galleryItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryItems.map((item) => (
                  <div 
                    key={item.id} 
                    className="glass-effect-strong rounded-xl overflow-hidden hover:bg-blue-500/20 transition-all duration-300 animate-float group cursor-pointer"
                    onClick={() => navigate('/gallery')}
                  >
                    <div className="relative">
                      {item.media_type === 'photo' ? (
                        <img
                          src={item.thumbnail_url || item.image_url || item.display_url}
                          alt={item.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="relative">
                          <img
                            src={item.thumbnail_url || item.display_url}
                            alt={item.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                            <div className="bg-white bg-opacity-90 rounded-full p-3">
                              <Video className="w-6 h-6 text-gray-800" />
                            </div>
                          </div>
                        </div>
                      )}
                      {item.is_featured && (
                        <div className="absolute top-3 end-3">
                          <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                            ⭐ {tr('Featured', 'مميز')}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center justify-between text-sm text-blue-200">
                        <span className="capitalize">{tt(item.category)}</span>
                        {item.taken_date && (
                          <span>{fmtDate(item.taken_date)}</span>
                        )}
                      </div>
                      {item.location && (
                        <p className="text-xs text-blue-300 mt-2">📍 {item.location}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Camera className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">{tr('No Gallery Items', 'لا توجد عناصر في المعرض')}</h3>
                <p className="text-blue-100">{tr('Gallery content will be added soon!', 'ستتم إضافة محتوى المعرض قريباً!')}</p>
              </div>
            )}
          </section>
        )}

        {/* Community Impact */}
        <section>
          <div className="glass-effect-strong rounded-2xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">{tr('Making a Difference Together', 'نصنع الفرق معاً')}</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              {tr("Our activities are more than just events – they're opportunities to learn, connect, and create positive change in our community and beyond.", 'أنشطتنا أكثر من مجرد فعاليات؛ إنها فرص للتعلّم والتواصل وإحداث تغيير إيجابي في مجتمعنا وخارجه.')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <Heart className="h-12 w-12 text-pink-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{tr('Community First', 'المجتمع أولاً')}</h3>
                <p className="text-blue-100">{tr('We prioritize giving back to our community through education and outreach programs.', 'نحرص على رد الجميل لمجتمعنا عبر برامج التعليم والتوعية.')}</p>
              </div>
              <div className="text-center">
                <Lightbulb className="h-12 w-12 text-yellow-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{tr('Innovation Hub', 'مركز للابتكار')}</h3>
                <p className="text-blue-100">{tr('Creating spaces where ideas flourish and innovation thrives through collaboration.', 'نصنع مساحات تزدهر فيها الأفكار وينمو فيها الابتكار بالتعاون.')}</p>
              </div>
              <div className="text-center">
                <Globe className="h-12 w-12 text-green-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">{tr('Global Impact', 'أثر عالمي')}</h3>
                <p className="text-blue-100">{tr('Working toward solutions that benefit not just our community, but the world.', 'نعمل على حلول تفيد مجتمعنا والعالم بأسره.')}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Activities;