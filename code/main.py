
from flask import Flask, render_template, request, redirect
from googleapiclient import discovery
from google.auth import compute_engine
from oauth2client.client import GoogleCredentials
import google.cloud.logging
from google.cloud import compute_v1
from google.cloud.container_v1 import ClusterManagerClient
from kubernetes import client
import google.auth.transport.requests
import json
import random

## Config App
app = Flask(__name__)

# Build Credentials
credentials = GoogleCredentials.get_application_default()
LoggingClient = google.cloud.logging.Client()

# Setup the logger
LoggingClient.get_default_handler()
LoggingClient.setup_logging()

# Application Variables
gcp_project = ""
gke_clusters = {}
dashboard_url = ""
site_urls = []

## Helper functions
def GetConfig():
    # Function to Open config.json file and load values
    global gcp_project, gke_clusters, dashboard_url, site_urls
    # Read file
    f = open('config.json')
    data = json.load(f)
    # Set Variables
    gcp_project = data['project']
    gke_clusters = data['gke-clusters']
    dashboard_url = data['dashboard-url']
    site_urls = data['site-urls']

## List GCE Instances
def GetInstances():
    global credentials, gcp_project
    # This Function creates a list of instances per GKE cluster and returns them as a nested array
    instance_client = compute_v1.InstancesClient()
    request = compute_v1.AggregatedListInstancesRequest()
    request.project = gcp_project

    agg_list = instance_client.aggregated_list(request=request)

    all_instances = []

    # Format the return
    for zone, response in agg_list:
        if response.instances:
            for instance in response.instances:
                thisZone = str(instance.zone).rsplit('/', 1)[-1]

                thisStatus = [char for char in str(instance.status) if char.isupper()]
                all_instances.append({'zone':thisZone,'name':instance.name,'status':''.join(thisStatus)})

    return all_instances

## Kill GCE Instance
def KillInstance(instance_name,instance_zone):
    global credentials, gcp_project
    # This function removes a specific instance
    instance_client = compute_v1.InstancesClient()
    operation_client = compute_v1.ZoneOperationsClient()

    print(f"Deleting {instance_name} from {instance_zone}...")

    operation = instance_client.delete_unary(
        project=gcp_project, zone=instance_zone, instance=instance_name
    )

    while operation.status != compute_v1.Operation.Status.DONE:
        operation = operation_client.wait(
            operation=operation.name, zone=instance_zone, project=gcp_project
        )

    if operation.error:
        print("Error during deletion:", operation.error)
        return False
    if operation.warnings:
        print("Warning during deletion:", operation.warnings)
    print(f"Instance {instance_name} deleted.")

    return True

## Get GKE Services
def GetServices():
    global gcp_project, gke_clusters, credentials
    cluster_manager_client = ClusterManagerClient(credentials=credentials)
    request = google.auth.transport.requests.Request()
    credentials.refresh(request)
    results = {}

    ## Itterate over clusters
    for aCluster in gke_clusters:
        print(f"{aCluster[0]}, {aCluster[1]}")
        cluster = cluster_manager_client.get_cluster(name=f'projects/{gcp_project}/locations/{aCluster[1]}/clusters/{aCluster[0]}')
        configuration = client.Configuration()
        configuration.host = f"https://{cluster.endpoint}:443"
        configuration.verify_ssl = False
        configuration.api_key = {"authorization": "Bearer " + credentials.token}
        client.Configuration.set_default(configuration)

        v1 = client.CoreV1Api()
        print("Listing services:")
        pods = v1.list_pod_for_all_namespaces(watch=False)
        cluster_results = []
        for i in pods.items:
            print(i)
            cluster_results.append(i.metadata.name)
        
        # Add Pod result set to return result
        results[aCluster] = cluster_results

    # Return results
    return results
            
## Kill Pod
def KillPod(service_name, cluster_name):
    pass

## Add Load Function
def AddLoad():
    return True

## Get Current Load
def CurrentLoad():
    return (random.randint(1, 9) * 100)

## Default App Hosting
@app.route("/", methods=['GET'])
def default():
    global dashboard_url, site_urls
    ## Load Page
    return render_template('index.html', monitor_page=dashboard_url, preview_list=site_urls)

@app.route("/chaos", methods=['GET'])
def chaos_page():
    return render_template('chaos.html')

@app.route("/load", methods=['GET'])
def load():
    return render_template('load.html')

## Get Instances
@app.route("/list-instances",methods=['GET'])
def listinstances():
    # API End Point for get all instances
    result = GetInstances()

    # Validate result
    if len(result) > 0:
        return json.dumps({'success':True, 'instances':result}), 201, {'ContentType':'application/json'} 
    else:
        return json.dumps({'success':False}), 400, {'ContentType':'application/json'} 

## Kill Instance
@app.route("/remove-instance",methods=['POST'])
def removeinstance():
    # API End Point for remove instance
    name = request.form['instance_name']
    zone = request.form['instance_zone']

    result = KillInstance(instance_name=name,instance_zone=zone)

    if result:
        return json.dumps({'success':True}), 201, {'ContentType':'application/json'} 
    else:
        return json.dumps({'success':False}), 400, {'ContentType':'application/json'} 

## Get Servers
@app.route("/list-services", methods=['GET'])
def listservices():
    # API End Point for get all instances
    result = GetServices()

    # Validate result
    if len(result) > 0:
        return json.dumps({'success':True, 'services':result}), 201, {'ContentType':'application/json'} 
    else:
        return json.dumps({'success':False}), 400, {'ContentType':'application/json'} 

## Delete Pod In Service
@app.route("/remove-pod-in-service",methods=['POST'])
def remove_pod_in_service():
    service = request.form['gke_service']
    cluster = request.form['gke_cluster']

    result = KillPod(service_name=service,cluster_name=cluster)

    if result:
        return json.dumps({'success':True}), 201, {'ContentType':'application/json'} 
    else:
        return json.dumps({'success':False}), 400, {'ContentType':'application/json'} 

## Increase load on site
@app.route("/increase-load", methods=['GET'])
def increase_load():
    result = AddLoad()

    if result:
        return json.dumps({'success':True}), 201, {'ContentType':'application/json'} 
    else:
        return json.dumps({'success':False}), 400, {'ContentType':'application/json'} 

## Get Current Load on the site
@app.route("/get-load", methods=['GET'])
def current_load():
    result = CurrentLoad()

    if result > 0:
        return json.dumps({'success':True, 'current_load':result}), 201, {'ContentType':'application/json'} 
    else:
        return json.dumps({'success':False}), 400, {'ContentType':'application/json'} 

if __name__ == "__main__":
    ## Setup APP
    GetConfig()
    ## Run APP
    #GetServices()

    app.run(host='0.0.0.0', port=8080, debug=True)