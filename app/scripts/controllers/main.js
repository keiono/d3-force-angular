'use strict';

angular.module('d3ForceApp')
    .controller('MainCtrl', function ($scope, $window) {

        var DEF_NETWORK_FILE = 'data/d3_gal.json';
        var D3_VIEW = '.network';
        var w, h;

        var trans=[0,0];
        var scale=1;

        function GraphRenderer(width, height) {
            var self = this;
            this.width = width;
            this.height = height;
            this.vis = d3.select(D3_VIEW).append('svg')
                .attr('width', this.width)
                .attr('height', this.height)
                .attr("pointer-events", "all")
                .append('g')
                .call(d3.behavior.zoom().on("zoom", function() {
                    trans=d3.event.translate;
                    scale=d3.event.scale;
                    self.vis.attr("transform",
                            "translate(" + trans + ")"
                            + " scale(" + scale + ")");
                }))
                .append('g');

            this.force = d3.layout.force()
                .charge(-60)
                .gravity(0.05)
                .linkDistance(60)
                .size([this.width, this.height]);
        }




        GraphRenderer.prototype.render = function (graph) {

            this.vis.append('svg:rect')
                .attr('width', w)
                .attr('height', h)
                .attr('fill', 'none');

            var link = this.vis.selectAll('.link')
                .data(graph.links)
                .enter().append('line')
                .attr('class', 'link')
                .attr('stroke-width', function (data) {
                    return (Math.log(data.EdgeBetweenness) / Math.LN10);
                });

            // Define node rendering details
            var node = this.vis.selectAll('.node')
                .data(graph.nodes)
                .enter().append('g')
                .attr('class', 'node')
                .on('mouseover', function() {
                    d3.select(this).select("circle").transition()
                    .duration(550)
                    .attr('fill', '#2e8b57')
                    .attr("r", function(d) {
                            return d.Degree * 2 * 2;
                        });
                })
                .on('mouseout', function() {
                        d3.select(this).select("circle").transition()
                            .duration(550)
                            .attr('fill', 'none')
                            .attr("r", function(d) {
                               return d.Degree*2;
                            });
            });

            // Render label (use name attr)
            node.append('text')
                .attr('fill', 'white')
                .attr('dx', function (data) {
                    return (data.Degree*2 + 3).toString() + 'px'
                })
                .attr('dy', '0')
                .text(function (data) {
                    return data.COMMON;
                })
                .attr('font-size', function (d) {
                    return (d.Degree * 2).toString() + 'px';
                });

//            var barWidth = 6;
//
//            node.append('rect')
//                .attr('fill', '#adfdad')
//                .attr('fill-opacity', '0.2')
//                .attr('stroke', 'none')
//                .attr('x', function (data) {
//                    return (data.Degree*1.6).toString() + 'px'
//                })
//                .attr('y', '4px')
//                .attr('width', barWidth+ 'px')
//                .attr('height', function (data) {
//                    return (Math.abs(Math.log(data.ClosenessCentrality)*10)).toString() + 'px';
//                });

            // Use circle for node shape
            node.append('circle')
                .attr('class', 'node')
                .attr('fill', 'none')
                .attr('r', function (d) {
                    return d.Degree * 2;
                });


            this.force.on('tick', function () {
                link.attr('x1', function (d) {
                    return d.source.x;
                })
                    .attr('y1', function (d) {
                        return d.source.y;
                    })
                    .attr('x2', function (d) {
                        return d.target.x;
                    })
                    .attr('y2', function (d) {
                        return d.target.y;
                    });

                node.attr('transform', function (d) {
                    return 'translate(' + d.x + ',' + d.y + ')';
                });
            });

            // Start rendering
            this.force.nodes(graph.nodes).links(graph.links);

            this.force.start();
        };


        // Main //
        console.log('Network rendering start...');

        d3.json(DEF_NETWORK_FILE, function (graphData) {
            w = $window.innerWidth;
            h = $window.innerHeight;
            var gr = new GraphRenderer(w, h);
            gr.render(graphData);
        });

    });
