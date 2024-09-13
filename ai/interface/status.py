import abc


class Status(abc.ABC):
    """each specific status must extend this base class to make sure all required methods are implemented"""

    @abc.abstractmethod
    def __init__(self, ready: int = 0, error: int = 1,
                 status: str = "", training: bool = False) -> None:
        """creates a status object

        :param ready: indicates if the controller is ready for optimization
            0 - not ready,
            1 - ready, not completed first optimization step,
            2 - ready, completed first optimization step
        :param error: indicates if there has been an error
            0 - no error
            1 - warning
            2 - error
        :param status: text which describes the current controller state
        :param training: indicates if the model is currently in training or not
        """

        self.ready = ready
        self.error = error
        self.status = status
        self.training = training

    @abc.abstractmethod
    def to_dict(self) -> dict[str, object]:
        """creates a dict representation of the status instance"""

        pass
