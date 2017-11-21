({
  init: function init(component) {
    const contextComponent = component.get('v.context'),
      props = {
        _component: {
          writable: false,
          configurable: false,
          enumerable: false,
          value: contextComponent
        }
      },
      lax = Object.create(this.getLax(), props);

    Object.defineProperty(contextComponent, 'lax', { get: function() { return lax; } });
  },

  getLax: function getLax() {
    if (!this._lax) {
      this._lax = this.createLax();
    }

    return this._lax;
  },

  createLax: function createLax() {

    function actionRouter(resolve, reject) {
      return (response) => {
        const state = response.getState();

        if (state === 'SUCCESS') {
          resolve(response.getReturnValue());
        } else {
          reject(response.getError());
        }
      };
    }

    function createAuraContextPromise(promise) {
      const props = Object.assign({}, laxPromise);
      Object.defineProperty(props, '_contextPromise', {
        writable: false,
        configurable: false,
        enumerable: true,
        value: promise
      });

      return Object.assign(Object.create(promise), props);
    }

    const laxPromise = {
      then: function(callback) {
         const promise = this._contextPromise.then.call(this._contextPromise, $A.getCallback(callback));
         return createAuraContextPromise(promise);
      },
      catch: function(callback) {
        const promise = this._contextPromise.catch.call(this._contextPromise, $A.getCallback(callback));
        return createAuraContextPromise(promise);
      }
    };

    const laxAction = {

      setThen: function setThen(callback) {
        this._resolveCallback = callback;
        return this;
      },

      setCatch: function setCatch(callback) {
        this._rejectCallback = callback;
        return this;
      },

      setParams: function setParams(params) {
        this._action.setParams(params);
        return this;
      },

      setStorable: function setStorable() {
        this._action.setStorable();
        return this;
      },

      setBackground: function setBackground() {
        this._action.setBackground();
        return this;
      },

      enqueue: function enqueue() {
        this._action.setCallback(this._component, actionRouter(this._resolveCallback, this._rejectCallback));
        $A.enqueueAction(this._action);
      }

    };

    const lax = {

      enqueue: function enqueue(actionName, params, options) {
        const promise = new Promise((resolve, reject) => {
          const action = this._component.get(actionName);

          if (params) {
            action.setParams(params);
          }

          if (options) {
            if (options.isBackground) action.setBackground();
            if (options.isStorable) action.setStorable();
          }

          action.setCallback(this._component, actionRouter(resolve, reject));
          $A.enqueueAction(action);
        });

        return createAuraContextPromise(promise);
      },

      enqueueAll: function enqueueAll(actions) {
        const promises = actions.map(a => this.enqueue.call(this, a.name, a.params, a.options));

        return createAuraContextPromise(Promise.all(promises));
      },

      action: function action(actionName) {
        const c = this._component,
          props = {
            _component: {
              writable: false,
              configurable: false,
              enumerable: false,
              value: c
            },
            _action: {
              writable: false,
              configurable: false,
              enumerable: false,
              value: c.get(actionName)
            }
          };
        return Object.create(laxAction, props);
      }

    };

    return lax;
  },

});

