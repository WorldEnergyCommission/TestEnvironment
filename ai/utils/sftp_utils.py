import logging
import os
import re

import paramiko


def initialize_sftp_session(username: str, password: str) -> paramiko.SFTPClient:
    """create a new sftp session with the passed username and password"""

    # open a transport
    transport = paramiko.Transport(
        (os.getenv('SFTP_HOST'), int(os.getenv('SFTP_PORT'))))
    # connect using username and password
    transport.connect(None, username, password)
    # open a sftp connection
    sftp_session = paramiko.SFTPClient.from_transport(transport)
    logging.info('successfully connected to the sftp server')
    return sftp_session


def get_password_from_sftp_users_config(user: str, users_config: str) -> str | None:
    """return the user password from the sftp users config environment variable"""

    pattern = re.compile(f'{re.escape(user)}:([^:]+)')
    match = re.search(pattern, users_config)
    if match is None:
        return None
    else:
        return match.group(1)
