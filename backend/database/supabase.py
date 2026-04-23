import os

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()


def get_supabase_client() -> Client:
    """
    Supabase client for backend server use.
    Expects:
    - SUPABASE_URL
    - SUPABASE_SERVICE_KEY
    """
    url = os.getenv("SUPABASE_URL")
    service_key = os.getenv("SUPABASE_SERVICE_KEY")

    if not url or not service_key:
        raise RuntimeError(
            "Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_SERVICE_KEY."
        )

    return create_client(url, service_key)
