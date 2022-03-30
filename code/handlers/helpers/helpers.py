import json
import config as config

## Helper functions
def GetConfig():
    # Function to Open config.json file and load values
    # Read file
    f = open('config.json')
    data = json.load(f)
    # Set Variables
    config.gcp_project = data['project']
    config.gke_clusters = data['gke-clusters']
    config.dashboard_url = data['dashboard-url']
    config.site_urls = data['site-urls']
    config.load_test_url = data['load-test-url']
    config.load_test_user_bump = data['load-test-user-bump']
