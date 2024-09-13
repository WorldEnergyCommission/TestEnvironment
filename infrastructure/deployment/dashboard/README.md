# How to generate an access token

```
kubectl --kubeconfig {CLUSTER_CONFIG} -n kubernetes-dashboard create token admin-user
```

# How to start the proxy

```
kubectl --kubeconfig {CLUSTER_CONFIG} proxy
```

# How to open the dashboard (after getting a token and starting the proxy)

Open this [link](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/) to open the dashboard
and pass the token from the first step
