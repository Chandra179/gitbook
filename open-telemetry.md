---
description: trying OTEL using grafana stack with kubernetes in LOCAL
---

# Open Telemetry

<figure><img src=".gitbook/assets/image (10).png" alt=""><figcaption></figcaption></figure>

* ArgoCD for monitoring : [https://github.com/Chandra179/go-sdk/blob/main/k8s/argocd.yaml](https://github.com/Chandra179/go-sdk/blob/main/k8s/argocd.yaml)
* Jaeger for tracing : [https://github.com/Chandra179/go-sdk/blob/main/k8s/jaeger.yaml](https://github.com/Chandra179/go-sdk/blob/main/k8s/jaeger.yaml)
* Grafana for dashboard : [https://github.com/Chandra179/go-sdk/blob/main/k8s/grafana.yaml](https://github.com/Chandra179/go-sdk/blob/main/k8s/grafana.yaml)
* Prometheus for metrics : [https://github.com/Chandra179/go-sdk/blob/main/k8s/prometheus.yaml](https://github.com/Chandra179/go-sdk/blob/main/k8s/prometheus.yaml)
* Loki for logging : [https://github.com/Chandra179/go-sdk/blob/main/k8s/loki.yaml](https://github.com/Chandra179/go-sdk/blob/main/k8s/loki.yaml)
* Alloy for the data collector : [https://github.com/Chandra179/go-sdk/blob/main/k8s/alloy.yaml](https://github.com/Chandra179/go-sdk/blob/main/k8s/alloy.yaml)

for grafana `datasources.yaml` config im using from the official docs:

```
https://grafana.com/docs/grafana/latest/datasources/loki/
https://grafana.com/docs/grafana/latest/datasources/jaeger/
```

to access the tools locally we need to exposed the service in local using ingress, i sum up the process below, see detailed process here: [https://github.com/Chandra179/go-sdk/blob/main/k8s/Makefile](https://github.com/Chandra179/go-sdk/blob/main/k8s/Makefile)

1. download and start minikube
2. apply secrets first using .sh : [https://github.com/Chandra179/go-sdk/blob/main/add-secrets.sh](https://github.com/Chandra179/go-sdk/blob/main/add-secrets.sh)
3. enable ingress : `minikube addons enable ingress`
4. apply ArgoCD to the cluster
5. Apply the files (observability then app then ingress)  using `kubectl apply`
6. start minikube tunnel
7.  map the custom hosts access to `/etc/hosts` like this, the IP is minikube IP get it using `minikube ip` &#x20;

    ```
    192.168.58.2 grafana.local
    192.168.58.2 prometheus.local
    192.168.58.2 jaeger.local
    192.168.58.2 alloy.local
    192.168.58.2 app.local
    ```
8.  forward some services like argocd to local cause its not in ingress&#x20;

    ```shellscript
    nohup kubectl port-forward svc/argocd-server -n argocd 8081:443
    ```

