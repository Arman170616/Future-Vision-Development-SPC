from django.db import models
from django.core.validators import EmailValidator, FileExtensionValidator, RegexValidator


class Course(models.Model):
    """Model for courses offered by the company"""
    
    COURSE_LEVELS = [
        ('beginner', 'Beginner'),
        ('intermediate', 'Intermediate'),
        ('advanced', 'Advanced'),
    ]
    
    COURSE_TYPES = [
        ('online', 'Online'),
        ('offline', 'Offline'),
        ('hybrid', 'Hybrid'),
    ]
    
    name = models.CharField(max_length=200, help_text="Course name")
    slug = models.SlugField(max_length=220, unique=True, help_text="URL-friendly version of course name")
    description = models.TextField(help_text="Detailed course description")
    short_description = models.CharField(max_length=300, help_text="Brief course summary")
    duration = models.CharField(max_length=100, help_text="Course duration (e.g., '8 weeks', '3 months')")
    instructor = models.CharField(max_length=100, help_text="Primary instructor name")
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Course price")
    level = models.CharField(max_length=20, choices=COURSE_LEVELS, default='beginner')
    course_type = models.CharField(max_length=20, choices=COURSE_TYPES, default='online')
    # Seat limits are not used (removed from the admin panel): empty = unlimited, the course never fills up
    max_students = models.PositiveIntegerField(null=True, blank=True, default=None, help_text="Optional seat limit; empty = unlimited")
    
    # Course content
    curriculum = models.TextField(blank=True, help_text="Course curriculum/modules")
    prerequisites = models.TextField(blank=True, help_text="Course prerequisites")
    learning_outcomes = models.TextField(blank=True, help_text="What students will learn")
    
    # Scheduling
    start_date = models.DateField(null=True, blank=True, help_text="Course start date")
    end_date = models.DateField(null=True, blank=True, help_text="Course end date")
    
    # Status
    is_active = models.BooleanField(default=True, help_text="Is course currently available for registration")
    is_featured = models.BooleanField(default=False, help_text="Featured course on homepage")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = "Course"
        verbose_name_plural = "Courses"
    
    def __str__(self):
        return self.name
    
    @property
    def current_enrollments(self):
        """Get current number of enrolled students"""
        return self.registrations.filter(status='confirmed').count()
    
    @property
    def is_full(self):
        """Check if course has reached maximum capacity"""
        return self.max_students is not None and self.current_enrollments >= self.max_students
    
    @property
    def spots_remaining(self):
        """Get number of spots remaining"""
        if self.max_students is None:
            return None
        return max(0, self.max_students - self.current_enrollments)


class CourseRegistration(models.Model):
    """Model for course registration applications"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('confirmed', 'Confirmed'),
        ('rejected', 'Rejected'),
        ('waitlist', 'Waitlisted'),
    ]
    
    # Course reference
    course = models.ForeignKey(Course, related_name='registrations', on_delete=models.CASCADE)
    
    # Student information
    full_name = models.CharField(max_length=100, help_text="Student's full name")
    student_id = models.CharField(
        max_length=20, 
        blank=True,
        default='',
        help_text="Optional — no longer asked on the website registration form",
        validators=[RegexValidator(
            regex=r'^[a-zA-Z0-9_-]+$',
            message='Student ID can only contain letters, numbers, hyphens, and underscores'
        )]
    )
    email = models.EmailField(
        validators=[EmailValidator()],
        help_text="Student's email address"
    )
    phone = models.CharField(
        max_length=20,
        validators=[RegexValidator(
            regex=r'^\+?1?\d{9,15}$',
            message='Phone number must be in valid format (9-15 digits, optional country code)'
        )],
        help_text="Student's phone number"
    )
    
    # Registration details
    interest_reason = models.TextField(
        help_text="Why the student is interested in joining this course",
        verbose_name="Reason for Interest"
    )
    
    # Status and tracking
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    admin_notes = models.TextField(blank=True, help_text="Internal notes for admin use")
    
    # Timestamps
    registered_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-registered_at']
        verbose_name = "Course Registration"
        verbose_name_plural = "Course Registrations"
        unique_together = ['course', 'email']  # Prevent duplicate registrations
    
    def __str__(self):
        return f"{self.full_name} - {self.course.name}"
    
    def save(self, *args, **kwargs):
        # Auto-assign to waitlist if course is full
        if self.status == 'pending' and self.course.is_full:
            self.status = 'waitlist'
        super().save(*args, **kwargs)


class CourseAttachment(models.Model):
    """Image or document shown beside the course details (brochure, outline, flyer …)."""

    IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
    DOCUMENT_EXTENSIONS = ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx']

    course = models.ForeignKey(Course, related_name='attachments', on_delete=models.CASCADE)
    title = models.CharField(max_length=200, blank=True, help_text="Optional label, e.g. 'Course brochure'")
    file = models.FileField(
        upload_to='courses/attachments/',
        validators=[FileExtensionValidator(IMAGE_EXTENSIONS + DOCUMENT_EXTENSIONS)],
        help_text="Image (JPG, PNG, WEBP, GIF) or document (PDF, Word, PowerPoint, Excel)",
    )
    order = models.PositiveIntegerField(default=0, help_text="Lower numbers are shown first")
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order', 'uploaded_at']
        verbose_name = "Course File"
        verbose_name_plural = "Course Files"

    def __str__(self):
        return self.title or self.file.name.rsplit('/', 1)[-1]

    @property
    def is_image(self):
        return self.file.name.rsplit('.', 1)[-1].lower() in self.IMAGE_EXTENSIONS


class CourseInterest(models.Model):
    """Lightweight "I'm interested" lead for a course — no full registration needed."""

    course = models.ForeignKey(Course, related_name='interests', on_delete=models.CASCADE)
    full_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    message = models.TextField(blank=True)
    contacted = models.BooleanField(default=False, help_text="Tick once the team has followed up")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Course Interest"
        verbose_name_plural = "Course Interests"

    def __str__(self):
        return f"{self.full_name} - {self.course.name}"
