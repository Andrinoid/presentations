# -*- coding: utf-8 -*-
from slides.models import *
import datetime


def rest_date(date):
    return date.strftime('%Y-%m-%d')


def rest_datetime(date):
    return date.strftime('%Y-%m-%dT%H:%M')


def rest_promotion(promotion):
    d = {}
    d['id'] = promotion.pk
    d['link'] = promotion.link()
    d['editLink'] = promotion.edit_link()
    d['frameLink'] = promotion.frame_link()
    d['name'] = promotion.name,
    d['author'] = {
        'username': promotion.user.username,
        'userFullName': promotion.user.account.name,
        'avatar': promotion.user.account.avatar.url,
        'department': promotion.user.account.department
    }
    d['description'] = promotion.description
    d['thumb'] = promotion.thumb
    d['isActive'] = promotion.is_active
    d['inPrivate'] = promotion.in_private
    d['created'] = rest_date(promotion.created)
    d['modified'] = rest_date(promotion.modified)
    return d


def rest_promotions(slides):
    return [rest_promotion(p) for p in slides]


def rest_slide(slide):
    d = {}
    d['id'] = slide.pk
    d['promotionId'] = slide.promotion.pk
    d['date'] = rest_date(slide.date)
    d['image'] = slide.image
    d['thumb'] = slide.thumb
    d['description'] = slide.description
    d['html'] = slide.html
    d['link'] = slide.link
    d['isActive'] = slide.is_active
    d['index'] = slide.index
    d['isMaster'] = slide.gallery
    d['focus'] = False

    return d


def rest_slides(slides):
    return [rest_slide(p) for p in slides]
