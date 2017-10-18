({
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
});