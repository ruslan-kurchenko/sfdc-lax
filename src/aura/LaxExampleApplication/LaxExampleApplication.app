<aura:application extends="force:slds">
    <c:lax context="{!this}" />

    <aura:handler action="{!c.onInit}" name="init" value="{!this}" />

    <div class="slds-grid--vertical slds-grid--align-space slds-grid--vertical-align-top">
        <c:ContactList />
        <c:ChainActionsComponent />
        <c:EnqueueAllComponent />
        <c:ResolveComponent />
        <c:ActionBuilderComponent />
        <c:ExceptionComponent />
        <c:IncompleteComponent />
        <c:EventsHandlerComponent />
        <c:CreateCmpComponent />
    </div>
</aura:application>