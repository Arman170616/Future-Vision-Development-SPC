from django.db import models
from django.utils.text import slugify


class BlogCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)

    class Meta:
        verbose_name_plural = "Blog Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogPost(models.Model):
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    excerpt = models.TextField(max_length=500)
    content = models.TextField()
    author = models.CharField(max_length=100)
    category = models.ForeignKey(BlogCategory, on_delete=models.CASCADE, related_name='posts')
    image = models.URLField()
    read_time = models.CharField(max_length=20)  # e.g., "8 min read"
    featured = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    published_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class BlogTag(models.Model):
    name = models.CharField(max_length=50)
    slug = models.SlugField(unique=True, blank=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class BlogPostTag(models.Model):
    post = models.ForeignKey(BlogPost, related_name='tags', on_delete=models.CASCADE)
    tag = models.ForeignKey(BlogTag, on_delete=models.CASCADE)

    class Meta:
        unique_together = ['post', 'tag']

    def __str__(self):
        return f"{self.post.title} - {self.tag.name}"
