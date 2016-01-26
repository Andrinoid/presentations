# -*- coding: utf-8 -*-
from django.conf import settings
from django.db import models
from datetime import datetime
from django.contrib.auth.models import User


class Promotion(models.Model):
    name = models.CharField(max_length=50, verbose_name='Nafn')
    user = models.ForeignKey(User)
    thumb = models.CharField(max_length=250, blank=True)
    date = models.DateTimeField(default=datetime.now, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=False)
    in_private = models.BooleanField(default=False)
    created = models.DateTimeField(auto_now_add=True)
    modified = models.DateTimeField(auto_now=True, editable=False)

    def link(self):
        return '/slides/{0}'.format(self.pk)

    def edit_link(self):
        return '/account/edit/{0}'.format(self.pk)

    def frame_link(self):
        return '/slides/edit/{0}'.format(self.pk)



    def __unicode__(self):
        return self.name


class Slide(models.Model):
    promotion = models.ForeignKey(Promotion)
    date = models.DateTimeField(default=datetime.now, blank=True)
    image = models.CharField(max_length=400, blank=True)
    thumb = models.CharField(max_length=400, blank=True)
    description = models.TextField(blank=True)
    html = models.TextField(blank=True)
    link = models.CharField(max_length=250, blank=True)
    is_active = models.BooleanField(default=True)
    gallery = models.BooleanField(default=False, verbose_name='Master slide')
    index = models.IntegerField()


    # def save(self, *args, **kwargs):
    #     # If this is the first slide. Save the thumb to the promnotion
    #     slides_count = Slide.objects.filter(promotion=self.promotion).count()
    #     if slides_count == 0:
    #         self.promotion.thumb = self.thumb
    #         self.promotion.save()
    #     super(Slide, self).save(*args, **kwargs)
    #
    def delete(self):
        super(Slide, self).delete()
        promotion = self.promotion
        slides = Slide.objects.filter(promotion=promotion).order_by('index')
        for i, slide in enumerate(slides):
            slide.index = i
            slide.save()


    def __unicode__(self):
        return self.promotion.name

