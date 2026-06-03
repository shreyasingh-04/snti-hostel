# app/core/sheets.py
# Optional Google Sheets sync — appends a row when a trainee registers.
# Set GOOGLE_SHEET_ID and GOOGLE_CREDENTIALS_PATH in .env to enable.

from app.core.config import settings

def get_sheet():
    """Returns the first worksheet of the configured Google Sheet, or None if not configured."""
    if not settings.GOOGLE_SHEET_ID or not settings.GOOGLE_CREDENTIALS_PATH:
        return None
    try:
        import gspread
        from google.oauth2.service_account import Credentials
        scopes = ["https://www.googleapis.com/auth/spreadsheets"]
        creds = Credentials.from_service_account_file(settings.GOOGLE_CREDENTIALS_PATH, scopes=scopes)
        gc = gspread.authorize(creds)
        sh = gc.open_by_key(settings.GOOGLE_SHEET_ID)
        ws = sh.sheet1
        # Write header if sheet is empty
        if ws.row_count == 0 or not ws.row_values(1):
            ws.append_row(["Name","Email","Trainee ID","Type","Block","Mess Type","Registered At","Expires At"])
        return ws
    except Exception as e:
        print(f"[Sheets] Could not connect to Google Sheets: {e}")
        return None

async def sync_registration_to_sheet(user):
    """Appends a new trainee registration row to Google Sheets."""
    ws = get_sheet()
    if not ws:
        return
    try:
        ws.append_row([
            user.name, user.email, user.trainee_id,
            user.trainee_type or "-", user.hostel_block or "-",
            user.mess_type or "-",
            user.created_at.strftime("%Y-%m-%d"),
            user.expires_at.strftime("%Y-%m-%d") if user.expires_at else "-",
        ])
        print(f"[Sheets] Synced {user.name} to Google Sheets.")
    except Exception as e:
        print(f"[Sheets] Sync failed: {e}")
