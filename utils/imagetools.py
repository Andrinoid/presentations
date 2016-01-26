import os
import sys
import time
import urllib
from PIL import Image
from cStringIO import StringIO
from presentations.settings import MEDIA_ROOT

TMP_ROOT = os.path.join(MEDIA_ROOT, 'tmp')

MAX_BYTES = 8388608
MAX_MEGABYTES = 8

MIN_SIZE = (1280, 960)

PICTURE_SIZES = (
    ('large', 1280, 960,),
    ('medium', 640, 480,),
    ('small', 320, 240,),
)

PROFILE_SIZES = (
    ('small', 64, 64),
    ('large', 320, 320),
)

SIZES = {
    'picture': PICTURE_SIZES,
    'profile': PROFILE_SIZES
}

ROOTS = {
    'picture': os.path.join(MEDIA_ROOT, 'pictures'),
    'profile': os.path.join(MEDIA_ROOT, 'profiles')
}

class UidGenerator(object):

    def __init__(self):
        self.uid = int(repr(time.time()).replace('.', '')[6:])

    def next(self):
        self.uid += 1
        return str(self.uid)

uid_gen = UidGenerator()


class ImageError(Exception):
    pass


def is_tmp_image(tmp_id, cat):
    tmp_id = str(tmp_id)
    sizes = SIZES[cat]
    for size in sizes:
        size_name = size[0]
        tmp_name = '%s_%s.jpg' % (tmp_id, size_name)
        if not os.path.isfile(os.path.join(TMP_ROOT, tmp_name)):
            return False
    return True


def remove_image(img_id, cat):
    img_id = str(img_id)
    sizes = SIZES[cat]
    root = ROOTS[cat]
    for size in sizes:
        size_name = size[0]
        img_name = '%s_%s.jpg' % (img_id, size_name)
        try:
            os.remove(os.path.join(root, img_name))
        except OSError:
            pass


def park_tmp_image(tmp_id, img_id, cat):
    tmp_id, img_id = str(tmp_id), str(img_id)
    sizes = SIZES[cat]
    root = ROOTS[cat]
    for size in sizes:
        size_name = size[0]
        tmp_name = '%s_%s.jpg' % (tmp_id, size_name)
        img_name = '%s_%s.jpg' % (img_id, size_name)

        try:
            os.rename(os.path.join(TMP_ROOT, tmp_name), os.path.join(root, img_name))
        except OSError, inst:
            pass


def generate_images(raw_data, cat):           
    buffer = StringIO(raw_data)

    if sys.getsizeof(buffer) > MAX_BYTES:
        raise ServerError('max file size is %dmb' % MAX_MEGABYTES)

    tmp_id = uid_gen.next()
    result = {'tmp_id': int(tmp_id), 'path': '/media/tmp/'} 
    sizes = SIZES[cat]   

    try:
        img = Image.open(buffer)

        #if img.size < MIN_SIZE:
        #    raise ServerError('image must be at least %sx%s' % MIN_SIZE)

        for size_name, width, height in sizes:
            filename = '%s_%s.jpg' % (tmp_id, size_name)
            outfile = os.path.join(TMP_ROOT, filename)
            result[size_name] = filename
            resize_image(img, outfile, (width, height))
            os.chmod(outfile, 0755)
    
    except (ValueError, IOError):
        raise ImageError('invalid image')
    except:
        raise ImageError('an error occurred')
    finally:
        buffer.close()
    
    return result


def resize_image(img, outfile, size):
    if img.mode != "RGB":
        img = img.convert("RGB")

    ox, oy = size
    oa = float(ox)/float(oy)
    ix, iy = img.size
    ia = float(ix)/float(iy)
    
    if ia > oa:
        nx = int(round(oa*float(iy), 0))
        dx = (ix - nx)/2
        xyc = (dx, 0, dx+nx, iy)
    else:
        ny = int(round(float(ix)/oa, 0))
        dy = (iy - ny)/2
        xyc = (0 , dy, ix, dy+ny)
    
    img = img.crop(xyc)
    rzo = img.resize(size, Image.ANTIALIAS)
    rzo.save(outfile, "JPEG")

