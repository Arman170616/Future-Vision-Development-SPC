from django.db import models


class JobOpening(models.Model):
    JOB_TYPES = [
        ('full-time', 'Full-time'),
        ('part-time', 'Part-time'),
        ('contract', 'Contract'),
        ('internship', 'Internship'),
    ]

    DEPARTMENTS = [
        ('engineering', 'Engineering'),
        ('product', 'Product'),
        ('design', 'Design'),
        ('marketing', 'Marketing'),
        ('sales', 'Sales'),
        ('hr', 'Human Resources'),
        ('finance', 'Finance'),
    ]

    title = models.CharField(max_length=200)
    department = models.CharField(max_length=50, choices=DEPARTMENTS)
    location = models.CharField(max_length=100)
    job_type = models.CharField(max_length=50, choices=JOB_TYPES)
    experience_required = models.CharField(max_length=50)  # e.g., "5+ years"
    description = models.TextField()

    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.department}"


class JobRequirement(models.Model):
    job = models.ForeignKey(JobOpening, related_name='requirements', on_delete=models.CASCADE)
    requirement = models.CharField(max_length=300)

    def __str__(self):
        return f"{self.job.title} - {self.requirement[:50]}"


class JobResponsibility(models.Model):
    job = models.ForeignKey(JobOpening, related_name='responsibilities', on_delete=models.CASCADE)
    responsibility = models.CharField(max_length=300)

    def __str__(self):
        return f"{self.job.title} - {self.responsibility[:50]}"


class JobApplication(models.Model):
    EXPERIENCE_LEVELS = [
        ('0-1', '0-1 years'),
        ('2-3', '2-3 years'),
        ('4-5', '4-5 years'),
        ('6-10', '6-10 years'),
        ('10+', '10+ years'),
    ]

    job = models.ForeignKey(JobOpening, related_name='applications', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    experience_level = models.CharField(max_length=10, choices=EXPERIENCE_LEVELS, blank=True, null=True)
    cover_letter = models.TextField()

    applied_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-applied_at']

    def __str__(self):
        return f"{self.name} - {self.job.title}"
