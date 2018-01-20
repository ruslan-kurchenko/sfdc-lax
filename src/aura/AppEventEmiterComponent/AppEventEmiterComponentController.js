({
  onFire: function (component, event, helper) {
    component.lax.event('e.c:AppEvent').setParams({payload: { type: 'APPLICATION'} }).fire();
  }
});