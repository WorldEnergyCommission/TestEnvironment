# Upgrade MinIO deployment

**Note:** replace `config.yml` and the path prefix accordingly

Also replace all image tags with the new one in the yaml files

```yaml
image: minio/minio:RELEASE.2024-03-07T00-43-48Z
```

1. Deploy new version as migrator (incl. pvc).

```bash
kubectl --kubeconfig config.yml apply -f .\infrastructure\deployment\minio\upgrade\deployment.yaml
```

2. Deploy migration job.

```bash
kubectl --kubeconfig config.yml apply -f .\infrastructure\deployment\minio\upgrade\migration-job.yaml
```

If job failes when doing `mc mirror` try to use a different version. E.g.: for the fs migration use the last possible version for minIO (RELEASE.2022-10-24T18-35-07Z) as well as for the client (RELEASE.2022-10-29T10-09-23Z).

4. Delete migration job (if not done it can't be used again)

```bash
kubectl --kubeconfig config.yml delete job minio-migration-job -n lynus
```

4. Scale down migrator & normal minio instance

````bash
kubectl --kubeconfig config.yml scale --replicas=0 deploy minio -n lynus
kubectl --kubeconfig config.yml scale --replicas=0 deploy minio-migrator -n lynus
``

5. Deploy cleanup job.

```bash
kubectl --kubeconfig config.yml apply -f .\infrastructure\deployment\minio\upgrade\cleanup-job.yaml
````

6. Delete migration clean up job (if not done it can't be used again)

```bash
kubectl --kubeconfig config.yml delete job minio-migration-clean-up-job -n lynus
```

6. Deploy (normal) minio instance **with updated version**

```bash
kubectl --kubeconfig config.yml apply -f .\infrastructure\deployment\minio\deployment.yaml
```

7. Scale down normal minio instance

```bash
kubectl --kubeconfig config.yml scale --replicas=1 deploy minio -n lynus
```

7. Delete migration deployment.

```bash
kubectl --kubeconfig config.yml delete -f .\infrastructure\deployment\minio\upgrade\deployment.yaml
```

## Troubleshooting

- Restart `nginx`
- Restart `api`
- Restart `minio`

## Useful links

[minio docs for fs migration](https://min.io/docs/minio/linux/operations/install-deploy-manage/migrate-fs-gateway.html)

[fs migration github issue](https://github.com/minio/docs/issues/660#issuecomment-1360440761)
