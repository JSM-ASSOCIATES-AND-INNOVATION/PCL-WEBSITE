import urllib.request
import json
import re

def search_ddg_images(query, max_results=10):
    url = f"https://duckduckgo.com/?q={urllib.parse.quote(query)}&t=h_&iar=images&iax=images&ia=images"
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    
    req = urllib.request.Request(url, headers=headers)
    try:
        html = urllib.request.urlopen(req).read().decode('utf-8')
        vqd_match = re.search(r'vqd=([\d-]+)', html)
        if not vqd_match:
            print("VQD not found")
            return
        vqd = vqd_match.group(1)
        
        search_url = f"https://duckduckgo.com/i.js?q={urllib.parse.quote(query)}&o=json&vqd={vqd}"
        req = urllib.request.Request(search_url, headers=headers)
        response = urllib.request.urlopen(req).read().decode('utf-8')
        data = json.loads(response)
        
        for i, res in enumerate(data.get('results', [])[:max_results]):
            print(f"Image {i+1}: {res['image']}")
    except Exception as e:
        print("Error:", e)

search_ddg_images("Prudentia College of Law Hyderabad photos")
