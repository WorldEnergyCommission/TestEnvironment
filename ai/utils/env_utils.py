import os


def is_production_environment() -> bool:
    """checks if the server runs in a production environment"""

    if os.getenv('ENVIRONMENT') == 'PRODUCTION':
        return True
    else:
        return False


def is_development_environment() -> bool:
    """checks if the server runs in a development environment"""

    return not is_production_environment()
