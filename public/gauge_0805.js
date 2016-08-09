define(function (require) {
  require('ui/agg_table');
  require('plugins/gauge_0805/gauge_0805.less');
  require('plugins/gauge_0805/gauge_0805_controller');
  require('ui/registry/vis_types').register(MetricVisProvider);

  function MetricVisProvider(Private) {
    var TemplateVisType = Private(require('ui/template_vis_type/TemplateVisType'));
    var Schemas = Private(require('ui/Vis/Schemas'));


    return new TemplateVisType({
      name: 'gauge',
      title: 'Gauge with pointer',
      description: 'Gauge with pointer',
      icon: 'fa-tachometer',
      template: require('plugins/gauge_0805/gauge_0805.html'),
      params: {
        defaults: {
          titleGauge: null,
          labelGauge: null,
          heightGauge: 180,
          majorTicks: 5,
      	  colorleft: '#ff6666',
      	  colorright: '#3e6c0a',
        },
        editor: require('plugins/gauge_0805/gauge_0805_params.html')
      },
      schemas: new Schemas([
        {
          group: 'metrics',
          name: 'metric',
          title: 'Dividend',
          min: 1,
          max: 1,
          defaults: [
            { type: 'avg', schema: 'metric' }
          ]
        }
        ,
        {
          group: 'metrics',
          name: 'metric2',
          title: 'Divisor',
          min: 1,
          max: 1,
          defaults: [
            { type: 'count', schema: 'metric' }
          ]
        }
        ,
        {
          group: 'buckets',
          name: 'segment',
          title: 'buckets',
          min: 1,
          max: 1,
          aggFilter: ['terms']
        }

      ])
    });
  }
  return MetricVisProvider;
});
