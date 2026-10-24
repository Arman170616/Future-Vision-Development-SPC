from django.conf import settings
from django.db import models


class Department(models.Model):
    name = models.CharField(max_length=100)
    icon = models.CharField(max_length=50)  # Icon name for frontend
    color = models.CharField(max_length=50)  # CSS color class

    def __str__(self):
        return self.name


class TeamMember(models.Model):
    name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='members')
    image = models.URLField()
    bio = models.TextField()

    # Social links
    linkedin_url = models.URLField(blank=True, null=True)
    email = models.EmailField()

    # Admin-panel login for this person (managed from the team member page; never exposed publicly)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='team_member',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['department', 'name']

    def __str__(self):
        return f"{self.name} - {self.position}"


class Expertise(models.Model):
    team_member = models.ForeignKey(TeamMember, related_name='expertise', on_delete=models.CASCADE)
    skill = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.team_member.name} - {self.skill}"


class Achievement(models.Model):
    team_member = models.ForeignKey(TeamMember, related_name='achievements', on_delete=models.CASCADE)
    achievement = models.CharField(max_length=300)

    def __str__(self):
        return f"{self.team_member.name} - {self.achievement[:50]}"
