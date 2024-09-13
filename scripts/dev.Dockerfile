FROM bitnami/kubectl:1.29.2 as kubectl
USER root
RUN mkdir /app && chown -R 1001:1001 /app
USER 1001
WORKDIR /app
RUN echo "" > proxy.sh
RUN echo $'#!/bin/bash\n\
  kubectl --kubeconfig /app/config port-forward deployment/postgres 5432:5432 --address 0.0.0.0 -n lynus & \n\
  kubectl --kubeconfig /app/config port-forward deployment/mosquitto 1883:1883 --address 0.0.0.0 -n lynus & \n\
  kubectl --kubeconfig /app/config port-forward deployment/redis 6379:6379 --address 0.0.0.0 -n lynus & \n\
  kubectl --kubeconfig /app/config port-forward deployment/empa 9000:8000 --address 0.0.0.0 -n lynus & \n\  
  kubectl --kubeconfig /app/config port-forward deployment/longhorn-ui 7000:8000 --address 0.0.0.0 -n longhorn-system & \n\  
  # Wait for any process to exit  \n\
  wait -n  \n\
  # Exit with status of process that exited first  \n\
  exit $?  \n\
  ' > proxy.sh

RUN chmod +x proxy.sh

ENTRYPOINT ["./proxy.sh"] 
CMD [ "" ]



