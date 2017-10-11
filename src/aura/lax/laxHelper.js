({
  init: function init(component) {
    // ready event
    console.log('Lax "init" function');


    // context component
    const context = component.get('v.context');
    const lax = this.getLax();

    // dynamic getter
    const laxGetter = function laxGetter() {
      lax.setContext(this);
      return lax;
    };
    Object.defineProperty(context, 'lax', { get: laxGetter });
  },

  getLax: function getLax() {
    // return lax if it is already instantiated
    if (this.lax) return this.lax;

    this.lax = (function Lax() {
      function setContext(component) {
        this.context = component;
      }

      function enqueue(actionName, params, options) {
        return new Promise($A.getCallback((resolve, reject) => {
          const action = this.context.get(actionName);

          if (params) {
            action.setParams(params);
          }

          if (options) {
            if (options.isBackground) action.setBackground();
            if (options.isStorable) action.setStorable();
          }

          action.setCallback(this.context, (response) => {
            const state = response.getState();

            if (this.context.isValid() && state === 'SUCCESS') {
              resolve(response.getReturnValue());
            } else {
              reject(response.getError());
            }
          });
          $A.enqueueAction(action);
        }));
      }

      function enqueueAll(actions) {
        const promises = actions.map(a => enqueue.call(this, a.name, a.params, a.options));

        return Promise.all(promises);
      }

      return {
        setContext: setContext,
        enqueue: enqueue,
        enqueueAll: enqueueAll,
      };
    }());

    return this.lax;
  },
});
