({
  onInit: function (component) {
    component.lax
      .action('c.getActionBuilderResult')
      .setStorable()
      .setParams({prefix: 'parameter'})
      .setThen(value => {
        console.log('Then callback...', 'setThen');
        component.set('v.result', value)
      })
      .setCatch(error => {
        console.log('Catch callback...', 'setCatch');
        console.error(error);
      })
      .setFinally(() => {
        console.log('Finally callback...', 'setFinally');
      })
      .enqueue();
  }
});