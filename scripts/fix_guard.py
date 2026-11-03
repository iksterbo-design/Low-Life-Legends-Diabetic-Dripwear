import io

p = 'js/app.js'
s = io.open(p, encoding='utf-8').read()

start_marker = "document.addEventListener('DOMContentLoaded', () => {"
end_marker = "  // reduced motion: already handled globally in CSS\n});\n"

assert start_marker in s, "start marker not found"
assert end_marker in s, "end marker not found"

start = s.index(start_marker)
end_idx = s.index(end_marker) + len(end_marker)

# Wrap the handler in an environment guard so Node can require() it safely
new_block = "if (typeof document !== 'undefined') {\n" + s[start:end_idx] + "\n}"
s = s[:start] + new_block + s[end_idx:]

io.open(p, 'w', encoding='utf-8').write(s)
print("Guard added OK")
