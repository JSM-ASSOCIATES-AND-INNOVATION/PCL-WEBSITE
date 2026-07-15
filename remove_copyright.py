import os

HEADER_JS = """/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

"""

HEADER_CSS = """/*
 * Copyright (c) 2026 JSM Associates and Innovation. All rights reserved.
 * 
 * This code is the exclusive property of JSM Associates and Innovation.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 */

"""

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if content.startswith(HEADER_JS):
            content = content[len(HEADER_JS):]
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Removed header from {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")

for root, _, files in os.walk('src'):
    for file in files:
        if file.endswith(('.js', '.jsx', '.css')):
            process_file(os.path.join(root, file))
