![Logo](https://github.com/ruslan-kurchenko/sfdc-lax/blob/master/assets/logo/logo-1280-676.png?raw=true)

Lax is a Lightning Component to write a clear asynchronous JavaScript code. It helps you to remove the boilerplate code in Lightning Components. Lax combines capabilities to efficiently call Apex with powerful exception handling and list of utility techniques, giving you an ability to write asynchronous code in a modern approach.

## Features

- `lax` gets the context of consumer component
- Supports the [Promise API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
    - Set server-side action callback (success, failure, incomplete)
    - Chain server-side actions
    - Perform multiple concurrent server-side actions
    - Call Lightning Data Service actions (create/save/delete)
    - Dynamically create components
- Construct and enqueue server-side action using Builder Pattern approach
- Construct and fire Application or Component event using Builder Pattern approach
- Automatically wraps callback by `$A.getCallback()`
- Use `lax` in consumer's component [aura:valueInit](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/ref_aura_valueInit.htm) event handler

## Installing

Click on the button below to deploy the component to the org

[![Deploy to Salesforce](https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/src/main/webapp/resources/img/deploy.png)](https://githubsfdeploy.herokuapp.com/app/githubdeploy/ruslan-kurchenko/sfdc-lax)
[![Deploy](https://deploy-to-sfdx.com/dist/assets/images/DeployToSFDX.svg)](https://deploy-to-sfdx.com)
## Usage

Define `lax` component in a custom component markup:
```xml
<!-- ContactsComponent.cmp -->
<aura:component controller="LaxExamplesController">
    <!-- Define lax component and pass consumer's component object as a context attribute (required) -->
    <c:lax context="{!this}" />
    
    <aura:attribute name="records" type="Contact[]" access="private"/>
    <aura:handler name="init" action="{!c.onInit}" value="{!this}" />
</aura:component>
```
Enqueue an action in component's [aura:valueInit](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/ref_aura_valueInit.htm) event handler function to get initial data:
```JavaScript
// ContactsComponentController.js
({
    onInit: function (component, event, helper) {
        // equeue getContacts server-side action and set the callback
        component.lax.enqueue('c.getContacts').then(contacts => {
            // $A.getCallback is not required. lax does it automatically
            component.set('v.records', contacts);
        });
    }
});
```
###### NOTE
- `lax` [automatically defines](https://github.com/ruslan-kurchenko/sfdc-lax/blob/master/src/aura/lax/laxHelper.js#L57) a property on the consumer's component ([context](https://github.com/ruslan-kurchenko/sfdc-lax/blob/master/src/aura/lax/laxHelper.js#L35)) object
- `lax` is ready to use in consumer's component [aura:valueInit](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/ref_aura_valueInit.htm) event handler
- Every consumer component has its own `lax` object. Every `lax` object [inherits](https://github.com/ruslan-kurchenko/sfdc-lax/blob/master/src/aura/lax/laxHelper.js#L47) methods from [grand parent](https://github.com/ruslan-kurchenko/sfdc-lax/blob/master/src/aura/lax/laxHelper.js#L233)

## API Reference
Navigate to component [API Reference](https://ruslan-kurchenko.github.io/sfdc-lax/) documentation to see full list of available functions and capabilities

## Examples

Actions can be enqueued by passing the relevant parameters and options.

##### `lax.enqueue(name[, params[, options]]).then(callback)` - call action with parameters, options and simple callback
```javascript
component.lax.enqueue('c.getContact', { id: recordId }, { background: true })
    .then(contact => {
        component.set('v.record', contact);
    });
```

###### NOTE
- `component` - A reference from a list of parameters that every client-side controller function has
- `params` - An object with list of parameters _(optional)_
- `options` - An object with list of options that can be applied to the action _(optional)_:
    - `background` - [to sent action separately from any foreground actions](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/controllers_server_background_actions.htm)
    - `abortable` - [to make action potentially abortable while it's queued to be sent to the server](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/controllers_server_abortable_actions.htm)
    - `storable` - [to quickly show action cached data from client-side storage without waiting for a server trip](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/controllers_server_storable_actions.htm). 
    It is not recommended to use with [Promise API by Salesforce](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/js_promises.htm). Use [lax.action](https://github.com/ruslan-kurchenko/sfdc-lax/blob/master/README.md#laxactionname---create-and-return-laxaction-builder) instead
- `.enqueue()` - The function returns [LaxPromise](https://github.com/ruslan-kurchenko/sfdc-lax/blob/master/src/aura/lax/laxHelper.js#L101) object which inherited from [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). It overrides `.then()` and `.catch()` function to automatically wrapper callback using `$A.getCallback()`.

##### `lax.enqueue(name[, params[, options]]).then(callback).catch(callback)` - handle errors thrown by the server
```javascript
component.lax.enqueue('c.save', { record: record })
    .then(id => {
        component.set('v.record.id', id);
    })
    .catch(errors => {
        console.error(errors);
    });
```

##### `lax.enqueue(name[, params[, options]]).then(callback).then(callback)` - performing multiple _chained_ actions
```javascript
component.lax.enqueue('c.getParentValue')
    .then(parentValue => {
        component.set('v.parentValue', parentValue);
        return component.lax.enqueue('c.getDependentValue', { parentValue: parentValue });
    })
    .then(dependentValue => {
        component.set('v.dependentValue', dependentValue);
    });
```

##### `lax.enqueueAll(actions).then(callback)` - performing multiple _concurrent_ actions
```javascript
component.lax.enqueueAll([
    // { name : '...', params: {...}, options: {...} }
    { name: 'c.getContacts' }, 
    { name: 'c.getAccounts' },
    { name: 'c.getOpportunities' }
])
.then(results => {
    // results: [ [contacts], [accounts], [opportunities] ]
    const contacts = results[0];
    const accounts = results[1];
    const opportunities = results[2];
});
```

###### NOTE
- `actions` - The array of actions to enqueue concurrently:
    - `name` - the name of an action
    - `params` - an object with list of parameters _(optional)_
    - `options` - an object with list of options that can be applied to the action _(optional)_
- The success callback will call when all enqueued actions be back from the server
- `results` - The list of values returned from enqueued actions 

##### `lax.action(name)` - create and return [LaxAction](https://github.com/ruslan-kurchenko/sfdc-lax/blob/master/src/aura/lax/laxHelper.js#L153) builder
```javascript
component.lax
    .action('c.getContact')
    .setStorable()
    .setParams({ id: recordId })
    .setThen(contact => {
        component.set('v.record', contact)
    })
    .setCatch(error => {
        console.error(error);
    })
    .enqueue();
```

###### NOTE
- `LaxAction` is an object with the list of functions to construct a server-side action
- The approach is useful for [Storable](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/controllers_server_storable_actions.htm) actions, because `LaxAction` does not use [Promise API](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
- Actions can't be chained or called concurrently using `LaxAction` builder approach
- The list of function available on `LaxAction`:
    - `setParams(params)` - set an object with list of parameters
    - `setThen(callback)` - set success callback function
    - `setCatch(callback)` - set failure callback function to handler server-side errors
    - `enqueue()` - enqueue constructed action. The only function `LaxAction` that return `undefined`
    - `setStorable()` - set an action as a [Storable](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/controllers_server_storable_actions.htm)
    - `setBackground()` - set an action as a [Background](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/controllers_server_background_actions.htm)


##### `lax.lds(id)` - create and return LaxDataService to execute Lightning Data Service (LDS) actions based on Promise API
```javascript
component.lax.lds('serviceAuraId');
```

##### `lax.lds(id).getNewRecord(sobjectType[, recordTypeId[, skipCache]])` - the function to load a record template to the LDS `targetRecord` attribute
```javascript
component.lax.lds('contactRecordCreator')
  .getNewRecord('Contact')
  .then(() => {
    const rec = component.get("v.newContact");
    const error = component.get("v.newContactError");

    if (error || (rec === null)) {
      console.log("Error initializing record template: " + error);
    }
  });
```

##### `lax.lds(id).saveRecord()` - the function to save the record that loaded to LDS in the edit `EDIT` mode
```javascript
component.lax.lds('recordHandler')
  .saveRecord()
  .then(result => {
    // handle "SUCCESS" or "DRAFT" state
  })
  .error(e => {
    // handle "ERROR" state
  })
  .incomplete(e => {
    // handle "INCOMPLETE" state
  })
```

##### `lax.lds(id).deleteRecord()` - the function to delete a record using LDS
```javascript
component.lax.lds('recordHandler')
  .deleteRecord()
  .then(result => {
    // handle "SUCCESS" or "DRAFT" state
  })
  .catch(e => {
    // handle "ERROR" or "INCOMPLETE" state. 
    // or you can use divided handlers: .error(), .incomplete()
  })
```

##### `lax.event(eventName)` - creates an object with `LaxEventBuilder` prototype and the context event by provided name
```javascript
// Fire Component Event:
component.lax.event('sampleComponentEvent')
  .setParams({payload: { type: 'COMPONENT'} })
  .fire();

// Fire Application Event:
component.lax.event('e.c:AppEvent')
  .setParams({payload: { type: 'APPLICATION'} })
  .fire();
```

##### `lax.createComponent(type[, attributes])` - creates a component from a type and a set of attributes
```javascript
component.lax.createComponent('aura:text', { value: 'Single Component Creation' })
  .then(result => {
    // result has a property "component" with created component
    single.set('v.body', result.component);
  })
  .catch(e => {
    // handle "ERROR" or "INCOMPLETE" state
  });
```

##### `lax.createComponent(type[, attributes])` - creates an array of components from a list of types and attributes
```javascript
lax.createComponents([
    ['aura:text', { value: 'Multiple Component Creation #1'}],
    ['aura:text', { value: 'Multiple Component Creation #2'}],
    ['aura:text', { value: 'Multiple Component Creation #3'}]
  ])
  .then(result => {
    // result has a property "components" with list of created components
    multiple.set('v.body', result.components);
  })
  .incomplete(e => {
    // handle "INCOMPLETE" state
  })
  .error(e => {
    // handle "ERROR" state
  });
```

## License

[MIT](https://github.com/ruslan-kurchenko/sfdc-lax/blob/master/docs/LICENSE)

