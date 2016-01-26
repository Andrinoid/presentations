import json
from json_validation import *
from django.core.validators import validate_email

def required(value):
    if not len(value):
        raise JsError('required')

def max_length(limit):
    def tester(value):
        if len(value) > limit:
            raise JsError('$max length {%d}' % limit)
    return tester

def min_length(limit):
    def tester(value):
        if len(value) < limit:
            raise JsError('$min length {%d}' % limit)
    return tester


def exact_length(length):
    def tester(value):
        if len(value) != length:
            raise JsError('$length must be {%d}' % length)
    return tester

def is_numeric(value):
    if not value.isdigit():
        raise JsError('invalid')

def not_zero(value):
    if value == 0:
        raise JsError('zero not allowed')

def array_has_length(value):
    if not len(value):
        raise JsError('missing')

def email(value):
    try:
        validate_email(value)
    except:
        raise JsError('invalid')


class DataLang(JsObject):
    
    def before(self):
        test = [JsString] + self.testers
        self.testers = []
        self.model = {
            'is': test,
            'en': test
        }  


class Validator(object):

    fields = []

    def __init__(self, data):
        try:
            self.data = json.loads(data)
        except:
            self.data = None
        self.error = {}
        self.model = None

    def validate(self):
        if not isinstance(self.data, dict):
            self.error['error'] = 'invalid'
            return

        for key, test in self.fields:
            self.test(key, test)
    
    def test(self, key, test):    
        try:
            js_apply_test(self.data[key], test)
        except KeyError:
            self.error[key] = 'missing'
        except JsError, inst:
            self.error[key] = inst.value

    def is_error(self):
        return bool(self.error)

