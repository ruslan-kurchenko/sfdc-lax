({
  onInit: function (component, event, helper) {
    component.lax.enqueue('c.getContacts').then(function (contacts) {
      component.set('v.records', contacts);
    });
  },

  onLaxInit: function () {
    console.log('onLaxInit listener');

    return {
      apexAction: {
        onSuccess: function (response) {
          console.log('lax apex action handler success', response);
          return response;
        },
        onError: function (e) {
          console.log('lax apex action handler error', e);
          return e;
        }
      }
    };
  }
});