from ai.interface.status import Status


class PvMonitoringServiceStatus(Status):
    def __init__(self) -> None:
        """creates a new status instance"""

        super().__init__()
        self.efficiency = 0
        self.last_three_days = [100, 100, 100]
        self.last_update_day = 0

    def to_dict(self) -> dict[str, object]:
        """converts the status object to a dictionary"""

        return {
            "status": self.status,
            "ready": self.ready == 2,
            "debugReady": self.ready,
            "error": self.error
        }
