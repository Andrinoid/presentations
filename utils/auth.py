from utils.rest_response import *
from django.http import HttpResponseRedirect

def login(f):
    def wrap(request, *args, **kwargs):
        if request.user.is_authenticated():
            return f(request, *args, **kwargs)
        if request.is_ajax():
            return json_error_response({'error': 'login'})
        return HttpResponseRedirect('/login/')
    return wrap