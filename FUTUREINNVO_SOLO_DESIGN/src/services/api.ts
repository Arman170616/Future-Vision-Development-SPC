// Use environment variable or default to production server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://159.65.146.75/api/v1';

// Generic API function
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    mode: 'cors',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    // Keep the server's explanation (e.g. DRF validation messages) so pages can show it
    const detail = await response.text().catch(() => '');
    throw new Error(`API request failed: ${response.status} ${response.statusText}${detail ? ` — ${detail}` : ''}`);
  }

  return response.json();
}

// Activities API
export interface Activity {
  id: number;
  title: string;
  date: string;
  type: string;
  image: string;
  description: string;
  participants: string;
  highlights: { highlight: string }[];
  created_at: string;
  updated_at: string;
}

export interface UpcomingEvent {
  id: number;
  title: string;
  date: string;
  type: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: number;
  title: string;
  description?: string;
  media_type: 'photo' | 'video';
  image_url?: string;
  video_url?: string;
  thumbnail_url?: string;
  display_url?: string; // Added this field that the API actually returns
  category: string;
  taken_date?: string;
  photographer?: string;
  location?: string;
  is_featured: boolean;
  is_public?: boolean;
  display_order?: number;
  activity?: number;
  activity_title?: string;
  upcoming_event?: number;
  upcoming_event_title?: string;
  event_title?: string; // Added this field that the API returns
  uploaded_at?: string;
  updated_at?: string;
}

export interface GalleryStats {
  total_items: number;
  photos: number;
  videos: number;
  featured_items: number;
  categories: string[];
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const activitiesApi = {
  getActivities: (): Promise<ApiResponse<Activity>> => 
    apiRequest('/activities/'),
  
  getUpcomingEvents: (): Promise<ApiResponse<UpcomingEvent>> => 
    apiRequest('/upcoming-events/'),
};

// Gallery API
export const galleryApi = {
  getGallery: (params?: { 
    media_type?: 'photo' | 'video'; 
    category?: string; 
    is_featured?: boolean; 
    activity?: number; 
    upcoming_event?: number;
    search?: string;
  }): Promise<ApiResponse<GalleryItem>> => {
    const searchParams = new URLSearchParams();
    if (params?.media_type) searchParams.append('media_type', params.media_type);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.is_featured !== undefined) searchParams.append('is_featured', params.is_featured.toString());
    if (params?.activity) searchParams.append('activity', params.activity.toString());
    if (params?.upcoming_event) searchParams.append('upcoming_event', params.upcoming_event.toString());
    if (params?.search) searchParams.append('search', params.search);
    
    const queryString = searchParams.toString();
    return apiRequest(`/gallery/${queryString ? `?${queryString}` : ''}`);
  },
  
  getFeaturedGallery: (): Promise<ApiResponse<GalleryItem>> => 
    apiRequest('/gallery/featured/'),
  
  getPhotos: (params?: { category?: string; is_featured?: boolean }): Promise<ApiResponse<GalleryItem>> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.is_featured !== undefined) searchParams.append('is_featured', params.is_featured.toString());
    
    const queryString = searchParams.toString();
    return apiRequest(`/gallery/photos/${queryString ? `?${queryString}` : ''}`);
  },
  
  getVideos: (params?: { category?: string; is_featured?: boolean }): Promise<ApiResponse<GalleryItem>> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.is_featured !== undefined) searchParams.append('is_featured', params.is_featured.toString());
    
    const queryString = searchParams.toString();
    return apiRequest(`/gallery/videos/${queryString ? `?${queryString}` : ''}`);
  },
  
  getGalleryByCategory: (): Promise<{ [category: string]: GalleryItem[] }> => 
    apiRequest('/gallery/by_category/'),
  
  getGalleryStats: (): Promise<GalleryStats> => 
    apiRequest('/gallery/stats/'),
  
  getGalleryItem: (id: number): Promise<GalleryItem> => 
    apiRequest(`/gallery/${id}/`),
};

// Teams API
export interface Department {
  id: number;
  name: string;
  icon: string;
  color: string;
  member_count: number;
}

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  department: number;
  department_name: string;
  image: string;
  bio: string;
  linkedin_url: string;
  email: string;
  expertise: { skill: string }[];
  achievements: { achievement: string }[];
  created_at: string;
  updated_at: string;
}

export const teamsApi = {
  getDepartments: (): Promise<ApiResponse<Department>> => 
    apiRequest('/departments/'),
  
  getTeamMembers: (): Promise<ApiResponse<TeamMember>> => 
    apiRequest('/members/'),
};

// Projects API
export interface Project {
  id: number;
  title: string;
  slug: string;
  category: string;
  status: string;
  project_type?: 'client' | 'in_house';
  tagline?: string;
  product_url?: string;
  title_ar?: string;
  tagline_ar?: string;
  description_ar?: string;
  client: string;
  duration: string;
  team_size: string;
  budget?: string;
  completion_date?: string;
  image: string;
  description: string;
  challenge?: string;
  solution?: string;
  impact: string;
  next_steps?: string;
  technologies: { technology: string }[];
  features: { feature: string }[];
  results?: { result: string }[];
  gallery?: { image_url: string; caption?: string }[];
  testimonial?: {
    quote: string;
    author: string;
    position: string;
  };
  created_at: string;
  updated_at?: string;
}

export const projectsApi = {
  getProjects: (): Promise<ApiResponse<Project>> => 
    apiRequest('/projects/'),
  
  getProject: (slug: string): Promise<Project> => 
    apiRequest(`/projects/${slug}/`),

  /** In-house products, managed in Django admin with "Project type = In-House Product". */
  getProducts: (): Promise<ApiResponse<Project>> =>
    apiRequest('/projects/?project_type=in_house'),
};

// Blog API
export interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content?: string;
  author: string;
  category: number;
  category_name: string;
  image: string;
  read_time: string;
  featured: boolean;
  tags: string[];
  created_at: string;
  updated_at?: string;
  published_at: string;
}

export const blogApi = {
  getCategories: (): Promise<ApiResponse<BlogCategory>> => 
    apiRequest('/categories/'),
  
  getPosts: (params?: { category?: string; featured?: boolean; search?: string }): Promise<ApiResponse<BlogPost>> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.featured !== undefined) searchParams.append('featured', params.featured.toString());
    if (params?.search) searchParams.append('search', params.search);
    
    const queryString = searchParams.toString();
    return apiRequest(`/posts/${queryString ? `?${queryString}` : ''}`);
  },
  
  getPost: (slug: string): Promise<BlogPost> => 
    apiRequest(`/posts/${slug}/`),
};

// Careers API
export interface JobOpening {
  id: number;
  title: string;
  department: string;
  location: string;
  job_type: string;
  experience_required: string;
  description: string;
  requirements: { requirement: string }[];
  responsibilities: { responsibility: string }[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface JobApplication {
  id?: number;
  job: number;
  job_title?: string;
  name: string;
  email: string;
  phone?: string;
  experience_level?: string;
  cover_letter: string;
  applied_at?: string;
}

export const careersApi = {
  getJobs: (): Promise<ApiResponse<JobOpening>> => 
    apiRequest('/jobs/'),
  
  submitApplication: (application: Omit<JobApplication, 'id' | 'job_title' | 'applied_at'>): Promise<{ message: string; data: JobApplication }> => 
    apiRequest('/applications/', {
      method: 'POST',
      body: JSON.stringify(application),
    }),
};

// Courses API
export interface Course {
  id: number;
  name: string;
  slug: string;
  description: string;
  short_description: string;
  duration: string;
  instructor: string;
  price: number;
  level: 'beginner' | 'intermediate' | 'advanced';
  course_type: 'online' | 'offline' | 'hybrid';
  max_students: number;
  curriculum?: string;
  prerequisites?: string;
  learning_outcomes?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  is_featured: boolean;
  current_enrollments: number;
  spots_remaining: number;
  is_full: boolean;
  attachments?: CourseAttachment[];
  created_at?: string;
  updated_at?: string;
}

/** Image or document uploaded for a course in the Django admin ("Course Files"). */
export interface CourseAttachment {
  id: number;
  title: string;
  name: string;
  url: string;
  is_image: boolean;
}

export interface CourseInterest {
  course: number;
  full_name: string;
  email: string;
  phone?: string;
  message?: string;
}

/** Absolute, same-protocol URL for an uploaded file (the API may report http:// behind the cPanel proxy). */
export const mediaUrl = (url: string): string => {
  const absolute = /^https?:\/\//.test(url) ? url : new URL(url, API_BASE_URL).toString();
  return typeof window !== 'undefined' && window.location.protocol === 'https:'
    ? absolute.replace(/^http:\/\//, 'https://')
    : absolute;
};

export interface CourseRegistration {
  id?: number;
  course: number;
  course_name?: string;
  course_instructor?: string;
  full_name: string;
  student_id?: string;
  email: string;
  phone: string;
  interest_reason: string;
  status?: 'pending' | 'confirmed' | 'rejected' | 'waitlist';
  registered_at?: string;
  updated_at?: string;
}

export interface CourseRegistrationResponse {
  message: string;
  registration: CourseRegistration;
  course_status: {
    is_full: boolean;
    spots_remaining: number;
    current_enrollments: number;
  };
}

export const coursesApi = {
  getCourses: (params?: { level?: string; course_type?: string; featured?: boolean; search?: string }): Promise<ApiResponse<Course>> => {
    const searchParams = new URLSearchParams();
    if (params?.level) searchParams.append('level', params.level);
    if (params?.course_type) searchParams.append('course_type', params.course_type);
    if (params?.featured !== undefined) searchParams.append('is_featured', params.featured.toString());
    if (params?.search) searchParams.append('search', params.search);
    
    const queryString = searchParams.toString();
    return apiRequest(`/courses/${queryString ? `?${queryString}` : ''}`);
  },
  
  getCourse: (id: number): Promise<Course> => 
    apiRequest(`/courses/${id}/`),
  
  getCourseBySlug: (slug: string): Promise<Course> => 
    apiRequest(`/courses/${slug}/`),
  
  getFeaturedCourses: (): Promise<Course[]> => 
    apiRequest('/courses/featured/'),
  
  submitRegistration: (registration: Omit<CourseRegistration, 'id' | 'course_name' | 'course_instructor' | 'status' | 'registered_at' | 'updated_at'>): Promise<CourseRegistrationResponse> => 
    apiRequest('/registrations/', {
      method: 'POST',
      body: JSON.stringify(registration),
    }),
  
  getMyRegistrations: (email: string): Promise<{ email: string; total_registrations: number; registrations: CourseRegistration[] }> => 
    apiRequest(`/registrations/my_registrations/?email=${email}`),
  
  getRegistrationStats: (): Promise<{ total_registrations: number; confirmed: number; pending: number; waitlist: number; rejected: number }> => 
    apiRequest('/registrations/stats/'),

  /** "I'm interested" lead; reviewed in Django admin → Course Interests. */
  submitInterest: (interest: CourseInterest): Promise<CourseInterest & { id: number }> =>
    apiRequest('/course-interests/', {
      method: 'POST',
      body: JSON.stringify(interest),
    }),
};
