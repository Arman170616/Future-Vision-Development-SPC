from django.contrib import admin

from expenses.admin import SuperuserOnlyAdmin

from .models import ContactMessage


@admin.register(ContactMessage)
class ContactMessageAdmin(SuperuserOnlyAdmin):
    list_display = ['name', 'subject', 'email', 'company', 'handled', 'created_at']
    list_filter = ['handled', 'subject', 'created_at']
    list_editable = ['handled']
    search_fields = ['name', 'email', 'company', 'message']
    date_hierarchy = 'created_at'
    readonly_fields = ['name', 'email', 'company', 'subject', 'message', 'created_at']
    fieldsets = (
        (None, {'fields': (('name', 'email'), ('company', 'subject'), 'message', 'created_at')}),
        ('Follow-up', {'fields': ('handled', 'internal_notes')}),
    )

    def has_add_permission(self, request):
        return False  # messages only come from the website
