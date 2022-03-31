from kubernetes import client
from handlers.gcp import gcp
import config as config

## Get GKE Services
def GetServices():
    cluster_manager_client = gcp.GetGKECreds()
    results = {}

    ## Itterate over clusters
    for aCluster in config.gke_clusters:
        print(f"{aCluster[0]}, {aCluster[1]}")
        cluster = cluster_manager_client.get_cluster(name=f'projects/{config.gcp_project}/locations/{aCluster[1]}/clusters/{aCluster[0]}')

        
        configuration = client.Configuration()
        configuration.host = f"https://{cluster.endpoint}:443"
        configuration.verify_ssl = False
        configuration.api_key = {"authorization": "Bearer " + config.credentials.refresh_token}
        print(configuration.api_key)
        client.Configuration.set_default(configuration)


        v1 = client.CoreV1Api()
        print("Listing services:")
        pods = v1.list_pod_for_all_namespaces(watch=False)
        cluster_results = []
        for i in pods.items:
            print(i)
            cluster_results.append(i.metadata.name)
        
        # # Add Pod result set to return result
        # results[aCluster] = cluster_results

    # Return results
    return results
            
## Kill Pod
def KillPod(service_name, cluster_name):
    pass