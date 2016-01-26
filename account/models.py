# -*- coding: utf-8 -*-
from django.db import models
from django.contrib.auth.models import User
from utils.imagetools import remove_image

DEPARTMENT_CHOICES = (
    ('Allir', 'Allir'),
    ('Markaðsráðgjöf', 'Markaðsráðgjöf'),
    ('Birtingar', 'Birtingar'),
    ('DAN', 'DAN'),
    ('Hönnun', 'Hönnun'),
    ('Kvikmyndaframleiðsla', 'Kvikmyndaframleiðsla'),
    ('Texta- og hugmyndasmíði', 'Texta- og hugmyndasmíði')
)



class Account(models.Model):
    user = models.OneToOneField(User, related_name='account')
    email = models.EmailField()
    department =  models.CharField(max_length=40, choices=DEPARTMENT_CHOICES)
    name = models.CharField(max_length=200)
    avatar = models.ImageField(upload_to='images/avatars/', default="/static/images/defualtavatar.png")
    title = models.CharField(max_length=200)
    display_name = models.CharField(max_length=200, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    about = models.TextField(blank=True)
    facebook_id = models.IntegerField(default=0)
    is_facebook_login = models.BooleanField()
    is_user_login = models.BooleanField()
    extra = models.TextField(default='{}')

    def __unicode__(self):
        return self.email

    def delete(self):
        remove_image(self.id, 'profile')
        user = self.user
        super(Account, self).delete()
        user.delete()
