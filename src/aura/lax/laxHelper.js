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
    const helper = this;
    // return lax if it is already instantiated
    if (this.lax) return this.lax;

    function LaxAction(component, actionName) {
      const action = component.get(actionName);
      let resolveCallback;
      let rejectCallback;

      function setThen(callback) {
        resolveCallback = callback;
        return this;
      }

      function setCatch(callback) {
        rejectCallback = callback;
        return this;
      }

      function setParams(params) {
        action.setParams(params);
        return this;
      }

      function setStorable() {
        action.setStorable();
        return this;
      }

      function setBackground() {
        action.setBackground();
        return this;
      }

      function enqueue() {
        action.setCallback(component, helper.ActionRouter(resolveCallback, rejectCallback));
        $A.enqueueAction(action);
      }

      return {
        setThen: setThen,
        setCatch: setCatch,
        setParams: setParams,
        setStorable: setStorable,
        setBackground: setBackground,
        enqueue: enqueue,
      };
    }

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

          action.setCallback(this.context, helper.ActionRouter(resolve, reject));
          $A.enqueueAction(action);
        }));
      }

      function enqueueAll(actions) {
        const promises = actions.map(a => enqueue.call(this, a.name, a.params, a.options));

        return Promise.all(promises);
      }

      function action(actionName) {
        return new LaxAction(this.context, actionName);
      }

      return {
        setContext: setContext,
        enqueue: enqueue,
        enqueueAll: enqueueAll,
        action: action,
      };
    }());

    return this.lax;
  },

  ActionRouter: function ActionRouter(resolve, reject) {
    return (response) => {
      const state = response.getState();

      if (state === 'SUCCESS') {
        resolve(response.getReturnValue());
      } else {
        reject(response.getError());
      }
    };
  },
});

