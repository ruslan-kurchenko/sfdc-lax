({
  onInit: function (component, event, helper) {
    helper
      .getValue(component)
      .then($A.getCallback(value => {
        component.set('v.value', value);
      }));
  }
});