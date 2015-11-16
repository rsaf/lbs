/**
 * Created by root on 9/17/15.
 */

var workflow_drag_and_drop_idx;
var ico_scale = 25; //radius of icons in pixels
var line_rule_y = 60; //Snap-to lines' relative displacement in pixels (top-bottom)
var line_rule_x = 10; //Snap-to lines' relative displacement in pixels (left-right)

var make_arrow_path = function(z){


    console.log('make_arrow_path----',z);

    var midwayY = (z.dst.y - z.src.y)/2 + z.src.y;
    var radial_offset = 0;
    if(z.dst.y == z.src.y) var horizontal = true;
    if(z.dst.y > z.src.y) //dst is below, so arrow is from above
    {
        src_radial_offset = {y:ico_scale,x:0};
        dst_radial_offset = {y:0,x:0};
    }
    else{
        src_radial_offset = {y:0,x:0};
        dst_radial_offset = {y:0,x:0};
    }
    return ((z.src.x + src_radial_offset.x)+","+ (z.src.y + src_radial_offset.y)) + " " +
        (!horizontal && Math.abs(z.dst.x- z.src.x) > 5 ?
            ((z.src.x) +","+ (midwayY+(z.dst.y > z.src.y ? -5:5))) + " " +
            ((z.src.x+(z.dst.x > z.src.x ? 5:-5))+","+midwayY) + " " +
            ((z.dst.x) + "," + (midwayY)) + " " : "") +
        ((z.dst.x  + dst_radial_offset.x)+"," + (z.dst.y + dst_radial_offset.y))
}
function auto_layout(data,width,rowheight){
    var start_node = _.find(_.keys(data.nodes), function(key){
                return data.nodes[key].code = "CBN000009"
            }),
        first_node = start_node || data.nodes[_.keys(data.nodes)[0]];

    var y_level = rowheight/ 2,
        depth = 0;
    data.nodes[first_node].x = width/2;
    data.nodes[first_node].y = rowheight/2;
    data.nodes[first_node].lvl = depth;
    layout_one_lower(data.edges[first_node]);
    redistribute_lines(data, depth)

    function layout_one_lower(edges){
        if(!edges || edges.length < 1) return;
        y_level += rowheight;
        depth++;
        var nextset = [];
        _.each(edges, function(edge,i){
            var dst = edge.dst;
            data.nodes[dst].y = y_level;
            console.log("Setting level of ",dst,"to",depth);
            data.nodes[dst].lvl = depth;
            nextset.push(data.edges[dst]);
        })
        layout_one_lower(_.compact(_.flatten(nextset)));
    }
    function redistribute_lines(data, maxDepth){
        for(var lvl = 0; lvl <= maxDepth; lvl++)
        {
            var on_line = _.filter(_.keys(data.nodes), function(key){return data.nodes[key].lvl == lvl})
            var offset = width/on_line.length/2;
            for(var i = 0; i < on_line.length; i ++)
            {
                data.nodes[on_line[i]].x = offset + (offset*2*i);
            }
        }
    }
}
function make_line(sel,data){

    console.log('getting ready to make_line-----',sel,data);

    return sel.selectAll('.link')
        .data(data, function(d){return d.name;})
        .enter()
        .insert('polyline',":first-child")
        .attr("marker-end","url(#Triangle)")
        .attr("class","link")
        .attr("fill","none")
        .attr("name", function(d){return d.name})
        .attr("src", function(d){return d.src.nid})
        .attr("dst", function(d){return d.dst.nid})
        .attr("points", function(z){
            console.log("Making arrow path",z);
            return make_arrow_path(z)
        })
        .on("click", function(d){
            d3.selectAll(".link[selected=true]")
                .attr("class","link")
                .attr("selected",false)
                .style("stroke", function(d){return (d.if===true ? "blue" : (d.if===false ? "red" : "black"))})
            d3.selectAll(".link[name="+ d.name+"]")
                .attr("class","link selected")
                .attr("selected",true)
                .style("stroke", "cyan")
            return;
        })
        .style("stroke", function(d){return (d.if===true ? "blue" : (d.if===false ? "red" : "black"))})
        .style('stroke-width',2)
}
function highlight_node(nid){
    return d3.select("[nid="+nid+"]")
        .attr('selected', true)
        .insert('polyline',":first-child")
        .attr('class', function(d){
            if(link_mode && link_mode.linsetart)
                return 'highlight linkmake'
            else return 'highlight'
        })
        .attr('points',function(d){

            console.log('points data?-------',d);

            var halfy = ico_scale/2 + 2;
            return (-halfy + "," + -halfy) + " " + (halfy + "," + -halfy) + " " + (halfy + "," + halfy) + " " + (-halfy + "," + halfy)
        })
        .style('stroke',function(d){

            console.log('stroke data?-------',d);
            if(link_mode && link_mode.linestart)
                return 'red'
            else return 'cyan'
        })
        .style('fill',function(d){

            console.log('fill data?-------',d);
            if(link_mode && link_mode.linestart)
                return 'red'
            else return 'cyan'
        })
}
function make_node(sel,data){
    var icon_drag = d3.behavior.drag()
        .on("drag", function(d,i) {
            d.x += d3.event.dx;
            d.y += d3.event.dy;
            d3.select(this).attr("transform", function(d,i){
                return "translate(" + [d.x, d.y ] + ")";
            });
            d3.selectAll("[src="+ d.nid+"]")
                .attr("points", function(z){
                    z.src.x = d.x;
                    z.src.y = d.y;
                    return make_arrow_path(z)
                });
            d3.selectAll("[dst="+ d.nid+"]")
                .attr("points", function(z){
                    z.dst.x = d.x;
                    z.dst.y = d.y;
                    return make_arrow_path(z)
                });
        })
        .on("dragend", function(d,i){
            console.log("DRAG END BEGUN");
            d.y = d.y - d.y % line_rule_y + ico_scale;
            d.x = d.x - d.x % line_rule_x;
            d3.select(this).attr("transform", function(d,i){
                return "translate(" + [d.x, d.y]+")";
            })
            d3.selectAll("[src="+ d.nid+"]")
                .attr("points", function(z){
                    z.src.x = d.x;
                    z.src.y = d.y;
                    return make_arrow_path(z)
                })
            d3.selectAll("[dst="+ d.nid+"]")
                .attr("points", function(z){
                    z.dst.x = d.x;
                    z.dst.y = d.y;
                    return make_arrow_path(z)
                })
        });
    var select = function(n,i){
        if(link_mode)
        {
            if(!link_mode.linestart) //target node is link beginning
            {
                console.log('   -----------1-----------');
                link_mode.linestart = {nid: n.nid, x: n.x, y: n.y};
            }
            else if(link_mode.linestart.nid == n.nid)//undo link beginning
            {
                console.log('   -----------2-----------');
                link_mode.linestart = undefined;
            }
            else //target node is link end
            {

                link_mode.lineend = {nid: n.nid, x: n.x, y: n.y};

                console.log('   -----------3-----------',link_mode.lineend);
                var datum = {
                    src : link_mode.linestart,
                    dst : link_mode.lineend,
                    name : link_mode.linestart.nid + "-to-" + link_mode.lineend.nid
                };
                console.log("LINK_MODE:",datum.dst.x);
                if(_.find(lbs.cbos.workflow.pl.edges[datum.src.nid],function(ele){return ele.dst == datum.dst.nid}))
                {
                    //don't self-link. treat as 'cancel link creation'
                    link_mode.lineend = undefined;
                }
                else
                {
                    console.log('   -----------5-----------');
                    if(!lbs.cbos.workflow.pl.edges[datum.src.nid])
                    {
                        console.log('   -----------6-----------');
                        lbs.cbos.workflow.pl.edges[datum.src.nid] = [datum];
                    }
                    else
                    {
                        console.log('   -----------7-----------');
                        lbs.cbos.workflow.pl.edges[datum.src.nid].push(datum);
                    }
                    make_line(d3.select("#DISPLAYED_WORKFLOW"),[datum]);
                    link_mode = {};
                }
            }
        }
        var hadSelection = false;
        d3.selectAll(".node[selected=true]").attr("selected",function(d){
            hadSelection = true;
            d3.selectAll(".node .highlight").remove();
            highlight_node(n.nid);
            lbs.cbos.workflow.selected_nid = n.nid;
            console.log("SELECTED IS", n.nid);
            return d.nid == n.nid;//deselect old node, or keep it if we clicked on the same one
        })
        if(!hadSelection)
            highlight_node(n.nid);
        console.log("SELECTING NODE:", n.nid);
        lbs.cbos.workflow.selected_nid = n.nid;
        lbs.cbos.workflow.op = "wms_upload_workflow_design";
        _.forEach(_.keys(lbs.cbos.workflow.pl.edges),function(node){
            _.forEach(lbs.cbos.workflow.pl.edges[node], function(edge, i){
                if(edge.dst && edge.dst.nid) lbs.cbos.workflow.pl.edges[node][i].dst = edge.dst.nid;
                if(edge.src && edge.src.nid) lbs.cbos.workflow.pl.edges[node][i].src = edge.src.nid;
            })
        });
       // console.log("----> Uploading",lbs.cbos.workflow,"after a selection change");
        lbs.cbos.message(lbs.cbos.workflow).then(function(response){
            lbs.cbos.state.toState({name:'desktop.app.canvas.workflows.workflow.node',param:{'appName':lbs.cbos.state.params.appName,'canvasName':lbs.cbos.state.params.canvasName,'nodeId':lbs.cbos.workflow.selected_nid}});
            console.log('forkflow node update response',lbs.cbos.workflow);
        });
    };

    //configure keyboard input

    var nodes = sel.selectAll('image')
        .data(data,function(d){return d.nid;})
        .enter()
        .append('g')
        .attr("class","node")
        .attr("draggable",true)
        .attr("link",function(d){return d.link})
        .attr("name",function(d){return d.name})
        .attr("nid",function(d){return d.nid})
        .attr("transform", function(d){return "translate("+ d.x+","+ d.y+")"})
        .call(icon_drag)
        .on("mousedown",select)
    nodes.append('text')
        .attr("fill","black")
        .attr("font-size","8")
        .attr("text-anchor","middle")
        .attr("x", function(d) { return 0 })
        .attr("y", function(d) { return ico_scale-2 })
        .text(function(d){return d.name})
    nodes.append('image')
        .attr({
            xmlns: "http://www.w3.org/2000/svg",
            xlink: "http://www.w3.org/1999/xlink"
        })
        .attr("xlink:href", function(d){return d.link})
        .attr("width", ico_scale)
        .attr("height", ico_scale)
        .attr("x",-ico_scale/2)
        .attr("y",-ico_scale/2)


    return nodes;
}
function make_snapline(sel,data,width){
    sel.selectAll('.snap_y_line')
        .data(data)
        .enter()
        .append('line')
        .attr("class","snap_y_line")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", function(d){var c = d; return c})
        .attr("y2", function(d){var c = d; return c})
        .style('stroke-width',0.2)
        .style('stroke-dasharray',"5,5")
        .style('d',"M5 20 l215 0")
        .style('stroke','black')
}

function displayWorkflow(target_id, data, width, height) {
    if(data) lbs.cbos.workflow.pl = data;

    lbs.cbos.workflow.pl.edges = lbs.cbos.workflow.pl.edges || {};
    lbs.cbos.workflow.pl.nodes = lbs.cbos.workflow.pl.nodes || {};
    width = width || 1;
    height = height || 1;
    //auto_layout(lbs.cbos.workflow.pl,width,line_rule_y);

    data = lbs.cbos.workflow.pl;

    console.log("DATA:",data);
    //Massage data into graph elements
    var node_icons = _.map(_.keys(data.nodes), function(key, i){
        var icon = _.extend(data.nodes[key],
            {
                'nid':key,
                'idx':i
            });
        return icon;
    });
    var lines = _.flatten(_.map(_.keys(data.edges), function(key, i){
        return _.map(data.edges[key],function(edge){
            console.log(edge);
            return {
                name : data.nodes[key].nid+"-to-"+data.nodes[edge.dst].nid,
                src : {nid: data.nodes[key].nid, x : data.nodes[key].x, y : data.nodes[key].y, weight: 1, index: i},
                dst : {nid: data.nodes[edge.dst].nid, x : data.nodes[edge.dst].x, y : data.nodes[edge.dst].y, weight: 1, index: i},
                if : edge.if
            }
        })
    }));

    //Configure SVG
    d3.select(target_id)
        .append('svg')
        .attr("id","DISPLAYED_WORKFLOW")
        .attr("width","100%")//width || 400)
        .attr("height","100%")//height || 600)
        .attr("viewBox",("0 0 " + ((width && height) ? width + " " + height : "1 1")))
        .attr("preserveAspectRatio","none")
        .append("defs")
        .append("marker")
        .attr({
            id : "Triangle",
            viewBox : "0 0 10 10",
            refX : ico_scale-5,
            refY : 5,
            markerUnits : "strokeWidth",
            markerWidth : "8",
            markerHeight : "6",
            orient : "auto"
        })
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")

    var svg = d3.select("#DISPLAYED_WORKFLOW");
    var node = make_node(svg, node_icons);
    var line = make_line(svg, lines)
    var snaps = make_snapline(svg, _.times((1 + ((height - (height % line_rule_y))/line_rule_y)), function(i){return i * line_rule_y}),width);

}

var doDelete = function(){
    var deletedLink = false;
    d3.selectAll(".link[selected=true]")
        .attr("selected", function(d){
            _.each(_.keys(lbs.cbos.workflow.pl.edges),function(key){
                lbs.cbos.workflow.pl.edges[key] = _.filter(lbs.cbos.workflow.pl.edges[key],function(v){
                    return !(v.src == d.nid || v.dst == d.nid)
                })
            })
            deletedLink = true;
        })
        .remove();

    if(deletedLink) return; //Don't delete node if we deleted a link

    d3.selectAll(".node[selected=true]")
        .attr("selected", function(d){
            if(!d.nid) return;

            d3.selectAll("[src="+d.nid+"]")
                .remove();
            d3.selectAll("[dst="+d.nid+"]")
                .remove();

            delete lbs.cbos.workflow.pl.edges[d.nid]
            delete lbs.cbos.workflow.pl.nodes[d.nid]
            var new_selection = null;
            _.each(_.keys(lbs.cbos.workflow.pl.edges),function(key){
                lbs.cbos.workflow.pl.edges[key] = _.filter(lbs.cbos.workflow.pl.edges[key],function(v){
                    var has = v.src == d.nid || v.dst == d.nid
                    if(has)new_selection = key;
                    return !has
                })
            })
            lbs.cbos.message(lbs.cbos.workflow)
            return false;
        })
        .remove();
}


//Pallet Bar Drag Events
function deleteButton(){
    doDelete();
}
function allowDrop(ev){
    ev.preventDefault();
}
function drop(ev){
    ev.preventDefault();

    //transform coordinate space
    console.log("DROP:",ev.x,ev.y);
    var svg = document.getElementById("DISPLAYED_WORKFLOW");
    var svgd3 = d3.select("#DISPLAYED_WORKFLOW");
    var x_ratio = svg.offsetWidth / svgd3.attr("viewBox").split(" ")[2];
    var y_ratio = svg.offsetHeight / svgd3.attr("viewBox").split(" ")[3];
    var bcr = svg.getBoundingClientRect();
    var yoffset = bcr.top;
    var xoffset = bcr.left;
    var scrolltop = 0;
    var evx = ev.x / x_ratio - xoffset;
    var evy = ev.y / y_ratio - yoffset + scrolltop


    //make link
    var datum = {
        nid : _.reduce(_.sample("abcdefghijklmnopqrstuvwxyz",10),function(agg, val){return agg + val},""),
        x : ((evx - evx % line_rule_x)),
        y : ((evy - evy % line_rule_y)) + ico_scale,
        code : workflow_drag_and_drop_idx.node,
        link : workflow_drag_and_drop_idx.link,
        input : lbs.cbos.node_defs[workflow_drag_and_drop_idx.node].input
    }
    lbs.cbos.workflow.pl.nodes[datum.nid] = _.omit(datum,"nid");
    make_node(d3.select("#DISPLAYED_WORKFLOW"),[datum]).on("mousedown")({nid:datum.nid});
}
function drag(ev){

    workflow_drag_and_drop_idx = {
        node : ev.target.attributes.nodecode.value,
        link : ev.target.src
    }
}