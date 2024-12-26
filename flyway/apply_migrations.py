import os
import subprocess


def get_database_urls() -> list[str, ...]:
    database_base_url = os.getenv('DATABASE_BASE_URL')
    database_names = os.getenv('DATABASE_NAMES').split(',')
    return list(map(lambda x: f'{database_base_url}{x}?sslmode={os.getenv("POSTGRES_SSLMODE")}', database_names))


def get_host_port_name_ssl_mode_from_url(database_url: str) -> tuple[str, str, str, str]:
    modified_argument = database_url.replace('jdbc:postgresql://', '')
    host_and_port, name_and_ssl_mode_argument = modified_argument.split('/')
    host, port = host_and_port.split(':')
    name, ssl_mode_argument = name_and_ssl_mode_argument.split('?')
    ssl_mode = ssl_mode_argument.replace('sslmode=', '')
    return host, port, name, ssl_mode


def create_database(database_url: str) -> None:
    host, port, name, ssl_mode = get_host_port_name_ssl_mode_from_url(database_url)
    try:
        if not check_db_exists(database_url):
            subprocess.run(['createdb', '-h', host, '-p', port, '-U', os.getenv('FLYWAY_USER'), name],
                        env={**os.environ, 'PGPASSWORD': os.getenv('FLYWAY_PASSWORD'), 'PGSSLMODE': ssl_mode},
                        check=True)
    except subprocess.CalledProcessError:
        pass


def check_db_exists(database_url: str) -> bool:
    host, port, name, ssl_mode = get_host_port_name_ssl_mode_from_url(database_url)
    command = f"SELECT 1 FROM pg_database WHERE datname='{name}'"
    db_exists = subprocess.run(['psql', '-h', host, '-p', port, '-U', os.getenv('FLYWAY_USER'), '-X', '-c', command],
                   env={**os.environ, 'PGPASSWORD': os.getenv('FLYWAY_PASSWORD'), 'PGSSLMODE': ssl_mode},
                   check=True).stdout.decode('utf-8').strip()
    return db_exists == 1


def execute_sql_command(database_url: str, command: str) -> None:
    host, port, name, ssl_mode = get_host_port_name_ssl_mode_from_url(database_url)
    subprocess.run(['psql', '-h', host, '-p', port, '-U', os.getenv('FLYWAY_USER'), '-d', name, '-X', '-c', command],
                   env={**os.environ, 'PGPASSWORD': os.getenv('FLYWAY_PASSWORD'), 'PGSSLMODE': ssl_mode}, check=True)


def apply_updates(database_url: str) -> None:
    execute_sql_command(database_url, 'CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;')
    execute_sql_command(database_url, 'ALTER EXTENSION timescaledb UPDATE;')
    execute_sql_command(database_url, 'CREATE EXTENSION IF NOT EXISTS timescaledb_toolkit CASCADE;')
    execute_sql_command(database_url, 'ALTER EXTENSION timescaledb_toolkit UPDATE;')
    execute_sql_command(database_url, 'CREATE EXTENSION IF NOT EXISTS plpgsql CASCADE;')
    execute_sql_command(database_url, 'ALTER EXTENSION plpgsql UPDATE;')
    execute_sql_command(database_url, 'CREATE EXTENSION IF NOT EXISTS dblink CASCADE;')
    execute_sql_command(database_url, 'ALTER EXTENSION dblink UPDATE;')


def apply_schema(database_url: str) -> None:
    _, _, name, _ = get_host_port_name_ssl_mode_from_url(database_url)
    sql_script_folder = os.path.join(os.getenv('SCRIPTS_BASE_PATH'), name)
    if os.path.exists(sql_script_folder):
        subprocess.run(['flyway', 'migrate', '-validateOnMigrate=false'],
                       env={**os.environ, 'FLYWAY_URL': database_url,
                            'FLYWAY_LOCATIONS': f'filesystem:{sql_script_folder}'}, check=True)


def main() -> None:
    for database_url in get_database_urls():
        create_database(database_url)
        apply_updates(database_url)
        apply_schema(database_url)


if __name__ == '__main__':
    main()
