import collections
import dataclasses

import requests
import tap
import urllib3.exceptions

MPC_BASE_URLS = ['https://mpc.efficientio.com',
                 'https://mpc.tsg-portal.de',
                 'https://mpc.connect.peneder.com',
                 'https://mpc.leo-b2b.burgenlandenergie.at']


@dataclasses.dataclass(order=True, frozen=True, kw_only=True)
class Status:
    ready: bool
    debug_ready: int
    status: str
    error: int


class ScriptArgumentParser(tap.Tap):
    project_id: str | None = None
    model_id: str | None = None
    status_character_limit: int = 128


def is_model_state_working(status: Status) -> bool:
    return status.ready and status.debug_ready == 2 and \
           status.status in ('running', 'running, updated') and status.error == 0


def list_erroneous_models(mpc_base_url: str, args: ScriptArgumentParser) -> None:
    error_messages: dict[str, int] = collections.defaultdict(int)
    erroneous_models: dict[str, tuple[str, str, Status]] = {}
    working_models: dict[str, tuple[str, str, Status]] = {}
    all_model_ids = [x['id'] for x in requests.get(
        f'{mpc_base_url}/controllers', verify=False).json()]
    for model_id in all_model_ids:
        if args.model_id is not None and args.model_id != model_id:
            continue
        response_object = requests.get(
            f'{mpc_base_url}/{model_id}', verify=False).json()
        project_id = response_object['project_id']
        if args.project_id is not None and args.project_id != project_id:
            continue
        meta_data = response_object['data']['meta']
        type_name = response_object['data']['type']
        debug_ready = meta_data['debugReady'] if type_name != 'SetpointOptimizer' else meta_data['debug_ready']
        status_message = meta_data['status'][:args.status_character_limit]
        status = Status(ready=meta_data['ready'], debug_ready=debug_ready,
                        status=status_message, error=meta_data['error'])
        model = type_name, project_id, status
        if is_model_state_working(status):
            working_models[model_id] = model
        else:
            erroneous_models[model_id] = model
            error_messages[status_message] += 1
    erroneous_model_amount = len(erroneous_models)
    working_model_amount = len(working_models)
    all_model_amount = erroneous_model_amount + working_model_amount
    output = f'***** ai statistics for {mpc_base_url} *****\n'

    for amount, state_type, models in ((working_model_amount, 'working', working_models),
                                       (erroneous_model_amount, 'erroneous', erroneous_models)):
        output += f'----- {amount}/{all_model_amount} models are {state_type}, {state_type} models are: -----\n'
        for model_id, (type_name, project_id, state) in models.items():
            output += f'{type_name} (module {model_id} in project {project_id}):\n -> {state}\n'
    output += f'----- most common errors are: -----\n'
    for message, amount in sorted(error_messages.items(), key=lambda x: x[1], reverse=True):
        output += f'error "{message}" happened {amount} time(s)\n'
    print(output)


def main() -> None:
    args = ScriptArgumentParser().parse_args()
    urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
    for mpc_base_url in MPC_BASE_URLS:
        list_erroneous_models(mpc_base_url, args)


if __name__ == '__main__':
    main()
