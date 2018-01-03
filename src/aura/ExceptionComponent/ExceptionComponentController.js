({
  onInit: function (component, event, helper) {
    component.lax.enqueue('c.getException')
      .then(result => {
        console.log('This statement will never be called', result);
      })
      .catch(errors => {
        component.set('v.message', errors[0].message);
      })
      .then(() => {
        return component.lax.enqueue('c.getContacts');
      })
      .then(contacts => {
        component.set('v.contacts', contacts);
      })
  }
});
