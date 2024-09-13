# EIO RabbitMQ deployment

RabbitMQ is used for the AI/MPC module to communicate jobs.
It is deployed using a single container (as opposued to the any cluster configuration) for simplicity, and since it is not needed to be rendundant (AI module should schedule jobs again).
