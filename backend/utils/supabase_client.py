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