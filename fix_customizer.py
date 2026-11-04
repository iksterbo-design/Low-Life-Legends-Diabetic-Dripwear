import io

path = 'js/app.js'
s = io.open(path, encoding='utf-8').read()

old = """function applyCustomizer() {
  const base = BASE_COLORS.find(b => b.id === $('#customizer-base').value) || BASE_COLORS[0];
  const style = GRAPHIC_STYLES.find(g => g.id === $('#customizer-graphic').value) || GRAPHIC_STYLES[0];
  const role = ROLES.find(r => r === $('#customizer-role').value) || ROLES[0];
  const size = SIZES.find(s => s === $('#customizer-size').value) || SIZES[11];
  const el = $('#shirt-mockup');
  const isWhite = base.id === 'white';
  el.style.background = isWhite ? '#fff' : base.hex;
  // graphic depends on colorway for visual
  const graphic = $('#customizer-graphic').value;"""

new = """function applyCustomizer() {
  const base = BASE_COLORS.find(b => b.id === $('input[name="base"]:checked').value) || BASE_COLORS[0];
  const style = GRAPHIC_STYLES.find(g => g.id === $('input[name="style"]:checked').value) || GRAPHIC_STYLES[0];
  const role = ROLES.find(r => r === $('#customizer-role').value) || ROLES[0];
  const size = SIZES.find(s => s === $('#customizer-size').value) || SIZES[11];
  const isWhite = base.id === 'white';
  $('#shirt-mockup').style.background = isWhite ? '#fff' : base.hex;
  // graphic depends on colorway for visual
  const graphic = $('input[name="style"]:checked').value;"""

assert old in s, "OLD block not found"
s = s.replace(old, new)
io.open(path, 'w', encoding='utf-8').write(s)
print("OK; replaced", len(old), "chars ->", len(new))
