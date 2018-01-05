({
  onInit: function (component, event, helper) {
    // component.lax.enqueue('c.getContacts')
    //   .then(contacts => {
    //     component.set('v.contacts', contacts);
    //
    //     return component.lax.enqueue('c.getException');
    //   })
    //   .catch(function(errors) {
    //     component.set('v.message', errors[0].message);
    //   })
    //   .then(result => {
    //     console.log('This statement will never be called', result);
    //   })
    //   .catch(errors => {
    //     component.set('v.message', errors[0].message);
    //   })

    const errors = component.lax.errors;
    component.lax.enqueue('c.getException')
      .then(contacts => {
        component.set('v.contacts', contacts);
      })
      .catch(errors.ApexActionError, (e) => {
        console.log('apex error', e);
      })
      .catch(errors.IncompleteActionError, (e) => {
        console.log('incomplete error', e);
      });

  }
});
