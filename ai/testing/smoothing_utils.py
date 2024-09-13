from abc import ABC, abstractmethod

import numpy as np
from scipy.signal import convolve
from scipy.signal.windows import gaussian


class SmoothingFunction(ABC):
    def __init__(self, data: list[float], offset: str):
        self.data = np.array(data)

        match offset:
            case "center":
                self.return_idx = int(len(data) / 2)
            case "start":
                self.return_idx = 0
            case "end":
                self.return_idx = -1

    @abstractmethod
    def calculate(self):
        pass


class none(SmoothingFunction):
    def calculate(self):
        return self.data[self.return_idx]


class mean(SmoothingFunction):
    def calculate(self):
        return self.data.mean()


class median(SmoothingFunction):
    def calculate(self):
        return self.data.median()


class gauss2(SmoothingFunction):
    def calculate(self):
        gaussian_kernel = gaussian(len(self.data), 5)
        gaussian_kernel /= gaussian_kernel.sum()
        smoothed_signal = convolve(self.data, gaussian_kernel, mode='same')

        return round(smoothed_signal[self.return_idx], 2)
