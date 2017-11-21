({
  /**
   * Initialization function called every time lax component instantiated
   * @param component {Object} - the lax component object
   */
  init: function init(component) {
    const contextComponent = component.get('v.context');
    const laxProps = {
      _component: {
        writable: false,
        configurable: false,
        enumerable: false,
        value: contextComponent,
      },
    };

    // Create an object that is inherit all the functionality from
    // the Lax object due to prototype inheritance
    const lax = Object.create(this.getLax(), laxProps);


    // Create Lax property on the context component object that is refer on
    // newly created Lax object
    const componentProps = {
      writable: false,
      configurable: false,
      enumerable: false,
      value: lax,
    };
    Object.defineProperty(contextComponent, 'lax', componentProps);
  },

  /**
   * The function creates the lax object and save it on the handler.
   * It calls every time the lax instantiated, that is why the object is saved on helper.
   * @returns {Lax}
   */
  getLax: function getLax() {
    if (!this._lax) {
      this._lax = this.createLax();
    }

    return this._lax;
  },

  /**
   * Create the lax object to create initial prototype.
   * The function calls ones and when the first lax component in the app.
   * @returns {Lax}
   */
  createLax: function createLax() {
    /**
     * Creates a unified function to be assign as a callback on the aura action.
     * @param resolve {Function} the function called if the action is success
     * @param reject {Function} the function called if the action is failed
     * @returns {Function}
     */
    function actionRouter(resolve, reject) {
      return function (response) {
        const state = response.getState();

        if (state === 'SUCCESS') {
          resolve(response.getReturnValue());
        } else {
          reject(response.getError());
        }
      };
    }

    /**
     * The container of the actual context promise.
     * It helps to call chain function (<code>then</code>, <code>catch</code>)
     * in the Aura context. The client can avoid of <code>$A.getCallback</code> calls.
     * @type {{then: then, catch: catch}}
     */
    const laxPromise = {
      then: function (callback) {
        const promise = this._contextPromise.then.call(this._contextPromise, $A.getCallback(callback));
        return createAuraContextPromise(promise);
      },
      catch: function (callback) {
        const promise = this._contextPromise.catch.call(this._contextPromise, $A.getCallback(callback));
        return createAuraContextPromise(promise);
      },
    };

    /**
     * Create an object and bind it with passed in Promise prototype.
     * It has own chaining functions (<code>then</code>, <code>catch</code>),
     * with Aura context functionality. It allows to avoid of <code>$A.getCallback</code>
     * on callback functions.
     * @param promise {Promise}
     */
    function createAuraContextPromise(promise) {
      const props = Object.assign({}, laxPromise);
      Object.defineProperty(props, '_contextPromise', {
        writable: false,
        configurable: false,
        enumerable: true,
        value: promise,
      });

      return Object.assign(Object.create(promise), props);
    }

    /**
     * The object based on builder pattern to call Aura action.
     * It is instantiated to be used by {@link Lax} as a prototype of actual actions.
     * This type of action does not use Promise approach and subsequently can be called as storable.
     * @typedef {{setThen: setThen, setCatch: setCatch, setParams: setParams, setStorable: setStorable, setBackground: setBackground, enqueue: enqueue}} LaxAction
     */
    const laxAction = {

      /**
       * Assign the success callback on Aura action
       * @param callback {Function}
       * @returns {laxAction}
       */
      setThen: function setThen(callback) {
        this._resolveCallback = callback;
        return this;
      },

      /**
       * Assigns the failure callback on Aura action. This function called when the error occurs.
       * @param callback {Function}
       * @returns {laxAction}
       */
      setCatch: function setCatch(callback) {
        this._rejectCallback = callback;
        return this;
      },

      /**
       * Sets parameters for the action.
       * @param params {Object}
       * @returns {laxAction}
       */
      setParams: function setParams(params) {
        this._action.setParams(params);
        return this;
      },

      /**
       * Marks the action as a {@link https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/controllers_server_storable_actions.htm|Storable}
       * @returns {laxAction}
       */
      setStorable: function setStorable() {
        this._action.setStorable();
        return this;
      },

      /**
       * Marks the action as a {@link https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/controllers_server_background_actions.htm|Background}
       * @returns {laxAction}
       */
      setBackground: function setBackground() {
        this._action.setBackground();
        return this;
      },

      /**
       * Enqueues the action. The function do not return the object itself and should be
       * called at the end of the builder chain.
       */
      enqueue: function enqueue() {
        this._action.setCallback(this._component, actionRouter(this._resolveCallback, this._rejectCallback));
        $A.enqueueAction(this._action);
      },

    };

    /**
     * The action main object of the component that is used as a shared prototype across all lax components
     * created in the application. See <code>init</code> function of the laxHelper.js where the lax assigned as prototype.
     * @typedef {{enqueue: enqueue, enqueueAll: enqueueAll, action: action}} Lax
     */
    const lax = {

      /**
       * The object with list of Aura action options
       * @typedef {{storable: Boolean, background: Boolean, abortable: Boolean}} ActionOptions
       */

      /**
       * Enqueues the action by the name and with passed in params and options.
       * The function returns Promise, subsequently client can chain the actions
       * by assigning <code>then</code> callbacks or handle the error by <code>catch</code> callback.
       * @param actionName {String} the name of the action (Apex controller method name)
       * @param params {Object} the object that contains parameters for the action
       * @param options {ActionOptions} the object with list of
       * options for the action
       */
      enqueue: function enqueue(actionName, params, options) {
        const promise = new Promise(function (resolve, reject) {
          const action = this._component.get(actionName);

          if (params) {
            action.setParams(params);
          }

          if (options) {
            if (options.background) action.setBackground();
            if (options.storable) action.setStorable();
          }

          action.setCallback(this._component, actionRouter(resolve, reject));
          $A.enqueueAction(action);
        });

        return createAuraContextPromise(promise);
      },

      /**
       * Enqueues the list of actions parallel.
       * The function return {@link Promise} that subsequently can be used to chain callback.
       * The success callback assigned on the {@link Promise} called after all actions ready and an error have not thrown.
       * @param actions {{name: String, params: Object, options: ActionOptions}[]}
       */
      enqueueAll: function enqueueAll(actions) {
        const promises = actions.map(function (a) {
          return this.enqueue.call(this, a.name, a.params, a.options);
        });

        return createAuraContextPromise(Promise.all(promises));
      },

      /**
       * Creates the action linked to {@link LaxAction} by the provided name.
       * @param actionName {String} the name of the action (Apex controller method)
       * @returns {LaxAction}
       */
      action: function action(actionName) {
        const c = this._component;
        const props = {
          _component: {
            writable: false,
            configurable: false,
            enumerable: false,
            value: c,
          },
          _action: {
            writable: false,
            configurable: false,
            enumerable: false,
            value: c.get(actionName),
          },
        };
        return Object.create(laxAction, props);
      },

    };

    return lax;
  },

});

