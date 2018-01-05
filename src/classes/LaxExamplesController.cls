public class LaxExamplesController {

    @AuraEnabled
    public static List<Contact> getContacts() {
        return [
                SELECT Id, Name
                FROM Contact
                LIMIT 5
        ];
    }

    @AuraEnabled
    public static List<Account> getAccounts() {
        return [
                SELECT Id, Name
                FROM Account
                LIMIT 5
        ];
    }

    @AuraEnabled
    public static List<Opportunity> getOpportunities() {
        return [
                SELECT Id, Name
                FROM Opportunity
                LIMIT 5
        ];
    }

    @AuraEnabled
    public static String getParentValue() {
        return 'PARENT_VALUE';
    }

    @AuraEnabled
    public static String getDependentValue(String parentValue) {
        // use parent value somehow...
        return 'DEPENDENT_VALUE ' + parentValue;
    }

    @AuraEnabled
    public static String getActionBuilderResult(String prefix) {
        System.debug('\n\n prefix => ' + prefix + '\n');
        return prefix + '_ACTION_BUILDER_RESULT_STRING';
    }

    @AuraEnabled
    public static String getException() {
        throw new AuraHandledException('It is custom message from the exception');

        return 'This string will stay here forever';
    }

    @AuraEnabled
    public static String getIncomplete() {
        return 'You are online, switch of an internet connection using devtools to see expected result!';
    }

}