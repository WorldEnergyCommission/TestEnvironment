from __future__ import annotations

import abc
import datetime
import typing
from typing import Type


from ai.interface.data_holder import DataHolder
from ai.interface.model import Model
from ai.interface.model_factory import get_model
from ai.interface.status import Status
from ai.interface.status_factory import get_status
from ai.utils.s3_utils import load_from_s3, get_ai_bucket_name, get_model_holder_dh_key, get_model_holder_model_key, \
    get_model_holder_common_status_key, CommonStatus, get_model_holder_specific_status_key, merge_status_objects, \
    delete_from_s3, store_to_s3, get_common_status, StoreMode, list_keys_in_folder, get_setpoint_optimizer_folder_path
from ai.utils.holiday_workday_utils import find_recent_working_day, is_holiday, is_working_day, \
    load_project_holidays, load_project_operating_hours


class ModelHolder(abc.ABC):
    """each specific model holder must extend this base class to make sure all required methods are implemented"""

    @abc.abstractmethod
    def __init__(self, dh: DataHolder, model: Model, status: Status) -> None:
        """creates a model holder instance"""

        self._dh = dh
        self._model = model
        self._status = status

    def get_dh(self) -> DataHolder:
        """return the attribute"""

        return self._dh

    def set_dh(self, dh: DataHolder) -> None:
        """set the attribute"""

        self._dh = dh

    def get_model(self) -> Model:
        """return the attribute"""

        return self._model

    def set_model(self, model: Model) -> None:
        """set the attribute"""

        self._model = model

    def get_status(self) -> Status:
        """return the attribute"""

        return self._status

    def set_status(self, ready: int | None = None, error: int | None = None,
                   status: str | None = None, training: bool | None = None) -> None:
        """set properties of the model holder state"""

        if ready is not None:
            self._status.ready = ready
        if error is not None:
            self._status.error = error
        if status is not None:
            self._status.status = status
        if training is not None:
            self._status.training = training

    def get_ready_from_state(self) -> int:
        """return the property of the state"""

        return self._status.ready

    def get_error_from_state(self) -> int:
        """return the property of the state"""

        return self._status.error

    def get_status_from_state(self) -> str:
        """return the property of the state"""

        return self._status.status

    def get_training_from_state(self) -> bool:
        """return the property of the state"""

        return self._status.training

    def get_dh_dict(self) -> dict[str, ...]:
        """get the dataholder dictionary"""

        return self._dh.to_dict()

    def get_status_dict(self) -> dict[str, object]:
        """get the status dictionary"""

        return self._status.to_dict()

    def get_project_id(self) -> str:
        """get the project of the model"""

        return self._dh.project_id

    def get_model_id(self) -> str:
        """get the identifier of the model"""

        return self._dh.device_id

    def get_created_at(self) -> str:
        """get the created attribute"""

        return self._dh.created_at

    def get_favorite(self) -> bool:
        """get the favorite flag"""

        return self._dh.favorite

    def set_favorite(self, favorite: bool) -> None:
        """set the favorite flag"""

        self._dh.favorite = favorite

    def get_start(self) -> int | None:
        """get the start timestamp of the model"""

        return self._dh.start

    def is_instance_of(self, type_arg: Type[object] | tuple[Type[object], ...]) -> bool:
        """check if the object is an instance of the passed class(es)"""

        return isinstance(self, type_arg)

    @staticmethod
    def store_model_holder_to_s3(model_holder: ModelHolder,
                                 dh_store: bool = False,
                                 dh_store_mode: StoreMode = StoreMode.ONLY_UPDATE,
                                 model_store: bool = False,
                                 model_store_mode: StoreMode = StoreMode.ONLY_UPDATE,
                                 common_status_store: bool = False,
                                 common_status_store_mode: StoreMode = StoreMode.ONLY_UPDATE,
                                 specific_status_store: bool = False,
                                 specific_status_store_mode: StoreMode = StoreMode.ONLY_UPDATE
                                 ) -> None:
        """save model holder to S3"""

        if dh_store:
            store_to_s3(get_ai_bucket_name(), get_model_holder_dh_key(model_holder.get_model_id()),
                        model_holder.get_dh(), dh_store_mode)
        if model_store:
            store_to_s3(get_ai_bucket_name(), get_model_holder_model_key(model_holder.get_model_id()),
                        model_holder.get_model(), model_store_mode)
        if common_status_store:
            store_to_s3(get_ai_bucket_name(), get_model_holder_common_status_key(model_holder.get_model_id()),
                        get_common_status(model_holder.get_status()), common_status_store_mode)
        if specific_status_store:
            store_to_s3(get_ai_bucket_name(), get_model_holder_specific_status_key(model_holder.get_model_id()),
                        model_holder.get_status(), specific_status_store_mode)

    @staticmethod
    def load_model_holder_from_s3(model_id: str, model_holder_type: typing.Type[ModelHolder],
                                  model_load: bool = True, status_load: bool = True) -> ModelHolder:
        """load model holder from S3"""

        dh = load_from_s3(get_ai_bucket_name(),
                          get_model_holder_dh_key(model_id))
        if not isinstance(dh, DataHolder):
            raise ValueError()
        if model_load:
            model = load_from_s3(get_ai_bucket_name(),
                                 get_model_holder_model_key(model_id))
            if not isinstance(model, Model):
                raise ValueError()
        else:
            model = get_model(dh)
        if status_load:
            common_status = load_from_s3(get_ai_bucket_name(),
                                         get_model_holder_common_status_key(model_id))
            if not isinstance(common_status, CommonStatus):
                raise ValueError()
            specific_status = load_from_s3(get_ai_bucket_name(),
                                           get_model_holder_specific_status_key(model_id))
            if not isinstance(specific_status, Status):
                raise ValueError()
            status = merge_status_objects(common_status, specific_status)
        else:
            status = get_status(dh)
        return model_holder_type(dh, model, status)

    @staticmethod
    def delete_model_holder_from_s3(model_id: str) -> None:
        """delete model holder to S3"""

        delete_from_s3(get_ai_bucket_name(), get_model_holder_dh_key(model_id))
        delete_from_s3(get_ai_bucket_name(),
                       get_model_holder_model_key(model_id))
        delete_from_s3(get_ai_bucket_name(),
                       get_model_holder_common_status_key(model_id))
        delete_from_s3(get_ai_bucket_name(),
                       get_model_holder_specific_status_key(model_id))
        for key in list_keys_in_folder(get_ai_bucket_name(), get_setpoint_optimizer_folder_path(model_id)):
            delete_from_s3(get_ai_bucket_name(), key)

    def load_project_operating_hours(self) -> dict | None:
        """Load the operating hours json for the project of this model """

        return load_project_operating_hours(self.get_project_id())

    def load_project_holidays(self) -> dict | None:
        """ Load the holiday information for the project"""
        return load_project_holidays(self.get_project_id())

    def find_recent_working_day(self) -> datetime.datetime:
        """finds the most recent workday from today using the operating hours and holidays stored in the database

        :return: most recent working day
        :rtype: datetime.datetime
        """
        return find_recent_working_day(self.get_project_id())

    def is_working_day(self, check_date: datetime.date) -> bool:
        """checks if the given date is a working day

        :param check_date: date to check
        :type check_date: datetime.date
        :return: True if working day, False if not a working day
        :rtype: bool
        """

        return is_working_day(self.get_project_id(), check_date)

    def is_holiday(self, check_date: datetime.date) -> bool:
        """checks if the given date is a holiday

        :param check_date: date to check
        :type check_date: datetime.date
        :return: True if holiday, False if non-holiday
        :rtype: bool
        """
        return is_holiday(self.get_project_id(), check_date)
