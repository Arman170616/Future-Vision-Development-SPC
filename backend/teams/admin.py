from django.contrib import admin
from .models import Department, TeamMember, Expertise, Achievement


class ExpertiseInline(admin.TabularInline):
    model = Expertise
    extra = 1


class AchievementInline(admin.TabularInline):
    model = Achievement
    extra = 1


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon', 'color']
    search_fields = ['name']


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ['name', 'position', 'department', 'email', 'has_login', 'created_at']
    exclude = ['user']  # managed by the "Login access" panel on the team member page

    @admin.display(boolean=True, description='Admin login')
    def has_login(self, obj):
        return bool(obj.user_id and obj.user.is_active)
    list_filter = ['department', 'created_at']
    search_fields = ['name', 'position', 'bio']
    inlines = [ExpertiseInline, AchievementInline]
