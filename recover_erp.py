import json
import os

log_path = "/Users/JSM/.gemini/antigravity/brain/69f6ca21-e04e-4f2b-bf16-caa00cf20f21/.system_generated/logs/transcript_full.jsonl"
target_base = "/Users/JSM/Developer/PCL WEBSITE/src/erp"

files_to_restore = {}

with open(log_path, 'r') as f:
    for line in f:
        try:
            data = json.loads(line)
            if "tool_calls" in data:
                for call in data["tool_calls"]:
                    if call["name"] in ("write_to_file", "replace_file_content"):
                        args = call.get("args", {})
                        target = args.get("TargetFile", "")
                        
                        # We only want to recover the frontend src files from ERP-Law-School
                        if "ERP-Law-School/frontend/src/" in target:
                            # Map the old path to the new PCL WEBSITE/src/erp path
                            rel_path = target.split("ERP-Law-School/frontend/src/")[1]
                            new_path = os.path.join(target_base, rel_path)
                            
                            content = args.get("CodeContent") or args.get("ReplacementContent")
                            if content:
                                files_to_restore[new_path] = content
        except Exception as e:
            pass

print(f"Found {len(files_to_restore)} files to restore.")

for path, content in files_to_restore.items():
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"Restored: {path}")

