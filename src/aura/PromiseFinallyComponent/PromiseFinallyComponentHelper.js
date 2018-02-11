({
  updateMessages: function (component, messages) {
    const prevMessages = component.get('v.messages');
    component.set('v.messages', messages.concat(prevMessages));
  }
});