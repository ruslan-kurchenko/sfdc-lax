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
    const helper = this;

    const errors = helper.defineErrors();

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
          let message = 'Unknown error';

          const responseErrors = response.getError();
          if (responseErrors && Array.isArray(responseErrors) && responseErrors.length > 0) {
            message = responseErrors[0].message;
          }

          const errorConstructor = state === 'INCOMPLETE' ? errors.IncompleteActionError : errors.ApexActionError;
          reject(new errorConstructor(message, responseErrors, response));
        }
      };
    }

    const util = {
      /**
       * Create an object and bind it with passed in Promise prototype.
       * It has own chaining functions (<code>then</code>, <code>catch</code>),
       * with Aura context functionality. It allows to avoid of <code>$A.getCallback</code>
       * on callback functions.
       * @param promise {Promise}
       * @returns {LaxPromise}
       */
      createAuraContextPromise: function (promise) {
        const lp = Object.create(promise);
        Object.defineProperty(lp, '_contextPromise', {
          writable: false,
          configurable: false,
          enumerable: true,
          value: promise,
        });

        return Object.assign(lp, laxPromise);
      },

      assignCatchFilters: function (handleErrors, callback, promise) {
        return function routeError(error) {
          for (let i = 0; i < handleErrors.length; i++) {
            const errorType = handleErrors[i];
            if (errorType === Error ||
              (errorType != null && errorType.prototype instanceof Error)) {

              if (error instanceof errorType || error.name === errorType.name) {
                return util.tryCatch(callback).call(promise, error);
              }
            }
          }

          return Promise.reject(error);
        };
      },

      tryCatch: function (callback) {
        return function tryCallback() {
          try {
            return callback.apply(this, arguments);
          } catch (e) {
            return Promise.reject(e);
          }
        };
      },

      registerError: function (error) {
        errors[error.name] = error;
      },

      isApplicationEvent: function (eventName) {
        return eventName.indexOf('e.') === 0 && eventName.indexOf(':') > 0
      }
    };

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
       * @param onSuccess {Function|undefined} |
       * @param onError {Function=}
       * @returns {LaxPromise}
       */
      then: function (onSuccess, onError) {
        // TODO: check: is for valid functions?

        const promise = this._contextPromise.then(
          (onSuccess ?  $A.getCallback(onSuccess) : undefined),
          (onError ?  $A.getCallback(onError) : undefined)
        );

        return util.createAuraContextPromise(promise);
      },

      /**
       * The function to assign a failure callback on an action
       * @method
       * @name LaxPromise#catch
       * @param onError {Function}
       * @returns {LaxPromise}
       */
      catch: function (onError) {
        let promise;
        const len = arguments.length;
        if (len > 1) {
          const errorTypes = new Array(len - 1);
          for (let i = 0; i < len - 1; i++) {
            errorTypes[i] = arguments[i];
          }
          onError = arguments[len - 1];

          const filteredOnReject = util.assignCatchFilters(errorTypes, onError, this);
          promise = this.then(undefined, filteredOnReject);
        } else {
          promise = this.then(undefined, onError);
        }

        return util.createAuraContextPromise(promise);
      },

      finally: function (callback) {
        const promise = this._contextPromise.finally(callback);
        return util.createAuraContextPromise(promise);
      },

      /**
       *
       * @method
       * @name LaxPromise#error
       * @param onError {Function}
       * @returns {LaxPromise}
       */
      error: function (onError) {
        const fn = util.assignCatchFilters([errors.ApexActionError], onError, this);
        return this.then(undefined, fn);
      },

      /**
       *
       * @method
       * @name LaxPromise#incomplete
       * @param onIncomplete {Function}
       * @returns {LaxPromise}
       */
      incomplete: function (onIncomplete) {
        const fn = util.assignCatchFilters([errors.IncompleteActionError], onIncomplete, this);
        return this.then(undefined, fn);
      },
    };

    /**
     * Creates a unified function to assign it as a callback on the LDS action.
     * The returned function is a router for the result of the action.
     * @param resolve {Function} the function called if the action is success
     * @param reject {Function} the function called if the action is failed
     * @returns {Function}
     */
    function ldsActionRouter(resolve, reject) {
      return function(result) {
        if (result.state === 'SUCCESS' || result.state === 'DRAFT') {
          resolve(result);
        } else if (result.state === 'ERROR') {
          let message = 'Unknown error';

          if (result.error && Array.isArray(result.error) && result.error.length > 0) {
            message = result.error[0].message;
          }

          reject(new errors.ApexActionError(message, result.error, result));
        } else if (result.state === 'INCOMPLETE') {
          const message = 'You are currently offline.';
          reject(new errors.IncompleteActionError(message, result.error, result));
        } else {
          reject(new Error('Unknown action state'));
        }
      }
    }

    /**
     * The container of the actual Lightning Data Service (LDS). It delegates
     * actions to LDS and provide and API to chain them. Actions callback functions don't
     * require <code>$A.getCallback()</code> wrapper.
     * @typedef {Object} LaxDataService
     */
    const laxDataService = {

      /**
       * The function to save the record that loaded to LDS edit <code>EDIT</code> mode.
       * It used to create a record and save it or to save the changes to an existing one.
       * @see https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/data_service_save_record.htm
       * @name LaxDataService#saveRecord
       * @returns {LaxPromise}
       */
      saveRecord: function () {
        const self = this;
        const promise = new Promise(function (resolve, reject) {
          self._service.saveRecord(ldsActionRouter(resolve, reject));
        });

        return util.createAuraContextPromise(promise);
      },

      /**
       * The function to load a record template to the LDS <code>targetRecord</code> attribute.
       * It doesn't return a result to callback function.
       * It simply prepares an empty record and assigns it to the <code>targetRecord</code> attribute.
       * @param
       * @name LaxDataService#getNewRecord
       * @returns {LaxPromise}
       */

      /**
       * The function to load a record template to the LDS <code>targetRecord</code> attribute.
       * It doesn't return a result to callback function.
       * It simply prepares an empty record and assigns it to the <code>targetRecord</code> attribute.
       * @param sobjectType {String=} the object API name for the new record.
       * @param recordTypeId {String=} the 18 character ID of the record type for the new record.
       * If not specified, the default record type for the object is used, as defined in the user’s profile.
       * @param skipCache {Boolean=} whether to load the record template from the server instead of the
       * client-side Lightning Data Service cache. Defaults to false.
       * @name LaxDataService#getNewRecord
       * @returns {LaxPromise}
       */
      getNewRecord: function (sobjectType, recordTypeId, skipCache) {
        const self = this;
        const promise = new Promise(function (resolve, reject) {
          function getNewRecordCallback () {
            resolve();
          }

          self._service.getNewRecord(sobjectType, recordTypeId, skipCache, getNewRecordCallback);
        });

        return util.createAuraContextPromise(promise);
      },

      /**
       * The function to delete a record using LDS.
       * @name LaxDataService#deleteRecord
       * @returns {LaxPromise}
       */
      deleteRecord: function () {
        const self = this;
        const promise = new Promise(function (resolve, reject) {
          self._service.deleteRecord(ldsActionRouter(resolve, reject));
        });

        return util.createAuraContextPromise(promise);
      }
    };

    /**
     * The object based on builder pattern to call Aura action.
     * It is instantiated to be used by {@link Lax} as a prototype of actual actions.
     * This type of action does not use Promise approach and subsequently can be called as storable.
     * @typedef {Object} LaxActionBuilder
     */
    const laxActionBuilder = {

      /**
       * Assign the success callback on Aura action
       * @method
       * @name LaxActionBuilder#setThen
       * @param callback {Function}
       * @returns {LaxActionBuilder}
       */
      setThen: function setThen(callback) {
        this._resolveCallback = callback;
        return this;
      },

      /**
       * Assigns the failure callback on Aura action. This function called when the error occurs.
       * @method
       * @name LaxActionBuilder#setCatch
       * @param callback {Function}
       * @returns {LaxActionBuilder}
       */
      setCatch: function setCatch(callback) {
        this._rejectCallback = callback;
        return this;
      },

      /**
       * Sets parameters for the action.
       * @method
       * @name LaxActionBuilder#setParams
       * @param params {Object}
       * @returns {LaxActionBuilder}
       */
      setParams: function setParams(params) {
        this._action.setParams(params);
        return this;
      },

      /**
       * Marks the action as a {@link https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/controllers_server_storable_actions.htm|Storable}
       * @method
       * @name LaxActionBuilder#setStorable
       * @returns {LaxActionBuilder}
       */
      setStorable: function setStorable() {
        this._action.setStorable();
        return this;
      },

      /**
       * Marks the action as a {@link https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/controllers_server_background_actions.htm|Background}
       * @method
       * @name LaxActionBuilder#setBackground
       * @returns {LaxActionBuilder}
       */
      setBackground: function setBackground() {
        this._action.setBackground();
        return this;
      },

      /**
       * Enqueues the action. The function do not return the object itself and should be
       * called at the end of the builder chain.
       * @method
       * @name LaxActionBuilder#enqueue
       */
      enqueue: function enqueue() {
        this._action.setCallback(this._component, actionRouter(this._resolveCallback, this._rejectCallback));
        $A.enqueueAction(this._action);
      },

    };

    /**
     * The object based on builder pattern to fire Lightning Application or Component events.
     * @typedef {Object} LaxEventBuilder
     */
    const laxEventBuilder = {

      /**
       * Sets data for the event attributes. A parameter’s name must match the name attribute
       * of one of the event’s <code>aura:attribute</code> tags.
       * @name LaxEventBuilder#setParams
       * @param params {Object} the data of event attributes
       * @returns {LaxEventBuilder}
       */
      setParams: function setParams(params) {
        this._event.setParams(params);
        return this;
      },

      /**
       * Fires the event.
       * @name LaxEventBuilder#fire
       */
      fire: function fire() {
        this._event.fire();
      }

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
       * @param options {ActionOptions=} the object with list of options for the action
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

        return util.createAuraContextPromise(promise);
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

        return util.createAuraContextPromise(Promise.all(promises));
      },

      /**
       * Creates the action linked to {@link LaxActionBuilder} by the provided name.
       * @method
       * @name Lax#action
       * @param actionName {String} the name of the action (Apex controller method)
       * @returns {LaxActionBuilder}
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
        return Object.create(laxActionBuilder, props);
      },

      /**
       * Creates an object with {LaxEventBuilder} prototype with the context
       * event by provided name. The function apply Application and Component event name.
       * @name Lax#event
       * @param eventName {String} the name of the event
       * @returns {LaxEventBuilder}
       */
      event: function event(eventName) {
        const props = {
          _event: {
            writable: false,
            configurable: false,
            enumerable: false,
            value: util.isApplicationEvent(eventName) ? $A.get(eventName) : this._component.getEvent(eventName)
          }
        };
        return Object.create(laxEventBuilder, props);
      },

      /**
       * Creates a container of actual Lightning Data Service object.
       * @param id {String} the aura:id of the <code>force:record</code> (Lightning Data Service) tag
       * @returns {LaxDataService}
       */
      lds: function lds(id) {
        const service = this._component.find(id);
        const serviceProp = {
            _service: {
                writable: false,
                configurable: false,
                enumerable: false,
                value: service,
            },
        };

        return Object.create(laxDataService, serviceProp);
      },

      util: {
        registerError: util.registerError
      },

      errors: errors,
    };

    return lax;
  },

  defineErrors: function () {
    function ApexActionError(message, entries, action) {
      this.name = 'ApexActionError';
      this.message = message;
      this.entries = entries;
      this.action = action;
      this.stack = (new Error()).stack;
    }
    ApexActionError.prototype = Object.create(Error.prototype);
    ApexActionError.prototype.constructor = ApexActionError;


    function IncompleteActionError(message, entries, action) {
      this.name = 'IncompleteActionError';
      this.message = message;
      this.entries = entries;
      this.action = action;
      this.stack = (new Error()).stack;
    }
    IncompleteActionError.prototype = Object.create(Error.prototype);
    IncompleteActionError.prototype.constructor = IncompleteActionError;

    return {
      ApexActionError: ApexActionError,
      IncompleteActionError: IncompleteActionError
    };
  }
});

