({
  onEvent: function (component, event, helper) {
    console.log('Handle Event', event.getParams());
    const payload = event.getParam('payload');
    component.set('v.handledEventType', payload.type);
  }
});