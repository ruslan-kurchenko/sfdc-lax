({
  onInit: function (component, event, helper) {
    // Finally after .then()
    component.lax
      .enqueue('c.getContacts')
      .then(contacts => {
        console.log('Then before finally callback', contacts);
      })
      .finally(() => {
        console.log('Finally call after c.getContacts');
        helper.updateMessages(component, ['Success: Finally call after c.getContacts'])
      });

    // Finally after .catch()
    component.lax
      .enqueue('c.throwAuraHandledException')
      .then(() => {
        console.log('Then callback. This should never be called.')
      })
      .catch(e => {
        console.log('Catch before finally callback', e);
      })
      .finally(() => {
        console.log('Finally call after .catch() of c.throwAuraHandledException');
        helper.updateMessages(component, ['Success: Finally call after .catch() of c.throwAuraHandledException']);
      })
  }
});
