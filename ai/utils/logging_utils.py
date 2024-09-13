import logging

import logging.handlers
import multiprocessing


FORMAT = '%(asctime)s.%(msecs)03d %(processName)-10s %(name)s %(levelname)-8s %(message)s'
DATEFORMAT = '%Y-%m-%d %H:%M:%S'


def configure_logging_listener(log_file_path: str | None, log_level: int) -> None:
    """configure the logger listener process"""

    root = logging.getLogger()
    formatter = logging.Formatter(FORMAT, DATEFORMAT)
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    root.addHandler(console_handler)

    if log_file_path is not None:
        file_handler = logging.handlers.RotatingFileHandler(
            log_file_path, 'a', 5000000, 10)
        file_handler.setFormatter(formatter)
        root.addHandler(file_handler)

    root.setLevel(log_level)


def configure_worker_logging(logger: logging.Logger, queue: multiprocessing.Queue, log_level: int) -> None:
    """configure multiprocessing logger for worker"""

    queue_handler = logging.handlers.QueueHandler(
        queue)  # just this one handler needed
    logger.addHandler(queue_handler)
    logger.setLevel(log_level)
