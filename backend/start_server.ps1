
# for windows 
# run this file in the terminal to start the backend
# these are the only terminal commands that need to be run each time you want to start the beckend 

.\.venv\Scripts\Activate.ps1
$env:DATABASE_URL = "sqlite:///./app.db"
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
