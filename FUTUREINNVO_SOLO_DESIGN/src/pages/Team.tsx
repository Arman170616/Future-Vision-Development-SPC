import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Award, Linkedin, Mail, Code, Palette, Database, Brain, Shield, Rocket,
  Building2, Sparkles, BadgeCheck, CheckCircle2, ArrowRight, type LucideIcon,
} from 'lucide-react';
import { teamsApi, TeamMember, Department } from '../services/api';
import { useLanguage } from '../context/LanguageContext';

/* Round photo that falls back to initials when the image is missing or fails to load. */
const Avatar = ({ name, src }: { name: string; src?: string }) => {
  const [failed, setFailed] = useState(!src);
  const initials = name
    .replace(/^(dr|mr|mrs|ms|eng)\.?\s+/i, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');

  return (
    <div className="w-28 h-28 rounded-full p-1 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] shadow-lg">
      {failed ? (
        <div className="w-full h-full rounded-full flex items-center justify-center bg-[color:var(--bg)] text-3xl font-bold ltr">
          {/* gradient text lives on the span: background-clip:text would clip the circle's own background */}
          <span className="text-gradient">{initials}</span>
        </div>
      ) : (
        <img
          src={src}
          alt={name}
          loading="lazy"
          onError={() => setFailed(true)}
          onLoad={e => {
            // imgbb answers deleted images with a 180×180 "image not found" picture instead of an error
            const img = e.currentTarget;
            if (/(^|\.)ibb\.co\//.test(img.src.replace(/^https?:\/\//, '')) && img.naturalWidth === 180 && img.naturalHeight === 180) {
              setFailed(true);
            }
          }}
          className="w-full h-full rounded-full object-cover bg-[color:var(--bg)]"
        />
      )}
    </div>
  );
};

const Team = () => {
  const { tr, tt } = useLanguage();
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [membersResponse, departmentsResponse] = await Promise.all([
          teamsApi.getTeamMembers(),
          teamsApi.getDepartments()
        ]);

        setTeamMembers(membersResponse.results);
        setDepartments(departmentsResponse.results);
      } catch (err) {
        setError(tr('Failed to fetch team data', 'تعذّر تحميل بيانات الفريق'));
        console.error('Error fetching team data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fallback static data
  const fallbackTeamMembers = [
    {
      id: 1,
      name: 'Ahmed Al-Rashid',
      position: 'Chief Executive Officer',
      department: 'Leadership',
      image: 'https://i.ibb.co/v4RYptLv/ceo-photo.png',
      bio: 'Visionary leader with 15+ years in AI and digital transformation. Former tech executive at major corporations.',
      expertise: ['Strategic Planning', 'AI Strategy', 'Business Development', 'Innovation Management'],
      achievements: [
        'Led digital transformation for 50+ companies',
        'Published researcher in AI applications',
        'TEDx speaker on future of technology'
      ],
      social: {
        linkedin: '#',
        email: 'ahmed@futureinnvo.com'
      }
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      position: 'Chief Technology Officer',
      department: 'Technology',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'AI expert and software architect with deep expertise in machine learning and cloud technologies.',
      expertise: ['Machine Learning', 'Cloud Architecture', 'System Design', 'AI Development'],
      achievements: [
        'Built AI systems serving 1M+ users',
        'AWS Certified Solutions Architect',
        'Open source contributor with 10K+ stars'
      ],
      social: {
        linkedin: '#',
        email: 'sarah@futureinnvo.com'
      }
    },
    {
      id: 3,
      name: 'Mohammed Al-Balushi',
      position: 'Head of AI Research',
      department: 'Research',
      image: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'PhD in Computer Science specializing in natural language processing and computer vision applications.',
      expertise: ['Natural Language Processing', 'Computer Vision', 'Deep Learning', 'Research'],
      achievements: [
        'Published 25+ research papers',
        'PhD from Stanford University',
        'Winner of AI Innovation Award 2023'
      ],
      social: {
        linkedin: '#',
        email: 'mohammed@futureinnvo.com'
      }
    },
    {
      id: 4,
      name: 'Emily Chen',
      position: 'Lead UX/UI Designer',
      department: 'Design',
      image: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Creative designer passionate about creating intuitive user experiences for complex AI-powered applications.',
      expertise: ['UI/UX Design', 'Design Systems', 'User Research', 'Prototyping'],
      achievements: [
        'Designed interfaces for 100+ applications',
        'Winner of Design Excellence Award',
        'Featured in top design publications'
      ],
      social: {
        linkedin: '#',
        email: 'emily@futureinnvo.com'
      }
    },
    {
      id: 5,
      name: 'Omar Al-Zahra',
      position: 'Senior Full Stack Developer',
      department: 'Development',
      image: 'https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Full-stack developer with expertise in modern web technologies and scalable application architecture.',
      expertise: ['React', 'Node.js', 'Python', 'DevOps', 'Microservices'],
      achievements: [
        '8+ years of development experience',
        'Built applications serving millions',
        'Certified Kubernetes Administrator'
      ],
      social: {
        linkedin: '#',
        email: 'omar@futureinnvo.com'
      }
    },
    {
      id: 6,
      name: 'Lisa Rodriguez',
      position: 'Data Science Lead',
      department: 'Analytics',
      image: 'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Data scientist with expertise in predictive analytics and business intelligence solutions.',
      expertise: ['Data Science', 'Machine Learning', 'Statistical Analysis', 'Business Intelligence'],
      achievements: [
        'MS in Data Science from MIT',
        'Built predictive models for Fortune 500',
        'Kaggle Grandmaster status'
      ],
      social: {
        linkedin: '#',
        email: 'lisa@futureinnvo.com'
      }
    },
    {
      id: 7,
      name: 'Khalid Al-Mamari',
      position: 'Cybersecurity Specialist',
      department: 'Security',
      image: 'https://images.pexels.com/photos/2182973/pexels-photo-2182973.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Cybersecurity expert ensuring our AI solutions meet the highest security and compliance standards.',
      expertise: ['Cybersecurity', 'Compliance', 'Risk Assessment', 'Security Architecture'],
      achievements: [
        'CISSP and CISM certified',
        'Secured systems for government clients',
        'Expert in AI security frameworks'
      ],
      social: {
        linkedin: '#',
        email: 'khalid@futureinnvo.com'
      }
    },
    {
      id: 8,
      name: 'Anna Kowalski',
      position: 'Product Manager',
      department: 'Product',
      image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=400',
      bio: 'Product strategist focused on bringing AI innovations to market and ensuring customer success.',
      expertise: ['Product Strategy', 'Market Research', 'Agile Methodology', 'Customer Success'],
      achievements: [
        'Launched 15+ successful products',
        'MBA from Wharton Business School',
        'Product Management certification'
      ],
      social: {
        linkedin: '#',
        email: 'anna@futureinnvo.com'
      }
    }
  ];

  const fallbackDepartments = [
    { name: 'Leadership', count: 1 },
    { name: 'Technology', count: 2 },
    { name: 'Research', count: 1 },
    { name: 'Design', count: 1 },
    { name: 'Development', count: 1 },
    { name: 'Analytics', count: 1 },
    { name: 'Security', count: 1 },
    { name: 'Product', count: 1 }
  ];

  const departmentIcons: Record<string, LucideIcon> = {
    leadership: Rocket,
    technology: Code,
    research: Brain,
    design: Palette,
    development: Database,
    analytics: Award,
    security: Shield,
    product: Users,
  };
  const iconFor = (department: string) => departmentIcons[department.toLowerCase()] ?? Users;

  // Normalise API members and the static fallback into one shape
  type MemberView = {
    id: number;
    name: string;
    position: string;
    department: string;
    image: string;
    bio: string;
    email?: string;
    linkedin?: string;
    expertise: string[];
    achievements: string[];
  };
  const toView = (m: TeamMember | (typeof fallbackTeamMembers)[number]): MemberView =>
    'social' in m
      ? {
          id: m.id, name: m.name, position: m.position, department: m.department, image: m.image, bio: m.bio,
          email: m.social.email, linkedin: m.social.linkedin !== '#' ? m.social.linkedin : undefined,
          expertise: m.expertise, achievements: m.achievements,
        }
      : {
          id: m.id, name: m.name, position: m.position, department: m.department_name, image: m.image, bio: m.bio,
          email: m.email || undefined, linkedin: m.linkedin_url || undefined,
          expertise: m.expertise.map(e => e.skill), achievements: m.achievements.map(a => a.achievement),
        };

  const members = (teamMembers.length > 0 ? teamMembers : fallbackTeamMembers).map(toView);
  const departmentList = departments.length > 0
    ? departments.map(d => ({ name: d.name, count: d.member_count }))
    : fallbackDepartments;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-300 mx-auto"></div>
          <p className="text-blue-100 mt-4">{tr('Loading team data...', 'جارٍ تحميل بيانات الفريق...')}</p>
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

  const stats = [
    { value: '50+', label: tr('Team Members', 'أعضاء الفريق'), icon: Users },
    { value: String(departmentList.length), label: tr('Departments', 'الأقسام'), icon: Building2 },
    { value: '15+', label: tr('Years Experience', 'سنوات من الخبرة'), icon: Sparkles },
    { value: '25+', label: tr('Certifications', 'الشهادات المهنية'), icon: BadgeCheck },
  ];

  const culture = [
    { icon: Brain, title: tr('Innovation First', 'الابتكار أولاً'), text: tr('We encourage creative thinking and breakthrough solutions in everything we do.', 'نشجّع التفكير الإبداعي والحلول الرائدة في كل ما نقوم به.') },
    { icon: Users, title: tr('Collaborative Spirit', 'روح التعاون'), text: tr('We believe the best solutions come from diverse perspectives working together.', 'نؤمن بأن أفضل الحلول تنشأ من تكامل وجهات النظر المتنوعة.') },
    { icon: Rocket, title: tr('Growth Mindset', 'عقلية النمو'), text: tr("We invest in our people's development and celebrate continuous learning.", 'نستثمر في تطوير فريقنا ونحتفي بالتعلّم المستمر.') },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="eyebrow glass-effect mb-6 animate-slide-in">
            <Users className="h-4 w-4" />
            {tr('Our people', 'فريق العمل')}
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-fg mb-6 animate-slide-in">
            {tr('Meet Our ', 'تعرّف على ')}<span className="text-gradient">{tr('Team', 'فريقنا')}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted max-w-3xl mx-auto leading-relaxed animate-slide-in">
            {tr('Our diverse team of experts combines deep technical knowledge with creative innovation to deliver cutting-edge AI and digital transformation solutions.', 'يجمع فريقنا المتنوع من الخبراء بين المعرفة التقنية العميقة والابتكار الإبداعي لتقديم حلول متقدمة في الذكاء الاصطناعي والتحول الرقمي.')}
          </p>
        </div>

        {/* Team Stats */}
        <div className="glass-effect-strong rounded-3xl p-6 md:p-8 grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {stats.map(({ value, label, icon: Icon }) => (
            <div key={label} className="flex flex-col items-center text-center gap-2">
              <span className="w-11 h-11 rounded-2xl flex items-center justify-center bg-[rgba(var(--accent-rgb),0.12)]">
                <Icon className="h-5 w-5 text-accent" />
              </span>
              <div className="text-3xl md:text-4xl font-bold text-gradient ltr">{value}</div>
              <div className="text-sm text-muted">{label}</div>
            </div>
          ))}
        </div>

        {/* Leadership Team */}
        <section className="mb-20">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-fg mb-3">{tr('Leadership Team', 'فريق القيادة')}</h2>
            <p className="text-muted">{tr('The people behind our products, projects and training.', 'الأشخاص الذين يقفون خلف منتجاتنا ومشاريعنا وبرامجنا التدريبية.')}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-6">
            {members.map(member => {
              const DeptIcon = iconFor(member.department);
              return (
                <article
                  key={member.id}
                  className="glass-effect-strong card-lift rounded-3xl overflow-hidden w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] max-w-sm flex flex-col"
                >
                  {/* Soft banner + avatar */}
                  <div className="relative h-24 bg-gradient-to-br from-[rgba(var(--accent-rgb),0.22)] via-[rgba(var(--accent-rgb),0.08)] to-transparent">
                    <span className="absolute top-3 end-3 inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full glass-effect text-muted">
                      <DeptIcon className="h-3.5 w-3.5 text-accent" />
                      {tt(member.department)}
                    </span>
                  </div>
                  <div className="-mt-14 flex justify-center">
                    <Avatar name={member.name} src={member.image} />
                  </div>

                  <div className="px-6 pt-4 pb-6 text-center flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-fg">{member.name}</h3>
                    <p className="text-accent font-medium text-sm mt-1 mb-3">{member.position}</p>
                    <p className="text-muted text-sm leading-relaxed mb-5 line-clamp-3">{member.bio}</p>

                    {member.expertise.length > 0 && (
                      <div className="flex flex-wrap justify-center gap-1.5 mb-5">
                        {member.expertise.slice(0, 4).map(skill => (
                          <span key={skill} className="text-xs px-2.5 py-1 rounded-full bg-[rgba(var(--accent-rgb),0.08)] text-fg">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {member.achievements.length > 0 && (
                      <ul className="space-y-2 mb-6 text-start">
                        {member.achievements.slice(0, 2).map(achievement => (
                          <li key={achievement} className="flex items-start gap-2 text-xs text-muted">
                            <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                            {achievement}
                          </li>
                        ))}
                      </ul>
                    )}

                    {(member.email || member.linkedin) && (
                      <div className="mt-auto pt-4 border-t border-[rgba(var(--accent-rgb),0.12)] flex justify-center gap-2">
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            aria-label={tr(`Email ${member.name}`, `مراسلة ${member.name}`)}
                            className="glass-effect p-2.5 rounded-full hover:scale-110 transition-transform"
                          >
                            <Mail className="h-4 w-4 text-accent" />
                          </a>
                        )}
                        {member.linkedin && (
                          <a
                            href={member.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                            className="glass-effect p-2.5 rounded-full hover:scale-110 transition-transform"
                          >
                            <Linkedin className="h-4 w-4 text-accent" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Departments Overview */}
        <section className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-fg mb-10 text-center">{tr('Our Departments', 'أقسامنا')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {departmentList.map(dept => {
              const Icon = iconFor(dept.name);
              return (
                <div key={dept.name} className="glass-effect card-lift rounded-2xl p-4 flex items-center gap-3">
                  <span className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-[rgba(var(--accent-rgb),0.12)]">
                    <Icon className="h-5 w-5 text-accent" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-fg truncate">{tt(dept.name)}</h3>
                    {dept.count > 0 && (
                      <p className="text-xs text-muted">
                        {tr(`${dept.count} member${dept.count > 1 ? 's' : ''}`, dept.count === 1 ? 'عضو واحد' : dept.count === 2 ? 'عضوان' : `${dept.count} أعضاء`)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Company Culture */}
        <section className="mb-20">
          <div className="glass-effect-strong rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-fg mb-4">{tr('Our Culture', 'ثقافتنا')}</h2>
            <p className="text-lg text-muted mb-10 max-w-3xl mx-auto">
              {tr('We foster an environment of innovation, collaboration, and continuous learning where every team member can thrive and contribute to shaping the future of technology.', 'نوفّر بيئة قائمة على الابتكار والتعاون والتعلّم المستمر، يزدهر فيها كل عضو في الفريق ويُسهم في صناعة مستقبل التقنية.')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {culture.map(({ icon: Icon, title, text }) => (
                <div key={title} className="glass-effect rounded-2xl p-6">
                  <span className="w-12 h-12 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-[rgba(var(--accent-rgb),0.12)]">
                    <Icon className="h-6 w-6 text-accent" />
                  </span>
                  <h3 className="text-lg font-semibold text-fg mb-2">{title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Our Team CTA */}
        <section>
          <div className="glass-effect-strong rounded-3xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-fg mb-4">{tr('Join Our Team', 'انضم إلى فريقنا')}</h2>
            <p className="text-lg text-muted mb-8 max-w-2xl mx-auto">
              {tr("Ready to be part of the future? We're always looking for talented individuals who share our passion for innovation.", 'هل أنت مستعد لتكون جزءاً من المستقبل؟ نبحث دائماً عن أصحاب المواهب الذين يشاركوننا شغف الابتكار.')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/jobs" className="btn-liquid justify-center">
                <span className="relative">{tr('View Open Positions', 'الوظائف المتاحة')}</span>
                <ArrowRight className="relative h-5 w-5" />
              </Link>
              <Link to="/contact" className="btn-glass glass-effect justify-center">
                {tr('Send Your Resume', 'أرسل سيرتك الذاتية')}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Team;
