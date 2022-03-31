# GKE Chaose Engineering
Chaose Engnieering on GKE. Running the [Microservices demo](https://github.com/GoogleCloudPlatform/microservices-demo)

## Run Code Locally
```
pip3 install virtualenv
python3 -m virtualenv venv
source venv/bin/activate
pip3 install -r code/requirements.txt
python3 code/main.py
```
Then you can browse the code [locally](http://localhost:8080).<br /><br />
**Deactivate the environment** 
Run the following command
```
deactivate
```

## Config
Config is either via local file [config.json](code/config.json) or recreating with environmental variables:<br />
**EXAMPLE:**
```bash
GCP_PROJECT='MyGCPProject'
GKE_CLUSTERS=[['gke-cluster-1', 'us-west1'],['gke-cluster-2', 'us-east1']]
DASHBOARD_URL='https://dashboardurl.com'
SITE_URLS=['https://sitehomepage.com/','https://sitehomepage.com/cart','https://sitehomepage.com/product/123']
LOAD_TEST_URL='https://sitehomepage.com'
LOAD_TEST_USER_BUMP=50
```