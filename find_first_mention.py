import json

log_path = "/Users/JSM/.gemini/antigravity/brain/aaa1e41d-070f-4c3e-99c3-e57c7660c5c8/.system_generated/logs/transcript_full.jsonl"

with open(log_path, 'r') as f:
    for line in f:
        if "CMSPreview.jsx" in line:
            print(line[:500] + "...\n")

