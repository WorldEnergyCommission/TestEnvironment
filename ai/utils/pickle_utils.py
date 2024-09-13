import os
import pickle


def is_valid_pickle_path(path: str) -> bool:
    """checks if the path is a valid pickle file"""

    if not os.path.exists(path):
        return False
    try:
        with open(path, 'rb') as pickle_file:
            pickle.load(pickle_file)
        return True
    except EOFError:
        return False
