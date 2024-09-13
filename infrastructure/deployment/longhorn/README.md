# Accessing the UI for Longhorn

The port of the UI must be forwarded to localhost from the cluster using the following command:

```bash
kubectl port-forward deployment/longhorn-ui 7000:8000 -n longhorn-system
```

# UNEXPECTED INCONSISTENCY error when using Longhorn

When an error like **/dev/longhorn/pvc-727ef957-1da1-4936-9c00-8d820cabf604: UNEXPECTED INCONSISTENCY; RUN fsck MANUALLY.** happens,
use **k9s** to get to a longhorn manager pod shell that is running on the node that failed to mount the filesystem and execute:
```shell
fsck /dev/longhorn/pvc-727ef957-1da1-4936-9c00-8d820cabf604
```
After checking all suggestion with **y** the filesystem should be able to run again
