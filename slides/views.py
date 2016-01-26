# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.http import HttpResponse
from django.contrib.auth import authenticate, login
from django.contrib.auth import logout
from django.conf import settings
from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from slides.rest import rest_promotions
from django.contrib.auth.models import User
from slides.models import *
from copy import copy
from PIL import Image, ImageOps
import os
import StringIO
import json
import uuid


def loginpage(request):
    return render(request, 'login.html')


def login_user(request):
    username = request.POST['username']
    password = request.POST['password']
    user = authenticate(username=username, password=password)
    if user is not None:
        if user.is_active:
            login(request, user)
            return redirect('/account')
        else:
            return HttpResponse('Account disabled')
            # Return a 'disabled account' error message
    else:
        return render('adminLogin.html', {'login_error': 'True'})


def logout_user(request):
    logout(request)
    return redirect('/')


def promotion_editor(request, promo_id):
    promotion = Promotion.objects.get(pk=promo_id)
    slides = Slide.objects.filter(promotion=promotion)
    return render(request, 'promotionEditor.html', {'promoID': promo_id, 'slides': slides})


def show_promotion(request, promo_id):
    try:
        promotion = Promotion.objects.get(pk=promo_id)
    except Promotion.DoesNotExist:
        return render(request, 'noPromotionFound.html')

    slides = Slide.objects.filter(promotion=promotion).exclude(is_active=False).order_by('-index')

    return render(request, 'showPromotion.html', {'promoID': promo_id, 'slides': slides})


def edit_promotion(request, promo_id):
    try:
        promotion = Promotion.objects.get(pk=promo_id)
    except Promotion.DoesNotExist:
        return render(request, 'noPromotionFound.html')

    slides = Slide.objects.filter(promotion=promotion).exclude(is_active=False).order_by('-index')

    return render(request, 'showPromotion.html', {'promoID': promo_id, 'slides': slides, 'edit': True})


def show_promotion_demo(request):
    return render(request, 'showPromotionDemo.html')


def master_slides(request):
    slides = Slide.objects.filter(gallery=True).exclude(is_active=False)
    return render(request, 'showPromotion.html', {'slides': slides, 'master': True})


def api_add_promotion(request):
    promotion = Promotion()
    promotion.name = request.GET['name']
    promotion.author = request.user
    promotion.is_active = 'true' in request.GET['is_active']
    promotion.in_private = 'true' in request.GET['is_private']
    promotion.save()

    response = json.dumps({'success': True, 'promotionID': promotion.pk})
    return HttpResponse(response, content_type='application/json')


# @IMAGE TOOLS
def resize_image(imagefile, sizeXY):
    # Create Pillow image object with uploaded image
    image = Image.open(imagefile)

    # if not RGB, convert
    if image.mode not in ('L', 'RGB'):
        image = image.convert('RGB')
    thumb = ImageOps.fit(image, sizeXY, Image.ANTIALIAS)

    return thumb


# @IMAGE TOOLS
def validate_image(tail, size):
    max_bytes = 10485760
    # filter file by allowed extensions
    tails = ('gif', 'jpg', 'jpeg', 'png')
    if not tail.lower() in tails:
        return 'Uploaded: %s format not accepted' % tail.upper()
    if size > max_bytes:
        print size
        return 'Uploaded image is to large'
    return False


def api_get_slide(request):
    slide_id = request.GET['slideID']
    slides = Slide.objects.filter(pk=slide_id).values()
    for i, val in enumerate(slides):
        slides[i]['date'] = str(slides[i]['date'])

    response = {
        'success': True,
        'data': list(slides)[0]
    }
    return HttpResponse(json.dumps(response), content_type='application/json')


def api_get_slides(request):
    promotion_id = json.loads(request.body)['promoID']
    promotion = Promotion.objects.get(pk=promotion_id)
    slides = Slide.objects.filter(promotion=promotion).order_by('index').values()
    print slides
    # date is not json formatable. must be turned to string before dump
    for i, val in enumerate(slides):
        slides[i]['date'] = str(slides[i]['date'])
    response = {
        'success': True,
        'slides': list(slides)
    }
    return HttpResponse(json.dumps(response), content_type='application/json')


def api_hide_slide(request):
    slide_id = request.GET['slideID']
    slide = Slide.objects.get(pk=slide_id)
    slide.is_active = False
    slide.save()
    return HttpResponse(json.dumps({'success': True}), content_type='application/json')


def api_show_slide(request):
    slide_id = request.GET['slideID']
    print slide_id
    slide = Slide.objects.get(pk=slide_id)
    slide.is_active = True
    slide.save()
    return HttpResponse(json.dumps({'success': True}), content_type='application/json')


def api_update_slide(request):
    slide_data = json.loads(request.body)['slideData']
    slide_content = json.loads(request.body)['slideContent']

    slide = Slide.objects.get(pk=slide_data['id'])
    slide.headline = slide_content['hl1']
    slide.sub_headline = slide_content['hl2']
    slide.description = slide_content['description']
    slide.save()

    response = {
        'success': True,
    }
    return HttpResponse(json.dumps(response), content_type='application/json')
