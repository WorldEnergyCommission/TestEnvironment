# Upgrade PostgreSQL + TimescaleDB

1. Create a new deployment + PVC for the new PostgreSQL version and apply it. This is essentially just a copy of
   postgres.yaml but without the service:<br>
   `kubectl apply -f <new deployment file>`
1. Scale the nginx deployment count to 0 so that nobody can access lynus from the outside:<br>
   `kubectl scale --replicas=0 deploy nginx`
1. Use [pg_dumpall](https://www.postgresql.org/docs/current/app-pg-dumpall.html) on the current database:
   `pg_dumpall -U lynus > dump.sql`
1. Transfer `dump.sql` to the new PostgreSQL container (pod):<br>
   `kubectl cp <pod>:/dump.sql dump.sql && kubectl cp dump.sql <new_pod>:/dump.sql`
1. Import `dump.sql`:<br>
   `psql -d postgres -f /dump.sql`
1. Change the current `postgres` service app labels to the new deployment.
1. Update password for `lynus` if needed.<br>
   `ALTER USER lynus WITH PASSWORD '<password>';`
1. Update timescaledb version if needed:<br>
   `ALTER EXTENSION timescaledb UPDATE;`
1. Scale down the old PostgreSQL deployment:<br>
   `kubectl scale --replicas=0 deploy <old_deployment_name>`

## Knowledge

- https://www.postgresql.org/docs/current/app-pg-dumpall.html
- https://www.postgresql.org/docs/current/upgrading.html
- https://docs.timescale.com/timescaledb/latest/how-to-guides/update-timescaledb/
- https://docs.timescale.com/timescaledb/latest/how-to-guides/update-timescaledb/upgrade-postgresql/

## Notes

- Make sure only one container is running, because it can happen if two database containers try to use the same volume,
  the database can corrupt. Therefore, scale down deployments instead of deleting pods.
- If the database corrupts with an error that says something about `WAL (write ahead log)`, the problem can be fixed
  with [pg_resetwal](https://www.postgresql.org/docs/current/app-pgresetwal.html). If not, you're probably fucked.
  Always make backups for that reason.

## Tips

- the `WAL` in the cluster can be easily reset by appending the following values right after `image:` to
  the `timescaledb`
  container specification in the deployment.yaml file and then applying it:

```yaml
command: [ "pg_resetwal" ]
args: [ "-f", "/var/lib/postgresql/data/pgdata" ]
```
