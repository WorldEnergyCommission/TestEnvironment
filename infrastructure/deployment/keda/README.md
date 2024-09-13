# EIO core1 KEDA deployment

[KEDA](keda.sh) is deployed using yaml files from github (see [tutorial](https://keda.sh/docs/2.13/deploy/) and link to current [files](https://github.com/kedacore/keda/releases/download/v2.13.0/keda-2.13.0.yaml))

**IMPORTANT**
keda has to be deployed using `kubectl apply --server-side` with the `server-side` flag!
