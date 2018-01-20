({
  onFire: function (component, event, helper) {
    component.lax.event('sampleComponentEvent').setParams({payload: { type: 'COMPONENT'} }).fire();
  }
});