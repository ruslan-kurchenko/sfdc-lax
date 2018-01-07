({
  callServer: function (component) {
    const errors = component.lax.errors;
    component.lax
      .enqueue('c.throwAuraHandledException')
      .catch(e => {
        console.log('AuraHandledException', e);
        this.updateMessages(component, e.entries.map(er => er.message));
        return component.lax.enqueue('c.throwDatabaseException')
      })
      .catch(e => {
        console.log('DatabaseException', e);
        this.updateMessages(component, e.entries.map(er => er.message));
        return component.lax.enqueue('c.throwIndexOfBoundException')
      })
      .catch(e => {
        this.updateMessages(component, e.entries.map(er => er.message));
        console.log('IndexOfBoundException', e);
      });

    function CustomClientError(message) {
      this.name = 'CustomClientError';
      this.message = message;
    }
    CustomClientError.prototype = Object.create(Error.prototype);
    CustomClientError.prototype.constructor = CustomClientError;
    component.lax.util.registerError(CustomClientError);

    component.lax
      .enqueue('c.throwAuraHandledException')
      .catch(e => {
        console.log('AuraHandledException', e);
        this.updateMessages(component, e.entries.map(er => er.message));

        throw new CustomClientError('This is custom client message');
      })
      .catch(errors.CustomClientError, (e) => {
        console.log(e.message);
      })
  },

  updateMessages: function (component, messages) {
    const prevMessages = component.get('v.messages');
    component.set('v.messages', messages.concat(prevMessages));
  }
});