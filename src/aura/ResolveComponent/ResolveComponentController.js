({
  onInit: function (component, event, helper) {
    component.lax
      .enqueue('c.getParentValue')
      .then(parentValue => {
        // do computation logic...
        return Promise.resolve('prefix - ' + parentValue);
      })
      .then(result => {
        component.set('v.resolvedValue', result);
        return 'static value returned';
      })
      .then(result => {
        component.set('v.secondResolvedValue', result);
      })
  }
});