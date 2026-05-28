import os
token = "PASTE_TOKEN_HERE"
content = f"""TELEGRAM_BOT_TOKEN={token}
GEMINI_MODEL=gemini-2.0-flash
WORKSPACE=./workspace
MAX_CONTEXT_MESSAGES=20
"""
with open(r"C:\Users\ai9\Desktop\geminiclifix\.env", "w") as f:
    f.write(content)
print(f"Wrote token (length {len(token)})")
