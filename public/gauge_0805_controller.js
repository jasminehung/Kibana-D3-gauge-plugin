define(function (require) {
  var module = require('ui/modules').get('kibana/gauge_0805', ['kibana']);
  var d3 = require('d3');
  var _ = require('lodash');
  var $ = require('jquery');
  var arrayToLinkedList = require('ui/agg_response/hierarchical/_array_to_linked_list');
  var formatNumber = d3.format(',.0f');

  module.controller('KbnGaugeController', function ($scope, $element, $rootScope, Private) {

  var svgRoot = $element[0];
  var div;
  var node, root;
  div = d3.select(svgRoot);
  var r = undefined;
  var pointerHeadLength = undefined;
  var value = 0;
  var svg = undefined;
  var arc = undefined;
  var scale = undefined;
  var ticks = undefined;
  var tickData = undefined;
  var pointer = undefined;

  var _buildVis = function (root, name) {
        var gauge = function() {
      	var that = {};
      	var config = {
      		size: 300,
      		pointerWidth: 10,
      		pointerTailLength: 5,
      		pointerHeadLengthPercent: 0.9,
      		transitionMs: 4000,
      		majorTicks: 5,
      		labelFormat: d3.format(',g'),
      		labelInset: 10,
          arcColorFn: d3.interpolateHsl(d3.rgb($scope.vis.params.colorleft), d3.rgb($scope.vis.params.colorright))
      	};

      	function deg2rad(deg) {
      		return deg * Math.PI / 180;
      	}

      	function configure() {
      		range = (90) - (-90);
      		r = 300/ 2;
      		pointerHeadLength = Math.round(r * config.pointerHeadLengthPercent);

      		//  maps domain values to a percent from 0..1
      		scale = d3.scale.linear()
      			.range([0,1])
      			.domain([0, 100]);

      		ticks = scale.ticks($scope.vis.params.majorTicks);
      		tickData = d3.range($scope.vis.params.majorTicks).map(function() {return 1/$scope.vis.params.majorTicks ;});

      		arc = d3.svg.arc()
      			.innerRadius(r - 60 - 20)
      			.outerRadius(r - 20)
      			.startAngle(function(d, i) {
      				var ratio = d * i;
      				return deg2rad(-90 + (ratio * range));
      			})
      			.endAngle(function(d, i) {
      				var ratio = d * (i+1);
      				return deg2rad(-90 + (ratio * range));
      			});
      	}
      	that.configure = configure;

      	function centerTranslation() {
      		return 'translate('+r +','+ r +')';
      	}

      	function render(newValue) {
          var container = div.append('div')
                         .attr('class', 'gauge_container');
          container.append('h3').text(name);
      		svg = container.append('svg:svg')
      				.attr('class', 'gauge')
      				.attr('width', 300)
      				.attr('height', 250);
          var centerTx = centerTranslation();

      		var arcs = svg.append('g')
      				.attr('class', 'arc')
      				.attr('transform', centerTx);

      		arcs.selectAll('path')
      				.data(tickData)
      			.enter().append('path')
      				.attr('fill', function(d, i) {
      					return config.arcColorFn(d * i);
      				})
      				.attr('d', arc);

           //number lable
           var lg = svg.append('g')
      				.attr('class', 'label')
      				.attr('transform', centerTx);
      		lg.selectAll('text')
      				.data(ticks)
      			.enter().append('text')
      				.attr('transform', function(d) {
      					var ratio = scale(d);
      					var newAngle = -90 + (ratio * range);
      					return 'rotate(' +newAngle +') translate(0,' +(10 - r) +')';
      				})
      				.text(config.labelFormat);


      		var lineData = [ [config.pointerWidth / 2, 0],
      						[0, -pointerHeadLength],
      						[-(config.pointerWidth / 2), 0],
      						[0, config.pointerTailLength],
      						[config.pointerWidth / 2, 0] ];
      		var pointerLine = d3.svg.line().interpolate('monotone');
      		var pg = svg.append('g').data([lineData])
      				.attr('class', 'pointer')
      				.attr('transform', centerTx);

      		pointer = pg.append('path')
      			.attr('d', pointerLine)
      			.attr('transform', 'rotate(' +(-90) +')');

      		update(newValue === undefined ? 0 : newValue);

          // display number (round off to the 2nd decimal place)
          svg.append('svg')
                   .append('text')
                   .style("font-size", "16px")
                   .attr('x',135)
                   .attr('y',200)
                   .text(newValue.toFixed(2)+'%');

        }
      	that.render = render;

      	function update(newValue, newConfiguration) {
      		if ( newConfiguration  !== undefined) {
      			configure(newConfiguration);
      		}
      		var ratio = scale(newValue);
      		var newAngle = -90 + (ratio * range);
      		pointer.transition()
      			.duration(config.transitionMs)
      			.ease('elastic')
      			.attr('transform', 'rotate(' +newAngle +')');
      	}
      	that.update = update;

      	configure();

      	return that;
      };
      gauge().render(root);
    };


    var _render = function (data, name) {
      _buildVis(data, name);
    };


    $scope.$watch('esResponse', function(resp) {
      d3.select(svgRoot).selectAll('svg').remove();
  		if (!resp) {
  			$scope.tags = null;
  			return;
  		}

  		var tagsAggId = $scope.vis.aggs.bySchemaName['segment'][0].id;    // = 2 or 3 ....

  		var metricsAgg = $scope.vis.aggs.bySchemaName['metric'][0]; //分子Dividend
      var metricsAgg2 = $scope.vis.aggs.bySchemaName['metric2'][0]; //分母Divisor
  		var buckets = resp.aggregations[tagsAggId].buckets;  //an object


      buckets.map(function(bucket) {
        console.log(bucket);
        var value = metricsAgg.getValue(bucket)*100/metricsAgg2.getValue(bucket);
        _render(value, bucket.key);
      });
  	});
  });
});
