module.exports = function (kibana) {
  return new kibana.Plugin({
    name:'gauge_0805',
    uiExports: {
      visTypes: ['plugins/gauge_0805/gauge_0805']
    }
  });
};
