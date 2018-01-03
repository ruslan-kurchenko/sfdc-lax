({
  resolveMessage: function (component) {
component.lax.enqueue('c.getIncomplete')
  .then(message => {
    component.set('v.message', message);
  })
  .catch((errors, params) => {
    if (params.incomplete) {
        component.set('v.message', 'INCOMPLETE actions status has been caught, you are offline!')
    } else {
      console.log(errors);
    }
  })
  }
});