import json

from ai.interface.data_holder import DataHolder
from ai.utils.database_utils import DatabaseConnection


def update_request(dh: DataHolder) -> None:
    """store the data holder into the database"""

    with DatabaseConnection.get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE models SET r = %s WHERE id = %s", (json.dumps(dh.to_dict()),
                                                                   dh.device_id))
            conn.commit()


def save_request(dh: DataHolder) -> None:
    """store the data holder into the database"""

    with DatabaseConnection.get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("INSERT INTO models(r, id) VALUES (%s, %s)", (json.dumps(dh.to_dict()),
                                                                      dh.device_id))
            conn.commit()


def delete_request(model_id: str) -> None:
    """delete the model with the passed id"""

    with DatabaseConnection.get_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM models WHERE id = %s", (model_id,))
            conn.commit()
