from kubernetes import client
from handlers.gcp import gcp
import config as config

## Get GKE Services
def GetPods():
    cluster_manager_client = gcp.GetGKECreds()
    results = []

    ## Itterate over clusters
    for aCluster in config.gke_clusters:
        try:
            print(f"Getting Pods in: {aCluster[0]}, {aCluster[1]}")
            cluster = cluster_manager_client.get_cluster(name=f'projects/{config.gcp_project}/locations/{aCluster[1]}/clusters/{aCluster[0]}')

            # Build Configuration
            config.credentials.get_access_token()
            configuration = client.Configuration()
            configuration.host = f"https://{cluster.endpoint}:443"
            configuration.verify_ssl = False
            configuration.api_key = {"authorization": "Bearer " + config.credentials.access_token}
            client.Configuration.set_default(configuration)

            # Get Pods
            v1 = client.CoreV1Api()
            label_selector = "chaos != notfound"
            pods = v1.list_namespaced_pod("hipster",label_selector=label_selector)
            # Itterate Over Found Pods
            for i in pods.items:
                # Add Pod to Results
                results.append({'name':i.metadata.name,'cluster':aCluster[0],'zone':aCluster[1],'status':i.status.phase})
        except Exception as e:
            print (e)

    # Return results
    return results
            
## Kill Pod
def KillPod(pod_name, cluster_name, cluster_zone):
    print(f"Killing Pod: {pod_name}, Cluster: {cluster_name}, Zone: {cluster_zone}")
    # Remove Pod
    cluster_manager_client = gcp.GetGKECreds()
    cluster = cluster_manager_client.get_cluster(name=f'projects/{config.gcp_project}/locations/{cluster_zone}/clusters/{cluster_name}')

    # Build Configuration
    configuration = client.Configuration()
    configuration.host = f"https://{cluster.endpoint}:443"
    configuration.verify_ssl = False
    configuration.api_key = {"authorization": "Bearer " + config.credentials.access_token}
    client.Configuration.set_default(configuration)

    # Get Pods
    try:
        v1 = client.CoreV1Api()
        remove_pod = v1.delete_namespaced_pod(pod_name,"hipster")
        print(remove_pod)
        return True
    except Exception as e:
        print("Exception when calling CoreV1Api->delete_namespaced_pod: %s\n" % e)
        return False