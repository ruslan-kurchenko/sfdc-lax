({
  resolveMessage: function (component) {
    const errors = component.lax.errors;
    component.lax.enqueue('c.getIncomplete')
      .then(message => {
        console.log('Got a v.message from the server');
        component.set('v.message', message);
      })
      .then(() => {
        console.log('Calling c.getException...');
        return component.lax.enqueue('c.getException');
      })
      .then(() => {
        Promise.then()
        console.log('This String should never be displayed!');
      })
      .incomplete(e => {
        console.log('IncompleteActionError', e);
        component.set('v.message', 'Super, we have handled IncompleteActionError');
        null.f();
      })
      .error(e => {
        console.log('ApexActionError', e);
      })
      .catch(TypeError, (e) => {
        console.log('TypeError', e);
      })
      .then(() => {
        console.log('Throwing ReferenceError from valid context...');
        const a = abc;
      })
      .then(() => {
        console.log('This String should never be displayed!');
      })
      .catch(ReferenceError, e => {
        console.log('ReferenceError', e);
        var float = 1.2345;
        float.toFixed(123);
      })
      .catch(RangeError, e => {
        console.log('RangeError', e);
        decodeURI('%foo%bar%');
      })
      .catch(URIError, e => {
        console.log('URIError', e);
      })
  }
});