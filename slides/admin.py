from django.contrib import admin
from slides.models import *

admin.site.register(Promotion)

class SlideAdmin(admin.ModelAdmin):
    list_display = ('id','is_active','index')
    search_fields = ('promotion',)
    list_filter = ('promotion',)
admin.site.register(Slide, SlideAdmin)
