
from django.conf import settings
from django.conf.urls.static import static
from django.conf.urls import include, url
from django.contrib import admin

from slides.views import *
from account.views import *

urlpatterns = [
    url(r'^bakendi/', include(admin.site.urls)),
    url(r'^$', account_index),

    url(r'^login/$', login_user),
    url(r'^logout/$', logout_user),

    url(r'^slides/login/$', loginpage),

    url(r'^account/$', account_index),
    url(r'^account/edit/(?P<promo_id>\d+)/$', account_edit),
    url(r'^promotion/(?P<promo_id>\d+)/$', promotion_editor, name='promotion'),
    url(r'^slides/(?P<promo_id>\d+)/$', show_promotion, name='show promotion'),
    url(r'^slides/edit/(?P<promo_id>\d+)/$', edit_promotion, name='edit promotion'),
    url(r'^slides/masters/$', master_slides, name='master slides'),

    url(r'^slidesDemo/$', show_promotion_demo, name='show promotion demo'),

    url(r'^api/addPromotion/$', api_add_promotion),
    url(r'^api/addSlide/$', api_add_slide),
    url(r'^api/updateHtml/$', api_update_html),
    url(r'^api/getSlides/$', api_get_slides),
    url(r'^api/getSlide$', api_get_slide),
    url(r'^api/removeSlide$', api_remove_slide),
    url(r'^api/hideSlide$', api_hide_slide),
    url(r'^api/showSlide$', api_show_slide),
    url(r'^api/updateIndexList$', api_update_indexlist),

    url(r'^api/setAsMaster$', api_setas_master),




] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

