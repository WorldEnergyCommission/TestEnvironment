import requests.adapters
import urllib3

DEFAULT_MAX_HOST_POOLS = 128
DEFAULT_MAX_CONNECTIONS_PER_HOST_POOL = 128
DEFAULT_RETRY_CONFIG = urllib3.util.retry.Retry(connect=3, backoff_factor=0.5)
DEFAULT_POOL_BLOCK = False

MEDIUM_TIMEOUT_SECONDS = 60
HIGH_TIMEOUT_SECONDS = 600


class RequestSession:
    """session factory class used to get a session for http requests"""

    session: requests.Session = None

    @staticmethod
    def get_session() -> requests.Session:
        """returns the session object"""

        if RequestSession.session is None:
            session = requests.Session()
            adapter = requests.adapters.HTTPAdapter(
                pool_connections=DEFAULT_MAX_HOST_POOLS,
                pool_maxsize=DEFAULT_MAX_CONNECTIONS_PER_HOST_POOL,
                max_retries=DEFAULT_RETRY_CONFIG,
                pool_block=DEFAULT_POOL_BLOCK)
            session.mount('http://', adapter)
            session.mount('https://', adapter)
            RequestSession.session = session
        return RequestSession.session
