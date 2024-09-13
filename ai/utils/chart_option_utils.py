from __future__ import annotations


class ChartOption:
    """this object contains information about a chart"""

    def __init__(self, agg: str, name: str, scaling: dict[str: float],
                 type_name: str, unit: str, var: str, series_type: str = "View") -> None:
        """inits the chart option with the passed parameters

        :param agg: aggregation type of the variable
        :param name: name of the variable
        :param type_name: type of the variable
        :param unit: unit of the variable
        :param var: name of the variable
        :param series_type: can either be 'View' or 'Calculation'
        """

        self.agg = agg
        self.name = name
        self.scaling = scaling
        self.type_name = type_name
        self.unit = unit
        self.var = var
        self.series_type = series_type

    def to_dict(self) -> dict[str, object]:
        """creates a dictionary from a chart option instance"""

        return {
            "agg": self.agg,
            "name": self.name,
            "scaling": self.scaling,
            "type": self.type_name,
            "unit": self.unit,
            "var": self.var,
            "seriesType": self.series_type
        }

    @classmethod
    def from_dict(cls, d: dict[str, object]) -> ChartOption:
        """creates a new chart option from a dictionary"""

        return cls(agg=str(d["agg"]), name=str(d["name"]), scaling=d["scaling"],
                   type_name=str(d["type"]), unit=str(d["unit"]), var=str(d["var"]))
