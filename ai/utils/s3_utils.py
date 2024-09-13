from __future__ import annotations

import abc
import enum
import inspect
import io
import logging
import os

import dill
import minio
import minio.error
import urllib3

from ai.interface.status import Status
from ai.utils.env_utils import is_development_environment
from ai.utils.request_utils import (DEFAULT_MAX_HOST_POOLS, DEFAULT_MAX_CONNECTIONS_PER_HOST_POOL,
                                    DEFAULT_RETRY_CONFIG, DEFAULT_POOL_BLOCK, HIGH_TIMEOUT_SECONDS)


class VersionedClass(abc.ABC):
    def __reduce__(self):
        """implemented a general reduce method"""

        return self.__class__.from_class_dict, (self.to_class_dict(),)

    def to_class_dict(self) -> dict[str, ...]:
        """implemented a general to class dict method"""

        return {**self.__dict__, 'version': self.version}

    @classmethod
    def from_class_dict(cls, class_dict: dict[str, ...]) -> VersionedClass:
        """implemented a general from class dict method"""

        # get the version from the class dict and remove it
        if 'version' not in class_dict:
            raise ValueError
        version = class_dict.pop('version')

        # make adaptations to the class dict for each version jump
        class_dict = cls.class_dict_adaptions(version, class_dict)

        # filter out the required arguments
        init_argument_names = inspect.getfullargspec(cls.__init__)[0][1:]
        required_arguments = {key: value for key, value in class_dict.items() if key in init_argument_names}

        # create the instance
        instance = cls(**required_arguments)

        # set the attributes
        for key, value in class_dict.items():
            # check if key is present in most recent version
            if key in instance.__dict__:
                setattr(instance, key, value)

        # return the instance
        return instance

    @classmethod
    @abc.abstractmethod
    def class_dict_adaptions(cls, version: int, class_dict: dict[str, ...]) -> dict[str, ...]:
        """sample implementation"""

        return class_dict

    @property
    @abc.abstractmethod
    def version(self) -> int:
        """sample implementation"""

        return 1


class StoreMode(enum.Enum):
    ONLY_CREATE = 1
    ONLY_UPDATE = 2
    CREATE_AND_UPDATE = 3

    @staticmethod
    def create_allowed(store_mode: StoreMode):
        """check if the store mode supports creating"""

        return store_mode in (StoreMode.ONLY_CREATE, StoreMode.CREATE_AND_UPDATE)

    @staticmethod
    def update_allowed(store_mode: StoreMode):
        """check if the store mode supports updating"""

        return store_mode in (StoreMode.ONLY_UPDATE, StoreMode.CREATE_AND_UPDATE)


class CommonStatus(Status):
    def __init__(self, ready: int, error: int, status: str, training: bool) -> None:
        self.ready = ready
        self.error = error
        self.status = status
        self.training = training

    def to_dict(self) -> dict[str, object]:
        """method that should be overwritten"""

        return {}


def get_common_status(status: Status):
    """create a common status from a generic status"""

    return CommonStatus(status.ready, status.error, status.status, status.training)


def merge_status_objects(common_status: CommonStatus, specific_status: Status):
    """merge a specific status with a generic status"""

    specific_status.ready = common_status.ready
    specific_status.error = common_status.error
    specific_status.status = common_status.status
    specific_status.training = common_status.training
    return specific_status


def get_ai_bucket_name() -> str:
    """return the bucket name"""

    return f'efficientio-{os.getenv("CLUSTER_NAME")}-s3-bucket'


def get_ai_folder_name() -> str:
    """return the top-level folder name"""

    return 'aiserver'


def get_weather_holders_folder_name() -> str:
    """return the specific folder name"""

    return 'weatherholders'


def get_model_holders_folder_name() -> str:
    """return the specific folder name"""

    return 'modelholders'


def get_weather_holder_key(project_id: str) -> str:
    """return the specific key"""

    return f'{get_ai_folder_name()}/{get_weather_holders_folder_name()}/{project_id}'


def get_dh_folder_name() -> str:
    """return the specific folder name"""

    return 'dh'


def get_model_folder_name() -> str:
    """return the specific folder name"""

    return 'model'


def get_status_folder_name() -> str:
    """return the specific folder name"""

    return 'status'


def get_setpoint_optimizer_folder_name() -> str:
    """return the specific folder name"""

    return 'setpoint_optimizer'


def get_study_folder_name() -> str:
    """return the specific folder name"""

    return 'study'


def get_best_params_folder_name() -> str:
    """return the specific folder name"""

    return 'best_params'


def get_model_holder_dh_key(model_id: str) -> str:
    """return the specific key"""

    return f'{get_ai_folder_name()}/{get_model_holders_folder_name()}/{model_id}/{get_dh_folder_name()}'


def get_model_holder_model_key(model_id: str) -> str:
    """return the specific key"""

    return f'{get_ai_folder_name()}/{get_model_holders_folder_name()}/{model_id}/{get_model_folder_name()}'


def get_model_holder_common_status_key(model_id: str) -> str:
    """return the specific key"""

    return f'{get_ai_folder_name()}/{get_model_holders_folder_name()}/{model_id}/{get_status_folder_name()}/common'


def get_model_holder_specific_status_key(model_id: str) -> str:
    """return the specific key"""

    return f'{get_ai_folder_name()}/{get_model_holders_folder_name()}/{model_id}/{get_status_folder_name()}/specific'


def get_setpoint_optimizer_folder_path(model_id: str) -> str:
    """get setpoint optimizer folder name"""

    return f'{get_ai_folder_name()}/{get_model_holders_folder_name()}/{model_id}/{get_setpoint_optimizer_folder_name()}'


def get_setpoint_optimizer_study_key(model_id: str, system: str) -> str:
    """return the specific key"""

    return f'{get_setpoint_optimizer_folder_path(model_id)}/{get_study_folder_name()}/{system}'


def get_setpoint_optimizer_best_params_key(model_id: str, system: str) -> str:
    """return the specific key"""

    return f'{get_setpoint_optimizer_folder_path(model_id)}/{get_best_params_folder_name()}/{system}'


def log_s3_error(message: str, e: Exception) -> None:
    """log error that happened during S3 operation"""

    logging.error(f'S3_ERROR: \'{message}\' caused by {repr(e)}')


def is_s3_client_connected(s3_client: minio.Minio, do_connection_check: bool = True,
                           test_bucket_name: str = 'test_bucket_name') -> bool:
    """check if the client is successfully connected"""

    try:
        if do_connection_check:
            s3_client.bucket_exists(test_bucket_name)
        return True
    except minio.error.MinioException:
        return False


class S3Connection:
    """s3 client factory class to get a working s3 client connection, reconnects if connection is closed"""

    s3_client: minio.Minio | None = None

    @staticmethod
    def get_s3_client() -> minio.Minio:
        """returns an s3 client"""

        if S3Connection.s3_client is None or not is_s3_client_connected(S3Connection.s3_client):
            S3Connection.s3_client = create_s3_client()
        return S3Connection.s3_client


def create_s3_client() -> minio.Minio:
    """creates a new S3 client"""

    s3_client = minio.Minio(
        endpoint=os.getenv('S3_ENDPOINT'),
        access_key=os.getenv('S3_ACCESS_KEY'),
        secret_key=os.getenv('S3_SECRET_KEY'),
        secure=bool(int(os.getenv('S3_SECURE'))),
        http_client=urllib3.poolmanager.PoolManager(
            num_pools=DEFAULT_MAX_HOST_POOLS,
            maxsize=DEFAULT_MAX_CONNECTIONS_PER_HOST_POOL,
            retries=DEFAULT_RETRY_CONFIG,
            block=DEFAULT_POOL_BLOCK,
            timeout=HIGH_TIMEOUT_SECONDS)
    )
    if is_s3_client_connected(s3_client):
        return s3_client
    else:
        exception = minio.error.MinioException()
        log_s3_error('cannot create client', exception)
        raise exception


def does_key_exist(bucket: str, key: str) -> bool:
    """checks if the specified key exists"""

    s3_client = S3Connection.get_s3_client()
    try:
        s3_client.stat_object(bucket, key)
        return True
    except minio.error.MinioException:
        return False


def ensure_bucket_exists(bucket: str) -> None:
    """creates the bucket if it is not there"""

    s3_client = S3Connection.get_s3_client()
    if not s3_client.bucket_exists(bucket):
        s3_client.make_bucket(bucket)
        logging.debug(f'created {bucket}')


def list_keys_in_folder(bucket: str, folder: str) -> list[str]:
    """list all keys in a folder in S3"""

    try:
        s3_client = S3Connection.get_s3_client()
        return list(map(lambda x: x.object_name, s3_client.list_objects(bucket, folder, recursive=True)))
    except minio.error.MinioException as e:
        log_s3_error(f'cannot list keys for folder {folder} in bucket {bucket}', e)
        raise e
    except Exception as ex:
        logging.error(f'cannot list keys for folder {folder} in bucket {bucket}', ex)
        raise ex


def store_to_s3(bucket: str, key: str, obj: object, store_mode: StoreMode) -> None:
    """stores an object to S3"""

    if is_development_environment():
        return
    try:
        ensure_bucket_exists(bucket)
        key_exists = does_key_exist(bucket, key)
        if not key_exists and not StoreMode.create_allowed(store_mode):
            return
        if key_exists and not StoreMode.update_allowed(store_mode):
            return
        pickled_object = dill.dumps(obj)
        s3_client = S3Connection.get_s3_client()
        s3_client.put_object(bucket, key, data=io.BytesIO(pickled_object), length=len(pickled_object))
        logging.debug(f'stored data in bucket {bucket} with key {key}')
    except minio.error.MinioException as e:
        log_s3_error(f'cannot store object to key {key} in bucket {bucket}', e)
        raise e
    except Exception as ex:
        logging.error(f'cannot store object to key {key} in bucket {bucket}', ex)
        raise ex


def load_from_s3(bucket: str, key: str) -> object:
    """loads an object from S3"""

    response = None
    try:
        s3_client = S3Connection.get_s3_client()
        response = s3_client.get_object(bucket, key)
        obj = dill.loads(response.read())
        logging.debug(f'loaded data from bucket {bucket} with key {key}')
        return obj
    except minio.error.MinioException as e:
        log_s3_error(f'cannot load object from key {key} in bucket {bucket}', e)
        raise e
    except Exception as ex:
        logging.error(f'cannot load object from key {key} in bucket {bucket}', ex)
        raise ex
    finally:
        if response is not None:
            response.close()
            response.release_conn()


def delete_from_s3(bucket: str, key: str) -> None:
    """deletes on object from S3"""

    try:
        s3_client = S3Connection.get_s3_client()
        s3_client.remove_object(bucket, key)
    except minio.error.MinioException as e:
        log_s3_error(f'cannot delete object from key {key} in bucket {bucket}', e)
        raise e
    except Exception as ex:
        logging.error(f'cannot delete object from key {key} in bucket {bucket}', ex)
        raise ex
