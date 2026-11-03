import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import importlib.util
spec = importlib.util.spec_from_file_location("gi", os.path.join(os.path.dirname(__file__), "generate-icons.py"))
gi = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gi)

img = gi.make_icon('normal')
vals = [c for row in img for px in row for c in px]
print("px:", img[0][0], type(img[0][0]))
print("min:", min(vals), "max:", max(vals))
print("num pixels:", len(img)*len(img[0]))
