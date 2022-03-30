var today = new Date(); 
var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
var LoadData = [100]
var GraphLabels = [time]

function AddLoad(){
    $.ajax({
        url: '/increase-load',
        success: function(data) {
          console.log(data)
        }
      });
}

$(document).ready(function() {
    // run the first time; all subsequent calls will take care of themselves
    setTimeout(GetLoad, 5000);
});

var mychart = new Chart(document.getElementById("graphCanvas"),
    {
        type: 'line',
        data: {
            labels: GraphLabels,
            datasets: [{
                label: 'Current Load',
                borderColor: 'rgb(255, 99, 132)',
                data:   LoadData,
            }]
        },
        options: {
            maintainAspectRatio: false,
        }
    });

function GetLoad(){
    $.ajax({
        url: '/get-load',
        success: function(data) {
          console.log(data)
          // Add Data to graph
          json_data = JSON.parse(data)
          var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
          UpdateChart(mychart)

        }
      });

      setTimeout(GetLoad, 5000);
}

function UpdateChart(mychart){
    mychart.data.labels.push(time);
    mychart.data.datasets[0].data.push(json_data.current_load);
    
    // re-render the chart
    mychart.update();
}