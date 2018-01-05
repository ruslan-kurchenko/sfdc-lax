({
  resolveMessage: function (component) {
    component.lax.enqueue('c.getIncomplete')
      .then(message => {
        component.set('v.message', message);
      })
      .catch(errors => {
        console.log('it is catch handler, something goes wrong...', errors);
      })
  }
});