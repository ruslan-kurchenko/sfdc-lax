({
  onGetByEmail: function (component, event, helper) {
    const email = event.getParams().arguments.email;
    return component.lax.enqueue('c.getByEmail', { email: email });
  }
});