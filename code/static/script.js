// Get Instances
function getInstances(){
    $.ajax({
      url: '/list-instances',
      success: function(data) {
        console.log(data)
        loadNodeTable(data)
      }
    });
    setTimeout(getInstances, 5000);
  }
  
$(document).ready(function() {
    // run the first time; all subsequent calls will take care of themselves
    getInstances()
    getPods()
});

//Comparer Function    
function GetSortOrder(prop) {    
    return function(a, b) {    
        if (a[prop] > b[prop]) {    
            return 1;    
        } else if (a[prop] < b[prop]) {    
            return -1;    
        }    
        return 0;    
    }    
}   

// Node Click
function node_click(instance,zone) {
    console.log("Terminating Instance: " + instance + ", Zone: " + zone);
    var fd = new FormData();
    fd.append('instance_name', instance);
    fd.append('instance_zone', zone);

    // Make Call
    $.ajax({
        url: '/remove-instance',
        data: fd,
        type: 'POST',
        processData: false,
        contentType: false,
        cache: false,
        enctype: 'multipart/form-data',
        success: function(data) {
          console.log(data)
        }
      });
}

// Populate Node Table
function loadNodeTable(data) {
    var Table = document.getElementById("nodes");
    $("#nodes>tbody").empty()

    // Get the instance data
    json_data = JSON.parse(data)
    tableData = json_data.instances

    // Sort the data by zone
    tableData.sort(GetSortOrder("zone"));

    // Create table
    current_region = ""
    current_row = ""
    current_count = 0
    for (var i = 0; i < tableData.length; i++) {
        if (current_count === 2) {
            current_row += "<td title='"+tableData[i].name+"' onclick=\"node_click('"+tableData[i].name+"','"+tableData[i].zone+"')\"";

            // Validate Color
            if (tableData[i].status === "RUNNING") {
                current_row += " class='running'";
            } else if (tableData[i].status === "STOPPING") {
                current_row += " class='terminating'";
            } else {
                current_row += " class='starting'";
                console.log(tableData[i].status);
            }

            // Wrap up cell
            current_row +="></td></tr>";
            $("#nodes>tbody").append(current_row);
            // Reset for next set
            current_count = 0;
            current_row = "<tr>";
        } else {
            current_row += "<td title='"+tableData[i].name+"' onclick=\"node_click('"+tableData[i].name+"','"+tableData[i].zone+"')\"";

            // Validate Color
            if (tableData[i].status == "RUNNING") {
                current_row += " class='running'";
            } else if (tableData[i].status == "STOPPING") {
                current_row += " class='terminating'";
            } else {
                current_row += " class='starting'";
            }

            // Wrap up cell
            current_row +="></td>";
            current_count += 1;
        }
        
    }
    current_row += "</tr>"
    $("#nodes>tbody").append(current_row);

}

// Get Pods
function getPods(){
    $.ajax({
        url: '/list-pods',
        success: function(data) {
          console.log(data)
          loadPodTable(data)
        }
      });
      setTimeout(getPods, 5000);
}

// Populate Pod Table
function loadPodTable(data) {
    $("#pods>tbody").empty()

    // Get the instance data
    json_data = JSON.parse(data)
    tableData = json_data.pods

    // Create table
    current_region = ""
    current_row = ""
    current_count = 0
    for (var i = 0; i < tableData.length; i++) {
        if (current_count === 3) {
            current_row += "<td title='"+tableData[i].name+"' onclick=\"pod_click('"+tableData[i].name+"','"+tableData[i].cluster+"','"+tableData[i].zone+"')\"";

            // Validate Color
            if (tableData[i].status === "Running") {
                current_row += " class='running'";
            } else if (tableData[i].status === "Pending") {
                current_row += " class='starting'";
            } else {
                current_row += " class='terminating'";
                console.log(tableData[i].status);
            }

            // Wrap up cell
            current_row +="></td></tr>";
            $("#pods>tbody").append(current_row);
            // Reset for next set
            current_count = 0;
            current_row = "<tr>";
        } else {
            current_row += "<td title='"+tableData[i].name+"' onclick=\"pod_click('"+tableData[i].name+"','"+tableData[i].cluster+"','"+tableData[i].zone+"')\"";

            // Validate Color
            if (tableData[i].status == "Running") {
                current_row += " class='running'";
            } else if (tableData[i].status == "Pending") {
                current_row += " class='starting'";
            } else {
                current_row += " class='terminating'";
            }

            // Wrap up cell
            current_row +="></td>";
            current_count += 1;
        }
        
    }
    current_row += "</tr>"
    $("#pods>tbody").append(current_row);

}

// Pod Click
function pod_click(pod,cluster,zone) {
    console.log("Terminating Pod: " + pod + ", Cluster: " + cluster +", Zone: " + zone);
    var fd = new FormData();
    fd.append('gke_pod', pod);
    fd.append('gke_zone', zone);
    fd.append('gke_cluster', cluster)

    // Make Call
    $.ajax({
        url: '/remove-pod',
        data: fd,
        type: 'POST',
        processData: false,
        contentType: false,
        cache: false,
        enctype: 'multipart/form-data',
        success: function(data) {
          console.log(data)
        }
      });
}