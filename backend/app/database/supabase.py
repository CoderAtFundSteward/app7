import os

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()


def get_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL", "")
    key = (
        os.getenv("SUPABASE_SERVICE_KEY")
        or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        or os.getenv("SUPABASE_ANON_KEY", "")
    )
    if not url or not key:
        raise RuntimeError(
            "Supabase credentials are missing. Set SUPABASE_URL and SUPABASE_SERVICE_KEY "
            "(or SUPABASE_SERVICE_ROLE_KEY / SUPABASE_ANON_KEY)."
        )
    return create_client(url, key)
