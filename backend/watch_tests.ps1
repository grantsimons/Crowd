# Backend test watch script
# Run this to automatically run tests when files change

.\.venv\Scripts\Activate.ps1
python -m ptw tests --runner "python -m pytest tests -q"
