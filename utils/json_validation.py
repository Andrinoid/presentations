
def js_apply_test(value, test):
    js_wrapper = test[0]
    if len(test) == 2 and isinstance(test[1], dict):
        testers = test[1]
    else:
        testers = test[1:]
    js_wrapper(value, testers).test()


class JsError(Exception):

    def __init__(self, value):
        self.value = value
        super(JsError, self).__init__('invalid')


class JsValue(object):
    
    python_type = (str, unicode, int, float, bool, list, dict,)

    def __init__(self, value, testers=None):
        self.value = value
        self.testers = testers or []

    def before(self):
        pass

    def test(self):
        if not isinstance(self.value, self.python_type):
            raise JsError('invalid')
        
        self.before()

        if self.testers:
            for tester in self.testers:
                tester(self.value)
        
        self.validator()
        
        if hasattr(self, 'is_collected_error'):
            self.is_collected_error()

    def validator(self):
        pass


class JsString(JsValue):
    
    python_type = unicode

    def before(self):
        self.value = self.value.strip()


class JsInt(JsValue):
    
    python_type = int


class JsFloat(JsValue):
    
    python_type = float


class JsBool(JsValue):
    
    python_type = bool


class JsArray(JsValue):

    python_type = list

    def __init__(self, value, testers=None):
        self.value = value
        self.testers = []
        self.item_test = []
        self.error = []
        if isinstance(testers, list):            
            self.testers = testers
        elif isinstance(testers, dict):
            self.testers = testers.get('array', [])
            self.item_test = testers.get('item', [])

    def validator(self):
        error = []
        for item in self.value:
            try:
                self.item_validator(item)
            except JsError, inst:
                self.error.append({
                    'index': self.value.index(item),
                    'error': inst.value,
                    'value': item
                })

    def item_validator(self, item):
        if self.item_test:
            js_apply_test(item, self.item_test)

    def is_collected_error(self):
        if self.error:
            raise JsError(self.error)


class JsObject(JsValue):

    python_type = dict

    def __init__(self, value, testers=None):
        self.value = value
        self.testers = []
        self.model = {}
        self.error = {}
        if isinstance(testers, list):            
            self.testers = testers
        elif isinstance(testers, dict):
            self.model = testers

    def validator(self):
        if len(self.model):
            for key, test in self.model.items():
                self.pair_validator(key, test)

    def pair_validator(self, key, test):
        try:
            js_apply_test(self.value[key], test)
        except KeyError:
            self.error[key] = 'missing'
        except JsError, inst:
            self.error[key] = inst.value

    def is_collected_error(self):
        if self.error:
            raise JsError(self.error)




