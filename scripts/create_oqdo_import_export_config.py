import json
import logging

import pandas as pd
import tap


class ScriptArgumentParser(tap.Tap):
    data_point_xlsx_file_path: str


def convert_text_to_bool(text: str) -> bool:
    return text == 'x'


def is_variable_row_relevant(row: pd.Series) -> bool:
    lower_case_variable_name = row.variable_name.lower()
    return lower_case_variable_name.endswith('vorlauftemperatur.value') or lower_case_variable_name.endswith(
        'ruecklauftemperatur.value') or lower_case_variable_name.endswith('extsetpoint')


def shorten_variable_name(name: str) -> str:
    replacements = (('SeniorenresidenzBadVöslauHaus', 'SRBVH'), ('FBHHallenbad', 'FBHH'),
                    ('ErwärmungBadewasser', 'EB'), ('RADAppartments', 'RADAP'), ('RADAllgemein', 'RADAG'),
                    ('FBHCafe/Restaurant', 'FBHCR'), ('FBHHalle/Therapie', 'FBHHT'), ('RADHaus', 'RADH'),
                    ('Frnwärme', 'FW'), ('Vorlauftemperatur', 'VLT'), ('Vorlauf', 'VL'),
                    ('Temperaturregelung', 'TR'), ('Regler', 'RG'), ('Ruecklauftemperatur', 'RLT'),
                    ('Ruecklauf', 'RL'), ('Primaerruecklauftemperatur', 'PRLT'),
                    ('Primaervorlauftemperatur', 'PVLT'))
    modified_name = name
    for search_string, replacement_string in replacements:
        modified_name = modified_name.replace(search_string, replacement_string)
    return modified_name


def get_relevant_data_points_from_table(data_point_table: pd.DataFrame) -> pd.DataFrame:
    heating_circuit, designation, resource_group_id_and_object_id, variable_name, type_name, unit, can_read, can_write = data_point_table.columns
    data_point_table.drop(columns=[type_name, unit], inplace=True)
    data_point_table['variable_id'] = \
        data_point_table[resource_group_id_and_object_id].astype(str).apply(lambda x: x.replace('/', '.')) + '.' + \
        data_point_table[variable_name].astype(str)
    data_point_table.drop(columns=[resource_group_id_and_object_id], inplace=True)
    data_point_table['can_read'] = data_point_table[can_read].astype(str).apply(convert_text_to_bool)
    data_point_table['can_write'] = data_point_table[can_write].astype(str).apply(convert_text_to_bool)
    data_point_table.drop(columns=[can_read, can_write], inplace=True)
    data_point_table['variable_name'] = \
        data_point_table[heating_circuit].astype(str) + '.' + \
        data_point_table[designation].astype(str).apply(lambda x: x.replace('->', '.').replace(' ', '')) + '.' + \
        data_point_table[variable_name].astype(str)
    data_point_table.drop(columns=[variable_name, heating_circuit, designation], inplace=True)
    data_point_table = data_point_table[data_point_table.apply(is_variable_row_relevant, axis=1)].copy()
    data_point_table['variable_name'] = data_point_table['variable_name'].apply(shorten_variable_name)
    assert data_point_table['variable_name'].apply(lambda x: len(x)).max() <= 50
    return pd.DataFrame(data_point_table)


def create_import_config(data_point_table: pd.DataFrame):
    variable_config = {}
    import_config = {'oqdo': variable_config}
    for _, row in data_point_table.iterrows():
        if row.can_read:
            variable_config[row.variable_id] = row.variable_name
    with open('import_config.json', 'w') as file:
        json.dump(import_config, file)


def create_export_config(data_point_table: pd.DataFrame):
    variable_config = {}
    export_config = {'oqdo': variable_config}
    for _, row in data_point_table.iterrows():
        if row.can_write:
            variable_config[row.variable_name] = row.variable_id
    with open('export_config.json', 'w') as file:
        json.dump(export_config, file)


def main() -> None:
    logging.getLogger().setLevel(logging.INFO)
    args = ScriptArgumentParser().parse_args()
    data_point_table = pd.read_excel(args.data_point_xlsx_file_path)
    data_point_table = get_relevant_data_points_from_table(data_point_table)
    create_import_config(data_point_table)
    create_export_config(data_point_table)


if __name__ == '__main__':
    main()
