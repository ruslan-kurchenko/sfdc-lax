({
  onInit: function (component, event, helper) {
    const email = 'john.doe@test.email.com';
    component.find('contactService')
      .getByEmail(email)
      .then(contact => {
        component.set('v.record', contact);
      });
  }
});