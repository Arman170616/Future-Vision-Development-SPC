from django.db import models
from django.utils.text import slugify


class Project(models.Model):
    CATEGORY_CHOICES = [
        ('web', 'Web Applications'),
        ('mobile', 'Mobile Apps'),
        ('iot', 'IoT Solutions'),
        ('data', 'Data Analytics'),
        ('ai', 'AI & Machine Learning'),
    ]

    STATUS_CHOICES = [
        ('completed', 'Completed'),
        ('ongoing', 'Ongoing'),
        ('planning', 'Planning'),
    ]

    PROJECT_TYPE_CHOICES = [
        ('client', 'Client Project'),
        ('in_house', 'In-House Product'),
    ]

    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES)
    # In-house products are showcased separately from client work on the Projects page
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPE_CHOICES, default='client')
    tagline = models.CharField(max_length=200, blank=True, help_text='One-line pitch shown on product cards')
    product_url = models.URLField(blank=True, help_text='Live product / demo link (in-house products)')
    client = models.CharField(max_length=100, blank=True)
    duration = models.CharField(max_length=50, blank=True)  # e.g., "18 months"
    team_size = models.CharField(max_length=50, blank=True)  # e.g., "12 developers"
    budget = models.CharField(max_length=50, blank=True, null=True)  # e.g., "$2.5M"
    completion_date = models.CharField(max_length=50, blank=True)  # e.g., "March 2024"

    image = models.URLField()
    description = models.TextField()
    challenge = models.TextField(blank=True)
    solution = models.TextField(blank=True)
    impact = models.TextField(blank=True)
    next_steps = models.TextField(blank=True, null=True)

    # Optional Arabic content; the site falls back to English when empty
    title_ar = models.CharField(max_length=200, blank=True)
    tagline_ar = models.CharField(max_length=200, blank=True)
    description_ar = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class ProjectTechnology(models.Model):
    project = models.ForeignKey(Project, related_name='technologies', on_delete=models.CASCADE)
    technology = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.project.title} - {self.technology}"


class ProjectFeature(models.Model):
    project = models.ForeignKey(Project, related_name='features', on_delete=models.CASCADE)
    feature = models.CharField(max_length=300)

    def __str__(self):
        return f"{self.project.title} - {self.feature[:50]}"


class ProjectResult(models.Model):
    project = models.ForeignKey(Project, related_name='results', on_delete=models.CASCADE)
    result = models.CharField(max_length=300)

    def __str__(self):
        return f"{self.project.title} - {self.result[:50]}"


class ProjectGallery(models.Model):
    project = models.ForeignKey(Project, related_name='gallery', on_delete=models.CASCADE)
    image_url = models.URLField()
    caption = models.CharField(max_length=200, blank=True, null=True)

    def __str__(self):
        return f"{self.project.title} - Gallery Image"


class ProjectTestimonial(models.Model):
    project = models.OneToOneField(Project, related_name='testimonial', on_delete=models.CASCADE)
    quote = models.TextField()
    author = models.CharField(max_length=100)
    position = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.project.title} - {self.author}"
