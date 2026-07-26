from supabase import create_client, Client
from loguru import logger
from dotenv import load_dotenv
import os

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_KEY")

if not url or not key:
    logger.warning("Supabase credentials not found — database features disabled")
    supabase = None
else:
    supabase: Client = create_client(url, key)
    logger.info("Supabase client initialized")

def get_user_from_token(token: str):
    """
    Takes the token sent from the frontend, asks Supabase who it belongs to.
    Returns the user id if valid, None if not.
    """
    if supabase is None or not token:
        return None
    try:
        response = supabase.auth.get_user(token)
        return response.user.id
    except Exception as e:
        logger.warning(f"Invalid or expired token: {e}")
        return None