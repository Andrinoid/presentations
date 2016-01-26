# -*- coding: utf-8 -*-
from django.shortcuts import render
from django.http import JsonResponse
from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from slides.rest import rest_promotions, rest_promotion, rest_slides, rest_slide
from slides.models import *
import json


@login_required()
def account_index(request):
    recent = Promotion.objects.all().filter(is_active=True).filter(in_private=False).order_by('-date')
    context = {
        'recent': json.dumps(rest_promotions(recent))
    }
    return render(request, 'frontpage.html', context)


@login_required()
def account_edit(request, promo_id):
    promotion = Promotion.objects.get(pk=promo_id)
    slides = Slide.objects.filter(promotion=promotion).order_by('index')
    master_slides = Slide.objects.filter(gallery=True).exclude(is_active=False)
    context = {
        'promotion': json.dumps(rest_promotion(promotion)),
        'slides': json.dumps(rest_slides(slides)),
        'masterSlides':json.dumps(rest_slides(master_slides))
    }
    return render(request, 'editor.html', context)


def api_add_slide(request):
    promotion_id = request.GET['promoId']
    master_id = request.GET['masterSlideId']
    promotion = Promotion.objects.get(pk=promotion_id)
    index = Slide.objects.filter(promotion=promotion).count()

    slide = Slide.objects.get(pk=master_id)
    slide.pk = None
    slide.gallery = False
    slide.promotion = promotion
    slide.index = index
    try:
        slide.save()
    except OSError:
        print "Deal with this situation"  # TODO setja viðeigandi response hér. kanski er þetta ekki nauðsynlegt skref

    response = json.dumps(rest_slide(slide))
    return HttpResponse(response, content_type='application/json')


def api_update_indexlist(request):
    if request.method == 'POST':
        order_list = json.loads(request.body)['slideOrder']
        for item in order_list:
            Slide.objects.filter(pk=item[0]).update(index=item[1])
        return HttpResponse('success')
    return HttpResponse('error')


def api_update_html(request):
    if request.method == 'POST':
        if request.is_ajax():
            obj = json.loads(request.body)
            html = obj['html']
            slide = Slide.objects.get(pk=obj['slideID'])
            slide.html = html
            slide.save()
            return HttpResponse('success')
        return HttpResponse('request must be ajax')
    return HttpResponse('error')


def api_remove_slide(request):
    slide_id = request.GET['slideID']
    slide = Slide.objects.get(pk=slide_id)
    promotion = slide.promotion
    slide.delete()

    slides = Slide.objects.filter(promotion=slide.promotion).order_by('index')
    response = json.dumps(rest_slides(slides))
    return HttpResponse(response, content_type='application/json')


def api_setas_master(request):
    slide_id = request.GET['slideID']
    print '#'*30
    slide = Slide.objects.get(pk=slide_id)
    slide.gallery = True
    slide.save()

    slides = Slide.objects.filter(promotion=slide.promotion).order_by('index')
    response = json.dumps(rest_slides(slides))
    return HttpResponse(response, content_type='application/json')

