from django.contrib import admin
from account.models import *


class AccountAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'email',)
    search_fields = ('id', 'name', 'email',)

admin.site.register(Account, AccountAdmin)
