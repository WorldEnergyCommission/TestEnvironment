from ai.interface.status import Status


class LoadMonitorStatus(Status):
    def __init__(self) -> None:
        """creates a new status instance"""

        self.load = 0.0
        super().__init__()

    def to_dict(self) -> dict[str, object]:
        """converts the status object to a dictionary"""

        return {
            "status": self.status,
            "ready": self.ready == 2,
            "debugReady": self.ready,
            "error": self.error
        }
