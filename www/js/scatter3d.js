Scatter3d = (function() {

    /*
     Called externally and allows to input files
     */

    function inputFile(json){
        /*
         /
         /    Enable file input using button
         /
         */

        var newickInButton = document.getElementById("jsonFile_link"),
            control = document.getElementById("jsonFile");

        newickInButton.addEventListener('click',function(event){
            event.preventDefault();
            control.click();
        },false);

        control.addEventListener("change", function(event) {

            // When the control has changed, there are new files

            var file = control.files;


            var accept = {
                text   : ["txt", "json", "csv"]
            };

            var file_name_tokens = file[0].name.split(".");
            var file_name_ending = file_name_tokens[file_name_tokens.length-1];

            if (accept.text.indexOf(file_name_ending) > -1){
                var reader = new FileReader();
                reader.onload = function(event) {

                    drawScatterPlot(event.target.result);
                    $("#renderErrorMessage").empty();
                };
                reader.readAsText(file[0]);

            } else {
                $("#renderErrorMessage").empty();
                $("#renderErrorMessage").append($('<div class="alert alert-danger" role="alert">Only the following file endings are accepted: txt, nh, nhx, nwk, tre, tree</div>')).hide().slideDown(300);
                //$("#" + newickIn).val("");
                $("#" + json+ "Label").attr("placeholder","Untitled").val("");
                $("#" + json).attr("placeholder","Paste your tree or drag and drop your tree file here").val("");
            }


        }, false);

    }

    function drawScatterPlot(input_data){
        var x=[], y=[], z=[], ogs=[], cluster=[];
        var color_select = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a'];
        var width = $("#left-panel").width();

        console.log(JSON.parse(input_data));

        var myPlot = document.getElementById("myDiv2");
        var data_file = JSON.parse(input_data);

        for (var i in data_file){
            x.push(data_file[i].x);
            y.push(data_file[i].y);
            z.push(data_file[i].z);
            ogs.push(i);
            cluster.push(color_select[data_file[i].cluster]);
        }


        var hoverInfo = document.getElementById('hoverinfo');
        var data = [{
            text: ogs,
            x: x,
            y: y,
            z: z,
            name: 'Scatter',
            mode: 'markers',
            type: 'scatter3d',
            marker: {
                color: cluster,
                size: 4
            }
            //hoverinfo: 'text'
        }];
        console.log(width);
        var layout = {
            autosize: true,
            height: width,
            width: width,
            margin: {
                l: 0,
                r: 0,
                b: 0,
                t: 0,
                pad: 0
            },
            scene: {
                aspectratio: {
                    x: 1,
                    y: 1,
                    z: 1
                },
                camera: {
                    center: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    eye: {
                        x: 1.25,
                        y: 1.25,
                        z: 1.25
                    },
                    up: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                },
                xaxis: {
                    type: 'linear',
                    zeroline: false
                },
                yaxis: {
                    type: 'linear',
                    zeroline: false
                },
                zaxis: {
                    type: 'linear',
                    zeroline: false
                }
            },
            hovermode: 'closest'
        };

        Plotly.newPlot("myDiv2", data, layout);
        var log_ogs = [];
        myPlot.on('plotly_click', function(data){

            var points = data.points[0],
                pointNum = points.pointNumber,
                infotext = data.points[0].data.text[pointNum];
                //info = infotext +': x= '+data_file[infotext].x+', y= '+data_file[infotext].y', z= '+data_file[infotext].z;
            log_ogs.push(infotext);


            //hoverInfo.innerHTML = info.join('');
            console.log(data_file[infotext]);
            var treecomp = TreeCompare.init({
                enableFixedButtons: $("#rerootFixedButtons").val()
            });

            if(log_ogs.length > 1){
                var tree1 = treecomp.addTree(data_file[log_ogs[log_ogs.length-2]].tree,undefined);
                var tree2 = treecomp.addTree(data_file[log_ogs[log_ogs.length-1]].tree,undefined);
                treecomp.changeSettings({
                    autoCollapse: tree1.data.autoCollapseDepth
                })
                var collapseText = tree1.data.autoCollapseDepth === null ? "OFF" : tree1.data.autoCollapseDepth.toString();
                $("#collapseAmount").html(collapseText);

                treecomp.compareTrees(tree1.name, "vis-container1", tree2.name, "vis-container2", "vis-scale1", "vis-scale2");
                $("#tree-container1").html('<div class="container-fluid vis-container-2" id="vis-container1"></div><div class="container-fluid vis-container-2" id="vis-container2"></div><div class="vis-scale-2" id="vis-scale1"></div><div class="vis-scale-2" id="vis-scale2"></div>');

                $("#colorScale").html("<b>Similarity to most common node:</b>");
                treecomp.renderColorScale("colorScale");
            }else{
                var tree1 = treecomp.addTree(data_file[infotext].tree,undefined);
                treecomp.changeSettings({
                    autoCollapse: tree1.data.autoCollapseDepth
                });
                $("#tree-container1").html('<div class="container-fluid vis-container" id="vis-container1"></div>');
                treecomp.viewTree(tree1.name, "vis-container1", "vis-scale1");
                $("#colorScale").empty();
                //hoverInfo.innerHTML = infotext;
            }
        });

        myPlot.on('plotly_unhover', function(data){
            hoverInfo.innerHTML = '';
        });
    }

    return {
        inputFile: inputFile
    }
});








