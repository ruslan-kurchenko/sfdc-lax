/**
 * @license
 * MIT License
 * Copyright (c) 2017 Ruslan Kurchenko
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

({
  /**
   * Initialization function called every time lax component instantiated
   * @param component {Object} - the lax component object
   */
  init: function init(component) {
    /**
     * @namespace
     * @property {Lax} lax
     */
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
          reject(response);
        }
      };
    }

    /**
     * The container of the actual context promise.
     * It helps to call chain function (<code>then</code>, <code>catch</code>)
     * in the Aura context. The client can avoid of <code>$A.getCallback</code> calls.
     * @typedef {Object} LaxPromise
     */
    const laxPromise = {
      /**
       * The function to assign a success callback on an action
       * @method
       * @name LaxPromise#then
       * @param callback {Function}
       * @returns {LaxPromise}
       */
      then: function (callback) {
        const promise = this._contextPromise.then.call(this._contextPromise, $A.getCallback(callback));
        return createAuraContextPromise(promise);
      },

      /**
       * The function to assign a failure callback on an action
       * @method
       * @name LaxPromise#catch
       * @param callback {Function}
       * @returns {LaxPromise}
       */
      catch: function (callback) {
        const handler = function(response) {
          const state = response.getState();
          if (state === 'INCOMPLETE') {
            const errors = response.getError();
            const message = errors.length === 1 ? errors[0].message : 'Disconnected or Canceled';

            throw { name: 'IncompleteError', message: message };
          } else {
            callback(response.getError());
          }
        };

        const promise = this._contextPromise.catch.call(this._contextPromise, $A.getCallback(handler));
        return createAuraContextPromise(promise);
      },

      incomplete: function (callback) {
        const handler = function (error) {
          console.log('INCOMPLETE action handled!!!');
          callback();
        };

        const promise = this._contextPromise.catch.call(this._contextPromise, $A.getCallback(handler));
        return createAuraContextPromise(promise);
      }
    };

    /**
     * Create an object and bind it with passed in Promise prototype.
     * It has own chaining functions (<code>then</code>, <code>catch</code>),
     * with Aura context functionality. It allows to avoid of <code>$A.getCallback</code>
     * on callback functions.
     * @param promise {Promise}
     * @returns {LaxPromise}
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
     * @typedef {Object} LaxAction
     */
    const laxAction = {

      /**
       * Assign the success callback on Aura action
       * @method
       * @name LaxAction#setThen
       * @param callback {Function}
       * @returns {LaxAction}
       */
      setThen: function setThen(callback) {
        this._resolveCallback = callback;
        return this;
      },

      /**
       * Assigns the failure callback on Aura action. This function called when the error occurs.
       * @method
       * @name LaxAction#setCatch
       * @param callback {Function}
       * @returns {LaxAction}
       */
      setCatch: function setCatch(callback) {
        this._rejectCallback = callback;
        return this;
      },

      /**
       * Sets parameters for the action.
       * @method
       * @name LaxAction#setParams
       * @param params {Object}
       * @returns {LaxAction}
       */
      setParams: function setParams(params) {
        this._action.setParams(params);
        return this;
      },

      /**
       * Marks the action as a {@link https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/controllers_server_storable_actions.htm|Storable}
       * @method
       * @name LaxAction#setStorable
       * @returns {LaxAction}
       */
      setStorable: function setStorable() {
        this._action.setStorable();
        return this;
      },

      /**
       * Marks the action as a {@link https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/controllers_server_background_actions.htm|Background}
       * @method
       * @name LaxAction#setBackground
       * @returns {LaxAction}
       */
      setBackground: function setBackground() {
        this._action.setBackground();
        return this;
      },

      /**
       * Enqueues the action. The function do not return the object itself and should be
       * called at the end of the builder chain.
       * @method
       * @name LaxAction#enqueue
       */
      enqueue: function enqueue() {
        this._action.setCallback(this._component, actionRouter(this._resolveCallback, this._rejectCallback));
        $A.enqueueAction(this._action);
      },

    };

    /**
     * The action main object of the component that is used as a shared prototype across all lax components
     * created in the application. See <code>init</code> function of the laxHelper.js where the lax assigned as prototype.
     * @typedef {Object} Lax
     */
    const lax = {

      /**
       * The object with list of Aura action options
       * @typedef {{storable: Boolean=, background: Boolean=, abortable: Boolean=}} ActionOptions
       */

      /**
       * Enqueues the action by the name and with passed in params and options.
       * The function returns Promise, subsequently client can chain the actions
       * by assigning <code>then</code> callbacks or handle the error by <code>catch</code> callback.
       * @method
       * @name Lax#enqueue
       * @param actionName {String} the name of the action (Apex controller method name)
       * @param params {Object=} the object that contains parameters for the action
       * @param options {ActionOptions=} the object with list of
       * options for the action
       * @returns {LaxPromise}
       */
      enqueue: function enqueue(actionName, params, options) {
        const self = this;
        const promise = new Promise(function (resolve, reject) {
          const action = self._component.get(actionName);

          if (params) {
            action.setParams(params);
          }

          if (options) {
            if (options.background) action.setBackground();
            if (options.storable) action.setStorable();
          }

          action.setCallback(self._component, actionRouter(resolve, reject));
          $A.enqueueAction(action);
        });

        return createAuraContextPromise(promise);
      },

      /**
       * Enqueues the list of actions parallel.
       * The function return {@link Promise} that subsequently can be used to chain callback.
       * The success callback assigned on the {@link Promise} called after all actions ready and an error have not thrown.
       * @method
       * @name Lax#enqueueAll
       * @param actions {{name: String, params: Object=, options: ActionOptions=}[]}
       * @returns {LaxPromise}
       */
      enqueueAll: function enqueueAll(actions) {
        const self = this;
        const promises = actions.map(function (a) {
          return self.enqueue.call(self, a.name, a.params, a.options);
        });

        return createAuraContextPromise(Promise.all(promises));
      },

      /**
       * Creates the action linked to {@link LaxAction} by the provided name.
       * @method
       * @name Lax#action
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

