--------------- PV -------------
INSERT INTO data_mapping_types("id", "name", description)
values (
        'c84bf644-1290-441a-86a9-b3b40e73aa5c',
        'PV System',
        'Photovoltaik System mapping for Power and an optional error state'
    );
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group")
values (
        'power',
        'c84bf644-1290-441a-86a9-b3b40e73aa5c',
        false,
        'kW',
        'View'
    );


--------------- Grid -------------
INSERT INTO data_mapping_types("id", "name", description)
values (
        '85354087-07a6-459e-b524-2302e0ebc922',
        'Grid System',
        'Grid connection mapping for Power and an optional error state'
    );
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group")
values (
        'power',
        '85354087-07a6-459e-b524-2302e0ebc922',
        false,
        'kW',
        'View'
    );

    
--------------- Battery -------------
INSERT INTO data_mapping_types("id", "name", description)
values (
        '9b455a11-26b4-4058-9fad-c2a4db23a2fc',
        'Battery System',
        'Battery System mapping'
    );
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group")
values (
        'power',
        '9b455a11-26b4-4058-9fad-c2a4db23a2fc',
        false,
        'kW',
        'View'
    );
INSERT INTO data_mapping_type_properties ("name", type_id, optional, unit, "group")
values (
        'soc',
        '9b455a11-26b4-4058-9fad-c2a4db23a2fc',
        false,
        '%',
        'AdditionalView'
    );