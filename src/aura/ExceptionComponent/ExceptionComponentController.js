({
  onInit: function (component, event, helper) {
    helper.callServer(component);
  },

  onCallServer: function (component, event, helper) {
    helper.callServer(component);
  },

  onLaxInit: function () {
    console.log('onLaxInit listener');

    return {
      apexAction: {
        onError: function (e) {
          console.log('ExceptionComponent apex action handler error', e);
          return e;
        }
      }
    };
  }

});
