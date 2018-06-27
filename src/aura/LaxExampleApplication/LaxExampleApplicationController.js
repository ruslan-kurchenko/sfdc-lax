({

  onLaxPrototypeInit: function () {
    console.log('onLaxPrototypeInit listener');

    return {
      apexAction: {
        onSuccess: function (response) {
          console.log('lax proto apex action handler success', response);
          return response;
        },
        onError: function (e) {
          console.log('lax proto apex action handler error', e);
          return e;
        }
      },
      createComponentAction: {
        onSuccess: function (component) {
          console.log('lax proto create component action handler success', component);
          return component;
        },
        onError: function (e) {
          console.log('lax proto create component action handler error', e);
          return e;
        }
      },
      ldsAction: {
        onSuccess: function (result) {
          console.log('lax proto lds action handler success', result);
          return result;
        },
        onError: function (e) {
          console.log('lax proto lds action handler error', e);
          return e;
        }
      }
    };
  }
});