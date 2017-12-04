# lax

The component to write a clear asynchronous Lightning Components JavaScript code with Promises

## Features

- `lax` gets the context of consumer component
- Supports the [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) API
    - Set server-side action callback (success and failure)
    - Chain server-side actions
    - Perform multiple concurrent server-side actions
- Construct server-side action using Builder Pattern approach
- Automatically wraps callback by `$A.getCallback()`
- Use `lax` in consumer's component [aura:valueInit](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/ref_aura_valueInit.htm) event handler

## Installing

Click on the button below to deploy the component to the org

[![Deploy to Salesforce](https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/src/main/webapp/resources/img/deploy.png)](https://githubsfdeploy.herokuapp.com/app/githubdeploy/ruslan-kurchenko/sfdc-lax)

## Example

Define `lax` component in a custom component markup:
```html
<!-- ContactsComponent.cmp -->
<aura:component controller="LaxExamplesController">
    <!-- Define lax component and pass consumer's component object as a context attribute (required) -->
    <c:lax context="{!this}" />
    
    <aura:attribute name="records" type="Contact[]" access="private"/>
    <aura:handler name="init" action="{!c.onInit}" value="{!this}" />
</aura:component>
```
Enqueue an action in component's init function to ge initial data:
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
- Every consumer component has its own `lax` object. Every `lax` object [inherits](https://github.com/ruslan-kurchenko/sfdc-lax/blob/master/src/aura/lax/laxHelper.js#L47) methods from [grand parent](https://github.com/ruslan-kurchenko/sfdc-lax/blob/master/src/aura/lax/laxHelper.js#L205)

### Define component
1. Call simple action:
    ```JavaScript
    onInit: function (component, event, helper) {
        component.lax.enqueue('c.getContacts').then((contacts) => {
            component.set('v.records', contacts);
        });
    }
    ```

2. Call a chained series of actions:
    ```javascript
    onInit: function (component, event, helper) {
        component.lax.enqueue('c.getParentValue')
            .then((parentValue) => {
                component.set('v.parentValue', parentValue);
                return component.lax.enqueue('c.getDependentValue', { parentValue: parentValue });
            })
            .then((dependentValue) => {
                component.set('v.dependentValue', dependentValue);
            });
    }
    ```

3. Call several actionы at a time and handle the result together:
    ```javascript
    onInit: function (component, event, helper) {
        component.lax.enqueueAll([
            // { name : '...', params: {...}, options: {...} }
            { name: 'c.getContacts' }, 
            { name: 'c.getAccounts' },
            { name: 'c.getOpportunities' }
        ])
        .then((results) => {
            // results: [ [contacts], [accounts], [opportunities] ]
            const contacts = results[0];
            const accounts = results[1];
            const opportunities = results[2];
        });
    }
    ```

4. Call single action using Builder Pattern approach (Useful for Storable actions):
    ```javascript
    onInit: function (component) {
        component.lax
            .action('c.getActionBuilderResult')
            .setStorable()
            .setParams({ prefix: 'parameter' })
            .setThen(value => {
                component.set('v.result', value)
            })
            .setCatch(error => {
                console.error(error);
            })
            .enqueue();
    }
    ```

## API Reference

> Comming soon...

## Tests

> Comming soon...

## Future plans

1. Fire Application or Component event in Builder Pattern approach
2. [Dynamically Create Component](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/js_cb_dynamic_cmp_async.htm) functionality with Promise callbacks

## License

MIT License

Copyright (c) 2017 Ruslan Kurchenko

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

