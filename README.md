## Lax

The component provides an ability to write a clear asynchronous Lightning Components JavaScript code.

The list of main benefits:
1. Every consumer component has its own reference of Lax component and vise-versa. It allows to write the code without passing component reference in every util function: `component.lax.enqueue('c.actionName')`;
2. The server-side actions calls can be chained: `component.lax.enqueue('c.actionName').then(...).then(...)`;
3. The list of server-side actions can be called together: `component.lax.enqueueAll([...]).then(...)`;
4. The action can be constructed and called using Builder Pattern approach: `component.lax.action('c.actionName).setThe(...).enqueue()` 
5. The consumer component can omit `$A.getCallback()`. Lax provide overrode Promise `then` and `catch` and they do that automarically: `component.lax.enqueue('c.actionName').then(...)`;
6. The consumer component doesn't wait `afterScriptsLoaded` event. It can use Lax in `onInit` event handler 

## Installation

Click on the button below to deploy the component's sources to the org.

[![Deploy to Salesforce](https://raw.githubusercontent.com/afawcett/githubsfdeploy/master/src/main/webapp/resources/img/deploy.png)](https://githubsfdeploy.herokuapp.com/app/githubdeploy/ruslan-kurchenko/sfdc-lax)

## Usage

Define Lax component in your custom component's markup:
```html
<aura:component>
    <c:lax context="{!this}" />
</aura:component>
```

List of available component attributes:

| Attribute | Description                                                 | Required |
|-----------|-------------------------------------------------------------|----------|
| `context` | A consumer component object which instantiate Lax component | `true`   |

Lax dynamically add a property on the consumer component `onInit` event.

Due to [Lightning Components Rendering Lifecycle](https://developer.salesforce.com/docs/atlas.en-us.lightning.meta/lightning/components_lifecycle.htm) nested components fire `onInit` event before the consumer component.

Then consumer component can use Lax in his own `onInit` action handler:

```html
<!-- ContactsComponent.cmp -->
<aura:component controller="LaxExamplesController">
    <c:lax context="{!this}" />
    <aura:attribute name="records" type="Contact[]" access="private"/>
    <aura:handler name="init" action="{!c.onInit}" value="{!this}" />
</aura:component>
```
```JavaScript
// ContactsComponentController.js
({
    onInit: function (component, event, helper) {
        component.lax.enqueue('c.getContacts').then((contacts) => {
            component.set('v.records', contacts);
        });
    }
});
```

#### Code examples:
The examples below include an information about how Lax can be used in consumer components JavaScript code (component Controller/Helper).

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

