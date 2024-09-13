import collections.abc


def batch(iterable: collections.abc.Iterable, batch_size: int = 1) -> collections.abc.Iterable:
    """turn the input iterable into batches"""

    length = len(iterable)
    for start_index in range(0, length, batch_size):
        yield iterable[start_index:min(start_index + batch_size, length)]
