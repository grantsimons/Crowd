
# this only works if you have everything set up for testing. 
# this is just the recurring command for testing

.\.venv\Scripts\Activate.ps1
python -m pytest tests -q
