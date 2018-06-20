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
          console.log('lax handler success', response);
          return response;
        },
        onError: function (e) {
          console.log('lax handler error', e);
          return e;
        }
      }
    };
  },

  onLaxPrototypeInit: function () {
    console.log('onLaxPrototypeInit listener');

    return {
      apexAction: {
        onSuccess: function (response) {
          console.log('lax proto handler success', response);
          return response;
        },
        onError: function (e) {
          console.log('lax proto handler error', e);
          return e;
        }
      }
    };
  }
});