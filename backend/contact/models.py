from django.db import models


class ContactMessage(models.Model):
    """Sent from the website's Contact page; read and answered in the admin panel."""

    SUBJECT_CHOICES = [
        ('general', 'General inquiry'),
        ('project', 'Project discussion'),
        ('partnership', 'Partnership'),
        ('support', 'Technical support'),
        ('career', 'Career opportunity'),
    ]

    name = models.CharField(max_length=150)
    email = models.EmailField()
    company = models.CharField(max_length=200, blank=True)
    subject = models.CharField(max_length=20, choices=SUBJECT_CHOICES)
    message = models.TextField()
    handled = models.BooleanField('replied', default=False)
    internal_notes = models.TextField(blank=True, help_text='Only visible in the admin panel')
    created_at = models.DateTimeField('received', auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'contact message'

    def __str__(self):
        return f'{self.name} — {self.get_subject_display()}'
