from kubernetes import client
from handlers.gcp import gcp
import config as config

## Get Kubernetes creds
def GetKubernetesCreds(location: str, name: str):
    # Returns Configuration set for Kubernetes Cluster
    configuration = ""
    cluster_manager_client = gcp.GetGKECreds()
    try:
        print(f"Getting Credentials for the cluster: {name}, located at: {location}")
        cluster = cluster_manager_client.get_cluster(name=f'projects/{config.gcp_project}/locations/{location}/clusters/{name}')
        # Build Configuration
        config.credentials.get_access_token()
        configuration = client.Configuration()
        configuration.host = f"https://{cluster.endpoint}:443"
        configuration.verify_ssl = False
        configuration.api_key = {"authorization": "Bearer " + config.credentials.access_token}
    except Exception as e:
        print (e)

    return configuration

## Get GKE Services
def GetServices(cluster_name: str, cluster_location: str):
    # Get list of services in namespace
    ## Itterate over clusters
    service_list = []
    client.Configuration.set_default(GetKubernetesCreds(location=cluster_location,name=cluster_name))

    # Get service list
    v1 = client.CoreV1Api()
    try:
        services = v1.list_service_for_all_namespaces(watch=False)
        for aService in services.items:
            if aService.metadata.namespace == 'hipster':
                print(aService)
                service_list.append(aService.metadata.name)
    except Exception as e:
        print(e)

    return service_list


def GetPods():
    # Gather a list of pods in each service in each cluster
    pod_results = []

    ## Itterate over clusters
    for aCluster in config.gke_clusters:
        try:
            print(f"Getting Pods in: {aCluster[0]}, {aCluster[1]}")
            client.Configuration.set_default(GetKubernetesCreds(location=aCluster[1],name=aCluster[0]))

            # Get Pod in each service
            v1 = client.CoreV1Api()
            service_list = GetServices(cluster_name=aCluster[0], cluster_location=aCluster[1])
            for aService in service_list:
                # Filter by service
                label_selector = f"app = {aService}"
                pods = v1.list_namespaced_pod("hipster",label_selector=label_selector)
                # Itterate Over Found Pods
                for i in pods.items:
                    # Add Pod to Results
                    pod_results.append({'name':i.metadata.name,'cluster':aCluster[0],'zone':aCluster[1],'status':i.status.phase})
        except Exception as e:
            print (e)

    # Return results
    return pod_results
            
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