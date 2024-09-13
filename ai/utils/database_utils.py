import collections.abc
import logging
import os
import sys

import psycopg
import psycopg.rows
import psycopg_pool

MIN_DB_CONNS = 0
MAX_DB_CONNS = 2
MAX_CONNECTION_LIFETIME_SECONDS = 60
MAX_CONNECTION_IDLE_TIME_SECONDS = 30
POOL_TIMEOUT_SECONDS = 300


class DatabaseConnection:
    """database factory class to get a working database connection, reconnects if connection is closed"""

    db_pool: psycopg_pool.ConnectionPool = None

    @staticmethod
    def initialize_database(init_scripts: tuple[str, ...] = ()) -> None:
        """
        applies initialization scripts to the database

        :param init_scripts: the scripts that will be applied to the database
        """

        with DatabaseConnection.get_connection() as conn:
            for init_script in init_scripts:
                with conn.cursor() as cur:
                    cur.execute(init_script)
                    conn.commit()
            logging.info(
                'successfully applied the initialization scripts to the database')

    @staticmethod
    def is_connection_working() -> bool:
        """
        checks if the database connection is still working or not
        should tackle the appearing OperationalError when interfacing with the database
        in the error case a new pool should be created

        :return: if the current connection is usable or not
        """

        if DatabaseConnection.db_pool.closed:
            return False
        error_happened = False
        try:
            with DatabaseConnection.db_pool.connection() as conn:
                with conn.cursor() as cur:
                    cur.execute('SELECT * FROM pg_stat_activity')
                    _ = cur.fetchall()
        except Exception:
            error_happened = True
        return not error_happened

    @staticmethod
    def get_connection() -> collections.abc.Iterator[psycopg.Connection]:
        """
        returns a database connection from the pool

        :return: the database connection
        """

        if DatabaseConnection.db_pool is not None and DatabaseConnection.is_connection_working():
            return DatabaseConnection.db_pool.connection()
        else:
            if DatabaseConnection.db_pool is not None:
                logging.warning('lost connection to the database')
                DatabaseConnection.close_pool()
            DatabaseConnection.db_pool = DatabaseConnection.get_db_pool()

        if not DatabaseConnection.is_connection_working():
                logging.error('connection database is not working...')
                sys.exit(1)
                
        return DatabaseConnection.db_pool.connection()

    @staticmethod
    def get_db_pool() -> psycopg_pool.ConnectionPool:
        """
        initializes a new database connection pool

        :return: a new connection pool
        """

        connection_string = \
            f'postgres://{os.getenv("DB_USER")}:{os.getenv("DB_PASS")}' \
            f'@{os.getenv("DB_ADDR")}:{os.getenv("DB_PORT")}/{os.getenv("DB_NAME")}?sslmode={os.getenv("DB_MODE")}'
        try:
            db_pool = psycopg_pool.ConnectionPool(connection_string,
                                                  min_size=MIN_DB_CONNS, max_size=MAX_DB_CONNS,
                                                  max_lifetime=MAX_CONNECTION_LIFETIME_SECONDS,
                                                  max_idle=MAX_CONNECTION_IDLE_TIME_SECONDS,
                                                  timeout=POOL_TIMEOUT_SECONDS)
        except psycopg_pool.PoolTimeout as e:
            logging.error(f'exception occured when initializing connection pool: {repr(e)}')
            sys.exit(1)
        logging.info('successfully connected to the postgresql database')
        return db_pool

    @staticmethod
    def close_pool() -> None:
        """closes the database connection pool"""

        if DatabaseConnection.db_pool is not None:
            DatabaseConnection.db_pool.close()

    @staticmethod
    def get_data_from_query(query: str, arguments: tuple) -> collections.abc.Iterable[psycopg.rows.Row]:
        """list result rows for a database query"""

        # create a cursor
        with DatabaseConnection.get_connection() as conn:
            with conn.cursor(row_factory=psycopg.rows.namedtuple_row) as cur:
                # execute the query
                cur.execute(query, arguments)
                # fetch all result rows
                result_rows = cur.fetchall()
                # return the results
                return result_rows
