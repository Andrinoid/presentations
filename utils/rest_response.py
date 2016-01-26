import json
from django.http import HttpResponse

def attempt_parse(value, fallback):
    try:
        return json.loads(value)
    except:
        return fallback

def json_response(data):
    return HttpResponse(json.dumps(data), content_type='application/json')


def json_error_response(error):
    if isinstance(error, (Exception, str)):
        error = {'error': str(error)}
    return HttpResponse(json.dumps(error), status=500, content_type='application/json')


def json_pretty_response(data):
    return HttpResponse(json.dumps(data, indent=4, sort_keys=True), content_type='text/plain')